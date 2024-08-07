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

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Client

  client_destroy(id: string): void;

  client_displayName(id: string): Promise<string>;
  client_logout(id: string): Promise<string>;
  client_restoreSession(id: string, session: Object): Promise<void>;
  client_session(id: string): Object;
  client_startSsoLogin(
    id: string,
    redirectUrl: string,
    idpId: string | undefined
  ): Promise<string>;
  client_syncService(id: string): string;
  client_userId(id: string): string;

  // ClientBuilder

  clientBuilder_init(): string;
  clientBuilder_destroy(id: string): void;

  clientBuilder_build(id: string): Promise<string>;
  clientBuilder_homeserverUrl(id: string, url: string): string;
  clientBuilder_passphrase(id: string, passphrase: string | null): string;
  clientBuilder_sessionPath(id: string, path: string): string;
  clientBuilder_slidingSyncProxy(
    id: string,
    slidingSyncProxy: string | null
  ): string;
  clientBuilder_username(id: string, username: string): string;

  // RoomList

  roomList_destroy(id: string): void;

  roomList_entries(id: string, listenerId: string): Object;

  // RoomListEntriesListener

  roomListEntriesListener_init(): string;
  roomListEntriesListener_destroy(id: string): void;

  // RoomListService

  roomListService_destroy(id: string): void;

  roomListService_allRooms(id: string): Promise<string>;
  roomListService_state(id: string, listenerId: string): string;

  // RoomListServiceStateListener

  roomListServiceStateListener_init(): string;
  roomListServiceStateListener_destroy(id: string): void;

  // SsoHandler

  ssoHandler_destroy(id: string): void;

  ssoHandler_finish(id: string, callbackUrl: string): Promise<void>;
  ssoHandler_url(id: string): string;

  // SyncService

  syncService_destroy(id: string): void;

  syncService_roomListService(id: string): string;
  syncService_start(id: string): Promise<void>;
  syncService_stop(id: string): Promise<void>;

  // SyncServiceBuilder

  syncServiceBuilder_destroy(id: string): void;

  syncServiceBuilder_finish(id: string): Promise<string>;

  // TaskHandle

  taskHandle_destroy(id: string): void;

  taskHandle_cancel(id: string): void;
  taskHandle_isFinished(id: string): boolean;

  // Event Handling

  addListener(eventType: string): void;
  removeListeners(count: number): void;

  // Misc

  createRandomSessionDirectory(): string;
  sessionBaseDirectory(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MatrixSdk');
