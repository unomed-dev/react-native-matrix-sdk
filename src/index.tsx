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

import { NativeEventEmitter } from 'react-native';
import MatrixSdk from './NativeMatrixSdk';

// Client

export class Client {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.client_destroy(this.id);
  }

  displayName(): Promise<string> {
    return MatrixSdk.client_displayName(this.id);
  }

  logout(): Promise<string> {
    return MatrixSdk.client_logout(this.id);
  }

  restoreSession(session: Session): Promise<void> {
    return MatrixSdk.client_restoreSession(this.id, session);
  }

  session(): Session {
    return MatrixSdk.client_session(this.id) as Session;
  }

  async startSsoLogin(
    redirectUrl: string,
    idpId: string | undefined
  ): Promise<SsoHandler> {
    return new SsoHandler(
      await MatrixSdk.client_startSsoLogin(this.id, redirectUrl, idpId)
    );
  }

  syncService(): SyncServiceBuilder {
    return new SyncServiceBuilder(MatrixSdk.client_syncService(this.id));
  }

  userId(): string {
    return MatrixSdk.client_userId(this.id);
  }
}

// ClientBuilder

export class ClientBuilder {
  private id: string;

  constructor(id?: string) {
    this.id = id ?? MatrixSdk.clientBuilder_init();
  }

  destroy() {
    MatrixSdk.clientBuilder_destroy(this.id);
  }

  async build(): Promise<Client> {
    return new Client(await MatrixSdk.clientBuilder_build(this.id));
  }

  homeserverUrl(url: string): ClientBuilder {
    return new ClientBuilder(
      MatrixSdk.clientBuilder_homeserverUrl(this.id, url)
    );
  }

  passphrase(passphrase: string | null): ClientBuilder {
    return new ClientBuilder(
      MatrixSdk.clientBuilder_passphrase(this.id, passphrase)
    );
  }

  sessionPath(path: string): ClientBuilder {
    return new ClientBuilder(
      MatrixSdk.clientBuilder_sessionPath(this.id, path)
    );
  }

  slidingSyncProxy(slidingSyncProxy: string | null): ClientBuilder {
    return new ClientBuilder(
      MatrixSdk.clientBuilder_slidingSyncProxy(this.id, slidingSyncProxy)
    );
  }

  username(username: string): ClientBuilder {
    return new ClientBuilder(
      MatrixSdk.clientBuilder_username(this.id, username)
    );
  }
}

// RoomList

export class RoomList {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.roomList_destroy(this.id);
  }

  entries(listener: RoomListEntriesListener): RoomListEntriesResult {
    const result = MatrixSdk.roomList_entries(this.id, listener.id) as {
      entries: RoomListEntry[];
      entriesStreamId: string;
    };
    return {
      entries: result.entries,
      entriesStream: new TaskHandle(result.entriesStreamId),
    };
  }
}

// RoomListEntriesListener

export class RoomListEntriesListener {
  private _id: string;

  get id(): string {
    return this._id;
  }

  private onUpdate: (roomEntriesUpdate: RoomListEntriesUpdate) => void;

  constructor(onUpdate: (roomEntriesUpdate: RoomListEntriesUpdate) => void) {
    this._id = MatrixSdk.roomListEntriesListener_init();
    this.onUpdate = onUpdate;
    roomListEntriesListener_store.set(this.id, this);
  }

  destroy() {
    roomListEntriesListener_store.delete(this.id);
    MatrixSdk.roomListEntriesListener_destroy(this.id);
  }

  receive(event: any) {
    const roomEntriesUpdate = event?.roomEntriesUpdate as RoomListEntriesUpdate;
    if (!roomEntriesUpdate) {
      console.warn(`[RoomListEntriesListener] Ignoring unknown event ${event}`);
      return;
    }
    this.onUpdate(roomEntriesUpdate);
  }
}

// RoomListEntriesResult

export type RoomListEntriesResult = {
  entries: RoomListEntry[];
  entriesStream: TaskHandle;
};

// RoomListEntriesUpdate

export enum RoomListEntriesUpdateType {
  Append = 'append',
  Clear = 'clear',
  PushFront = 'pushFront',
  PushBack = 'pushBack',
  PopFront = 'popFront',
  PopBack = 'popBack',
  Insert = 'insert',
  Set = 'set',
  Remove = 'remove',
  Truncate = 'truncate',
  Reset = 'reset',
}

export type RoomListEntriesUpdateAppend = {
  type: RoomListEntriesUpdateType.Append;
  values: RoomListEntry[];
};

export type RoomListEntriesUpdateClear = {
  type: RoomListEntriesUpdateType.Clear;
};

export type RoomListEntriesUpdatePushFront = {
  type: RoomListEntriesUpdateType.PushFront;
  value: RoomListEntry;
};

export type RoomListEntriesUpdatePushBack = {
  type: RoomListEntriesUpdateType.PushBack;
  value: RoomListEntry;
};

export type RoomListEntriesUpdatePopFront = {
  type: RoomListEntriesUpdateType.PopFront;
};

export type RoomListEntriesUpdatePopBack = {
  type: RoomListEntriesUpdateType.PopBack;
};

export type RoomListEntriesUpdateInsert = {
  type: RoomListEntriesUpdateType.Insert;
  index: number;
  value: RoomListEntry;
};

