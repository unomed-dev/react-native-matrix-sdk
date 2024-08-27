// Copyright 2024 Unomed AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';

import {
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native';
import {
  Client,
  ClientBuilder,
  createRandomSessionDirectory,
  RoomList,
  RoomListEntriesListener,
  RoomListEntryType,
  RoomListService,
  RoomListServiceState,
  RoomListServiceStateListener,
  SyncService,
  TaskHandle,
  type RoomListEntryFilled,
  type Session,
} from 'react-native-matrix-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { v4 as uuid } from 'uuid';

const HOMESERVER = '...';
const SLIDING_SYNC_PROXY = '...';

let client: Client | null = null;

let syncService: SyncService | null = null;

let roomListService: RoomListService | null = null;
let roomListServiceStateListener: RoomListServiceStateListener | null = null;
let roomListServiceStateTaskHandle: TaskHandle | null = null;

let allRoomsList: RoomList | null = null;
let allRoomsListEntriesListener: RoomListEntriesListener | null = null;
let allRoomsListEntriesTaskHandle: TaskHandle | null = null;

type Credentials = {
  homeserverUrl: string;
  sessionPath: string;
  username: string;
  passphrase: string;
  session?: Session;
};

const getCredentials = async () => {
  const json = await AsyncStorage.getItem('mx_session');
  return json ? (JSON.parse(json) as Credentials) : null;
};

const storeCredentials = async (credentials: Credentials) => {
  await AsyncStorage.setItem('mx_session', JSON.stringify(credentials));
};

// const clearCredentials = async () => {
//   await AsyncStorage.removeItem('mx_session');
// };

const buildClient = async () => {
  const builder = new ClientBuilder()
    .homeserverUrl(HOMESERVER)
    .sessionPath(createRandomSessionDirectory())
    .slidingSyncProxy(SLIDING_SYNC_PROXY);

  try {
    return await builder.build();
  } finally {
    builder.destroy();
  }
};

const startClient = async (
  onRoomListServiceStateUpdate: (state: RoomListServiceState) => void
) => {
  if (!client) {
    return;
  }

  console.log('Creating SyncService...');
  const syncServiceBuilder = client.syncService();
  syncService = await syncServiceBuilder.finish();
  syncServiceBuilder.destroy();

  roomListServiceStateListener = new RoomListServiceStateListener(
    onRoomListServiceStateUpdate
  );
  roomListService = syncService.roomListService();
  roomListServiceStateTaskHandle = roomListService.state(
    roomListServiceStateListener
  );

  console.log('Starting SyncService...');
  await syncService.start();
  console.log('SyncService started...');
};

const destroyClient = async () => {
  allRoomsListEntriesTaskHandle?.cancel();
  allRoomsListEntriesTaskHandle?.destroy();
  allRoomsListEntriesTaskHandle = null;

  allRoomsListEntriesListener?.destroy();
  allRoomsListEntriesListener = null;

  allRoomsList?.destroy();
  allRoomsList = null;

  roomListServiceStateTaskHandle?.cancel();
  roomListServiceStateTaskHandle = null;

  roomListServiceStateListener?.destroy();
  roomListServiceStateListener = null;

  roomListService?.destroy();
  roomListService = null;

  await syncService?.stop();
  syncService?.destroy();
  syncService = null;

  client?.logout();
  client?.destroy();
  client = null;
};

type RoomViewModel = {
  id: string;
  name: string | null;
  latestEventTimestamp: number | null;
};

export default function App() {
  let [isLoading, setIsLoading] = React.useState(false);
  let [session, setSession] = React.useState<Session | null>(null);
  let [roomListServiceState, setRoomListServiceState] =
    React.useState<RoomListServiceState>(RoomListServiceState.Initial);
  let [rooms, setRooms] = React.useState<RoomViewModel[]>([]);

  const logInWithSso = React.useCallback(async () => {
    setIsLoading(true);

    const credentials: Credentials = (await getCredentials()) ?? {
      homeserverUrl: HOMESERVER,
      sessionPath: createRandomSessionDirectory(),
      username: uuid(),
      passphrase: uuid(),
    };

    client = await buildClient();

    if (credentials.session) {
      await client.restoreSession(credentials.session);
    } else {
      const ssoHandler = await client.startSsoLogin(
        'unomed.example://Main',
        undefined
      );

      try {
        const response = await InAppBrowser.openAuth(
          ssoHandler.url(),
          'unomed.example://Main',
          {
            ephemeralWebSession: false,
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          }
        );

        if (response.type !== 'success') {
          throw 'SSO login failed';
        }

        console.log('Finishing SSO login...');
        await ssoHandler.finish(response.url);
        console.log('SSO login finished...');
        setSession(client.session());

        credentials.session = client.session();
        await storeCredentials(credentials);
      } catch (e) {
        destroyClient();
        console.error(e);
        setIsLoading(false);
        return;
      } finally {
        ssoHandler.destroy();
      }
    }

    try {
      console.log('Starting client...');
      await startClient(async (state) => {
        console.log(`RoomListService switched to state ${state}`);
        if (
          state === RoomListServiceState.Running &&
          roomListServiceState !== RoomListServiceState.Running
        ) {
          allRoomsListEntriesListener = new RoomListEntriesListener(
            (roomEntriesUpdate) => {
              console.log(
                `RoomListEntriesListener fired: ${roomEntriesUpdate}`
              );
            }
          );

          allRoomsList = await roomListService!.allRooms();
          const result = allRoomsList.entries(allRoomsListEntriesListener);
          allRoomsListEntriesTaskHandle = result.entriesStream;

          const filledEntries = result.entries.filter(
            (entry) => entry.type === RoomListEntryType.Filled
          ) as RoomListEntryFilled[];

          const roomListItems = filledEntries.map((entry) =>
            roomListService!.room(entry.roomId)
          );

          for (const item of roomListItems) {
            if (!item.isTimelineInitialized()) {
              await item.initTimeline();
            }
          }
          // await Promise.allSettled(roomListItems.filter(item => !item.isTimelineInitialized()).map(item => item.initTimeline()));

          const latestEvents = (
            await Promise.allSettled(
              roomListItems.map((item) => item.latestEvent())
            )
          ).map((promiseResult) =>
            promiseResult.status === 'fulfilled' ? promiseResult.value : null
          );

          setRooms(
            roomListItems.map((item, index) => ({
              id: item.id(),
              name: item.displayName(),
              latestEventTimestamp: latestEvents[index]?.timestamp() ?? null,
            }))
          );

          roomListItems.forEach((item) => item.destroy());
          latestEvents.forEach((event) => event?.destroy());
        } else if (
          state !== RoomListServiceState.Running &&
          roomListServiceState === RoomListServiceState.Running
        ) {
          allRoomsListEntriesTaskHandle?.cancel();
          allRoomsListEntriesTaskHandle?.destroy();
          allRoomsListEntriesTaskHandle = null;

          allRoomsListEntriesListener?.destroy();
          allRoomsListEntriesListener = null;

          allRoomsList?.destroy();
          allRoomsList = null;
        }
        setRoomListServiceState(state);
      });
    } catch (e) {
      destroyClient();
      console.error(e);
      return;
    } finally {
      setIsLoading(false);
    }
  }, [roomListServiceState]);

  const logOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      destroyClient();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!session && <Button title="Log in with SSO" onPress={logInWithSso} />}
      {session && (
        <View style={styles.box}>
          <Text style={styles.label}>Access token</Text>
          <Text>{session.accessToken}</Text>
          <Text style={styles.label}>RoomListService state</Text>
          <Text>{roomListServiceState}</Text>
          <Text style={styles.label}>Rooms</Text>
          {rooms.map((room) => (
            <View key={room.id}>
              <Text>{room.name}</Text>
              {room.latestEventTimestamp && (
                <Text>({room.latestEventTimestamp})</Text>
              )}
            </View>
          ))}
          <Button title="Log out" onPress={logOut} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
  },
});
