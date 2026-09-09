import type { ClientLike, MessageContent, RoomLike, RoomMember, SpaceRoom, SyncServiceState, TimelineDiff, TimelineItemLike, UserProfile } from "@unomed/react-native-matrix-sdk";

export type Message = { id: string, timestamp: Date, isRead: boolean, userId: string } & MessageContent;

export interface SynchronizeListener {
    onChange: (data: Partial<{
        synchronizeStatus: SyncServiceState;
        roomMap: Record<string, RoomLike>; // room id -> room
        messageMap: Record<string, Message[]>; // room id -> message list
        spaceMap: Record<string, RoomLike>; // room id -> space
        userMap: Record<string, UserProfile>; // user id -> user
    }>) => void;
}

export async function synchronize(client: ClientLike, listener: SynchronizeListener) {
    client.subscribeToRoomInfo

    const syncService = await client.syncService()
        .withCrossProcessLock()
        .finish();
    const syncTask = syncService.state({
        onUpdate: (state) => {
            listener.onChange({ synchronizeStatus: state });
            triggerDataGather(client, listener);
        }
    });
    await syncService.start();
}

function toMessage(item: TimelineItemLike): Message | undefined {
    const event = item.asEvent();
    if (!event) {
        return undefined;
    }
    if (event.content.tag !== 'MsgLike') {
        return undefined;
    }

    const { kind } = event.content.inner.content;
    if (kind.tag !== 'Message') {
        return undefined;
    }

    const id = event.eventOrTransactionId.tag === 'EventId'
        ? event.eventOrTransactionId.inner.eventId
        : event.eventOrTransactionId.inner.transactionId;

    return {
        id,
        timestamp: new Date(Number(event.timestamp)),
        isRead: true, // TODO: derive from event.readReceipts once read state matters
        userId: event.sender,
        ...kind.inner.content,
    };
}

function applyDiff(items: Array<Message | undefined>, diff: TimelineDiff): Array<Message | undefined> {
    switch (diff.tag) {
        case 'Append':
            return [...items, ...diff.inner.values.map(toMessage)];
        case 'Clear':
            return [];
        case 'PushFront':
            return [toMessage(diff.inner.value), ...items];
        case 'PushBack':
            return [...items, toMessage(diff.inner.value)];
        case 'PopFront':
            return items.slice(1);
        case 'PopBack':
            return items.slice(0, -1);
        case 'Insert': {
            const next = [...items];
            next.splice(diff.inner.index, 0, toMessage(diff.inner.value));
            return next;
        }
        case 'Set': {
            const next = [...items];
            next[diff.inner.index] = toMessage(diff.inner.value);
            return next;
        }
        case 'Remove': {
            const next = [...items];
            next.splice(diff.inner.index, 1);
            return next;
        }
        case 'Truncate':
            return items.slice(0, diff.inner.length);
        case 'Reset':
            return diff.inner.values.map(toMessage);
        default:
            return items;
    }
}

const subscribedRoomIds = new Set<string>();

async function subscribeToRoomTimeline(room: RoomLike, listener: SynchronizeListener) {
    const roomId = room.id();
    if (subscribedRoomIds.has(roomId)) {
        return;
    }
    subscribedRoomIds.add(roomId);

    const timeline = await room.timeline();
    let items: Array<Message | undefined> = [];

    await timeline.addListener({
        onUpdate: (diffs) => {
            for (const diff of diffs) {
                items = applyDiff(items, diff);
            }

            const messageList = items.filter((message): message is Message => message !== undefined);
            listener.onChange({ messageMap: { [roomId]: messageList } });
        },
    });

    // timeline might be empty there we need to use pagination to get old messages
    const maxInitialPaginationRounds = 5;
    for (let round = 0; round < maxInitialPaginationRounds; round++) {
        const hitStartOfTimeline = await timeline.paginateBackwards(20);
        if (hitStartOfTimeline) {
            break;
        }
    }
}

let hasRunning = false;
async function triggerDataGather(client: ClientLike, listener: SynchronizeListener) {
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    if (hasRunning) {
        console.warn('ignore data gatherer cause there is already a run!');
        return;
    }
    hasRunning = true;

    try {
        const spaceService = client.spaceService();
        const allRooms = client.rooms();
        const roomList = allRooms.filter((room) => !room.isSpace());
        const spaceList = allRooms.filter((room) => room.isSpace());//await spaceService.joinedSpaces();
        const roomMap: Record<string, RoomLike> = {};
        const userMap: Record<string, UserProfile> = {};
        const spaceMap: Record<string, RoomLike> = {};

        for (const space of spaceList) {
            const spaceRoomList = await spaceService.spaceRoomList(space.id());

            let paginationState = spaceRoomList.paginationState();
            while (!(paginationState.tag === 'Idle' && paginationState.inner.endReached)) {
                await spaceRoomList.paginate();
                paginationState = spaceRoomList.paginationState();
            }

            const childRooms = spaceRoomList.rooms();
            for (const childRoom of childRooms) {
                spaceMap[childRoom.roomId] = space;
            }
        }

        for (const room of roomList) {
            roomMap[room.id()] = room;

            const members = await room.members();
            const chunkSize = 50;
            let chunk = members.nextChunk(chunkSize);
            while (chunk && chunk.length > 0) {
                for (const member of chunk) {
                    if (!userMap[member.userId]) {
                        userMap[member.userId] = await client.getProfile(member.userId);
                    }
                }

                chunk = members.nextChunk(chunkSize);
            }

            await subscribeToRoomTimeline(room, listener);
        }

        listener.onChange({
            roomMap,
            userMap,
            spaceMap,
        });
    } finally {
        hasRunning = false;
    }
}