export type RoomListEntriesUpdateSet = {
  type: RoomListEntriesUpdateType.Set;
  index: number;
  value: RoomListEntry;
};

export type RoomListEntriesUpdateRemove = {
  type: RoomListEntriesUpdateType.Remove;
  index: number;
};

export type RoomListEntriesUpdateTruncate = {
  type: RoomListEntriesUpdateType.Truncate;
  length: number;
};

export type RoomListEntriesUpdateReset = {
  type: RoomListEntriesUpdateType.Reset;
  values: RoomListEntry[];
};

export type RoomListEntriesUpdate =
  | RoomListEntriesUpdateAppend
  | RoomListEntriesUpdateClear
  | RoomListEntriesUpdatePushFront
  | RoomListEntriesUpdatePushBack
  | RoomListEntriesUpdatePopFront
  | RoomListEntriesUpdatePopBack
  | RoomListEntriesUpdateInsert
  | RoomListEntriesUpdateSet
  | RoomListEntriesUpdateRemove
  | RoomListEntriesUpdateTruncate
  | RoomListEntriesUpdateReset;

// RoomListEntry

export enum RoomListEntryType {
  Empty = 'empty',
  Invalidated = 'invalidated',
  Filled = 'filled',
}

export type RoomListEntryEmpty = {
  type: RoomListEntryType.Empty;
};

export type RoomListEntryInvalidated = {
  type: RoomListEntryType.Invalidated;
  roomId: string;
};

export type RoomListEntryFilled = {
  type: RoomListEntryType.Filled;
  roomId: string;
};

export type RoomListEntry =
  | RoomListEntryEmpty
  | RoomListEntryInvalidated
  | RoomListEntryFilled;

// RoomListService

export class RoomListService {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.roomListService_destroy(this.id);
  }

  async allRooms(): Promise<RoomList> {
    return new RoomList(await MatrixSdk.roomListService_allRooms(this.id));
  }

  state(listener: RoomListServiceStateListener): TaskHandle {
    return new TaskHandle(
      MatrixSdk.roomListService_state(this.id, listener.id)
    );
  }
}

// RoomListServiceState

export enum RoomListServiceState {
  Initial = 'initial',
  SettingUp = 'settingUp',
  Recovering = 'recovering',
  Running = 'running',
  Error = 'error',
  Terminated = 'terminated',
}

// RoomListServiceStateListener

export class RoomListServiceStateListener {
  private _id: string;

  get id(): string {
    return this._id;
  }

  private onUpdate: (state: RoomListServiceState) => void;

  constructor(onUpdate: (state: RoomListServiceState) => void) {
    this._id = MatrixSdk.roomListServiceStateListener_init();
    this.onUpdate = onUpdate;
    roomListServiceStateListener_store.set(this.id, this);
  }

  destroy() {
    roomListServiceStateListener_store.delete(this.id);
    MatrixSdk.roomListServiceStateListener_destroy(this.id);
  }

  receive(event: any) {
    const state = event?.state as RoomListServiceState;
    if (!state) {
      console.warn(
        `[RoomListServiceStateListener] Ignoring unknown event ${event}`
      );
      return;
    }
    this.onUpdate(state);
  }
}

// Session

export type Session = {
  accessToken: string;
  refreshToken: string | null;
  userId: string;
  deviceId: string;
  homeserverUrl: string;
  oidcData: string | null;
  slidingSyncProxy: string | null;
};

// SsoHandler

export class SsoHandler {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.ssoHandler_destroy(this.id);
  }

  finish(callbackUrl: string): Promise<void> {
    return MatrixSdk.ssoHandler_finish(this.id, callbackUrl);
  }

  url(): string {
    return MatrixSdk.ssoHandler_url(this.id);
  }
}

// SyncService

export class SyncService {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.syncService_destroy(this.id);
  }

  roomListService(): RoomListService {
    return new RoomListService(MatrixSdk.syncService_roomListService(this.id));
  }

  start(): Promise<void> {
    return MatrixSdk.syncService_start(this.id);
  }

  stop(): Promise<void> {
    return MatrixSdk.syncService_stop(this.id);
  }
}

// SyncServiceBuilder

export class SyncServiceBuilder {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.syncServiceBuilder_destroy(this.id);
  }

  async finish(): Promise<SyncService> {
    return new SyncService(await MatrixSdk.syncServiceBuilder_finish(this.id));
  }
}

// TaskHandle

export class TaskHandle {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    MatrixSdk.taskHandle_destroy(this.id);
  }

  cancel() {
    MatrixSdk.taskHandle_cancel(this.id);
  }

  isFinished(): boolean {
    return MatrixSdk.taskHandle_isFinished(this.id);
  }
}

// Event Handling

const emitter = new NativeEventEmitter(MatrixSdk);

const roomListEntriesListener_store = new Map<
  string,
  RoomListEntriesListener
>();
const roomListServiceStateListener_store = new Map<
  string,
  RoomListServiceStateListener
>();

emitter.addListener('RoomListService_stateUpdated', (event) => {
  roomListServiceStateListener_store.forEach((listener) =>
    listener.receive(event)
  );
});

// Misc

export function createRandomSessionDirectory(): string {
  return MatrixSdk.createRandomSessionDirectory();
}

export function sessionBaseDirectory(): string {
  return MatrixSdk.sessionBaseDirectory();
}
