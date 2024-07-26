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
import InAppBrowser from 'react-native-inappbrowser-reborn';

let client: Client | null = null;

let syncService: SyncService | null = null;

let roomListService: RoomListService | null = null;
let roomListServiceStateListener: RoomListServiceStateListener | null = null;
let roomListServiceStateTaskHandle: TaskHandle | null = null;

let allRoomsList: RoomList | null = null;
let allRoomsListEntriesListener: RoomListEntriesListener | null = null;
let allRoomsListEntriesTaskHandle: TaskHandle | null = null;

const buildClient = async () => {
  const builder = new ClientBuilder()
    .homeserverUrl('https://...')
    .sessionPath(createRandomSessionDirectory())
    .slidingSyncProxy('https://...');

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

  await syncService.start();
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

export default function App() {
  let [isLoading, setIsLoading] = React.useState(false);
  let [session, setSession] = React.useState<Session | null>(null);
  let [roomListServiceState, setRoomListServiceState] =
    React.useState<RoomListServiceState>(RoomListServiceState.Initial);
  let [rooms, setRooms] = React.useState<string[]>([]);

  const logInWithSso = React.useCallback(async () => {
    setIsLoading(true);

    client = await buildClient();

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

      await ssoHandler.finish(response.url);
      setSession(client.session());

      await startClient(async (state) => {
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

          setRooms(
            (
              result.entries.filter(
                (entry) => entry.type === RoomListEntryType.Filled
              ) as RoomListEntryFilled[]
            ).map((entry) => entry.roomId)
          );
        } else if (
          state != RoomListServiceState.Running &&
          roomListServiceState == RoomListServiceState.Running
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
    } finally {
      ssoHandler.destroy();
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
          {rooms.map((roomId) => (
            <View key={roomId}>
              <Text>{roomId}</Text>
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
