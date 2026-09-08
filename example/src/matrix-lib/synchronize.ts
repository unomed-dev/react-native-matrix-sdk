import type { ClientLike, MessageContent, RoomLike, RoomMember, SpaceRoom, SyncServiceState } from "@unomed/react-native-matrix-sdk";

export type Message = { id: string, timestamp: Date, isRead: boolean, userId: string } & MessageContent;

export interface SynchronizeListener {
    onChange: (data: Partial<{
        synchronizeStatus: SyncServiceState;
        roomMap: Record<string, RoomLike>; // room id -> room
        messageMap: Record<string, Message[]>; // room id -> message list
        spaceMap: Record<string, SpaceRoom>; // room id -> space
        userMap: Record<string, RoomMember>; // user id -> user
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

let hasRunning = false;
async function triggerDataGather(client: ClientLike, listener: SynchronizeListener) {
    if (hasRunning) {
        console.warn('ignore data gatherer cause there is already a run!');
        return;
    }
    hasRunning = true;

    try {
        const spaceService = client.spaceService();
        const spaceList = await spaceService.joinedSpaces();
        const allRooms = client.rooms();
        const roomList = allRooms.filter((room) => !room.isSpace());
        const roomMap: Record<string, RoomLike> = {};
        const userMap: Record<string, RoomMember> = {};
        const spaceMap: Record<string, SpaceRoom> = {};
        const messageMap: Record<string, Message[]> = {};

        for (const space of spaceList) {
            const spaceRoomList = await spaceService.spaceRoomList(space.roomId);
            for (const childRoom of spaceRoomList.rooms()) {
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
                        userMap[member.userId] = member;
                    }
                }

                chunk = members.nextChunk(chunkSize);
            }
        }

        listener.onChange({
            roomMap,
            userMap,
            spaceMap,
            messageMap,
        });
    } finally {
        hasRunning = false;
    }
}
