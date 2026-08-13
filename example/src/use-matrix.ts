import { useCallback, useEffect, useRef, useState } from "react";
import { ClientBuilder, SyncServiceState, type ClientLike, Session, RoomMember, type RoomLike } from "@unomed/react-native-matrix-sdk";

export interface Connection {
    url: string;
    session: Session;
    avatarUrl?: string;
}

export interface MatrixAPI {
    login: (credential: { url: string, username: string, password: string }) => Promise<void>;
    logout: () => Promise<void>;
    connection?: Connection;
    sync: () => Promise<void>;
    syncStatus: { state?: SyncServiceState };
    rooms: RoomLike[];
    contacts: RoomMember[];
    error?: { message: string; details?: string };
}

export interface SessionData {
    url: string;
    session: Session;
}

export function useMatrix(
    device: { name: string; id: string } = { name: 'ReactNativeClient', id: 'ReactNativeClient' },
    /**
     * Session data to login directly on load.
     * Logout will call sessionData.set(null) to reset persistence.
     */
    sessionData: { get: () => Promise<SessionData | undefined>; set: (data: SessionData | null) => Promise<void> },
): MatrixAPI {
    const clientRef = useRef<ClientLike | undefined>(undefined);
    const [syncStatus, setSyncStatus] = useState<{ state?: SyncServiceState }>({});
    const [connection, setConnection] = useState<Connection>();
    const [rooms, setRooms] = useState<RoomLike[]>([]);
    const [contacts, setContacts] = useState<RoomMember[]>([]);
    const [error, setError] = useState<{ message: string; details?: string }>();

    const setConnectionState = useCallback(async (client: ClientLike): Promise<Connection> => {
        const session = await client.session();
        const url = client.homeserver();
        let avatarUrl = await client.cachedAvatarUrl();
        if (!avatarUrl) {
            try {
                avatarUrl = await client.avatarUrl();
            } catch (e) {
                const { msg, details } = (e as { inner: { msg: string; details: string; } }).inner;
                console.warn("Failed to fetch avatar URL:", msg, details);
            }
        }
        const connectionInfo = { url, session, avatarUrl };
        setConnection(connectionInfo);
        return connectionInfo;
    }, []);


    // --- session management ---
    const login = useCallback(async ({ url, username, password }: { url: string; username: string; password: string }) => {
        if (clientRef.current) {
            throw new Error("Matrix client is already initialized. Logout first!");
        }
        try {
            setError(undefined);
            const matrixClient = await new ClientBuilder().homeserverUrl(url).build();
            await matrixClient.login(
                username,
                password,
                device.name,
                device.id,
                undefined,
            );
            const { session } = await setConnectionState(matrixClient);
            sessionData.set({ url, session });
            clientRef.current = matrixClient;
        } catch (e) {
            if (Object.hasOwn(e as { inner: { msg: string; details: string } }, 'inner')) {
                const error = e as { inner: { msg: string; details: string } };
                setError({ message: error.inner.msg, details: error.inner.details });
            } else {
                setError(e as { message: string; details?: string });
            }
        }
    }, []);

    const logout = useCallback(async () => {
        if (!clientRef.current) {
            throw new Error("Matrix client is not initialized. Login first!");
        }
        await clientRef.current.logout();
        clientRef.current = undefined;
        sessionData.set(null);
    }, []);

    useEffect(() => {
        const initializeClient = async () => {
            const { url, session } = (await sessionData.get()) ?? {};
            if (url && session) {
                const matrixClient = await new ClientBuilder().homeserverUrl(url).build();
                await matrixClient.restoreSession(session);
                await setConnectionState(matrixClient);
                clientRef.current = matrixClient;
            }
        };
        initializeClient();
    }, []);

    // --- sync management ---
    const sync = useCallback(async () => {
        if (!clientRef.current) {
            throw new Error("Matrix client is not initialized. Login first!");
        }
        try {
            setError(undefined);
            const syncService = await clientRef.current.syncService()
                .withCrossProcessLock()
                .finish();
            syncService.state({
                onUpdate: (state) => {
                    setSyncStatus({ state });
                }
            });
            await syncService.start();
        } catch (e) {
            if (Object.hasOwn(e as { inner: { msg: string; details: string } }, 'inner')) {
                const error = e as { inner: { msg: string; details: string } };
                setError({ message: error.inner.msg, details: error.inner.details });
            } else {
                setError(e as { message: string; details?: string });
            }
        }
    }, []);

    // --- state management ---
    setInterval(async () => {
        if (clientRef.current) {
            const newRoomList = await clientRef.current.rooms();
            if (newRoomList.length !== rooms.length) {
                setRooms(newRoomList);
            }
            const newContacts = await Promise.all(
                newRoomList.map(async (room) => {
                    const members = await room.members();
                    const chunkSize = 50;
                    const contacts: RoomMember[] = [];
                    let chunk = members.nextChunk(chunkSize);
                    while (chunk && chunk.length > 0) {
                        contacts.push(...chunk);
                        chunk = await members.nextChunk(chunkSize);
                    }
                    return contacts;
                })
            );
            const flatContacts = newContacts.flat();
            if (flatContacts.length !== contacts.length) {
                setContacts(flatContacts);
            }
        }
    }, 5000);

    return {
        // --- session ---
        login,
        logout,
        connection,
        // --- sync ---
        sync,
        syncStatus,
        // --- state ---
        rooms,
        contacts,
        // --- error ---
        error,
    };
}
