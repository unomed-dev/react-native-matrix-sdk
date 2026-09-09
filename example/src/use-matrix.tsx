import { createContext, useCallback, useContext, useRef, useState, type FunctionComponent, type PropsWithChildren } from "react";
import { MessageContent, Session, SyncServiceState, UserIdentity, UserProfile, type ClientLike, type Room, type RoomLike } from "@unomed/react-native-matrix-sdk";

import { type Media, loadMedia as _loadMedia } from "./matrix-lib/load-media";
import { type Credentials, login as _login } from "./matrix-lib/login";
import { synchronize as _synchronize, type Message } from "./matrix-lib/synchronize";

export { type Credentials, type Message };

export interface MatrixAPI {
    login: (credential: Credentials) => Promise<void>;
    synchronize: () => Promise<void>;
    synchronizeStatus: SyncServiceState;
    roomMap: Record<string, Room>; // room id -> room
    messageMap: Record<string, Message[]>; // room id -> message list
    spaceMap: Record<string, RoomLike>; // room id -> space
    userMap: Record<string, UserProfile>; // user id -> user
    loadMedia: (url: string | undefined) => Promise<Media | undefined>;
    session: Session | undefined;
}

const _useMatrix = (): MatrixAPI => {
    const clientRef = useRef<ClientLike | undefined>(undefined);
    const [{
        synchronizeStatus,
        roomMap,
        messageMap,
        spaceMap,
        session,
        userMap,
    }, setState] = useState({
        synchronizeStatus: SyncServiceState.Offline,
        roomMap: {},
        messageMap: {},
        spaceMap: {},
        userMap: {},
        session: undefined as (Session | undefined),
    });

    function getClient() {
        if (clientRef.current) {
            return clientRef.current;
        }
        throw new Error('No client available - login first!');
    }

    const login = useCallback(async (credentials: Credentials) => {
        const loginResponse = await _login(credentials, { id: 'example-app-id', name: 'MatrixSDKExampleApp' });
        clientRef.current = loginResponse.client;
        console.log('finished login', loginResponse);
        setState((old) => ({
            ...old,
            session: loginResponse.session,
        }));
    }, []);

    const synchronize = useCallback(async () => {
        const client = getClient();
        _synchronize(client, {
            onChange: (data) => {
                setState((old) => ({
                    ...old,
                    ...data, // maybe need to check for actual changes
                    messageMap: { // messages are run incrementally therefor each tick might be a seperate room
                        ...old.messageMap,
                        ...data.messageMap,
                    },
                }));
            },
        });
    }, []);

    const loadMedia = useCallback(async (url: string | undefined): Promise<Media | undefined> => {
        if (!url) {
            return undefined;
        }
        const client = getClient();
        return _loadMedia(client, url);
    }, []);

    return {
        login,
        synchronize,
        synchronizeStatus,
        roomMap,
        messageMap,
        spaceMap,
        userMap,
        session,
        loadMedia,
    };
}

const MatrixContext = createContext<MatrixAPI | null>(null);

export const MatrixProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const api = _useMatrix();
  return (<MatrixContext.Provider value={api}>{children}</MatrixContext.Provider>);
};

export const useMatrix = () => {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error('useMatrixContext must be used within MatrixProvider');
  return ctx;
};