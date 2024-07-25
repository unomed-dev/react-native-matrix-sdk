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

// RoomListService

export class RoomListService {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  state(listener: RoomListServiceStateListener) {
    MatrixSdk.roomListService_state(this.id, listener.dispatcherId);
  }

  destroy() {
    MatrixSdk.roomListService_destroy(this.id);
  }
}

// RoomListServiceStateListener

export class RoomListServiceStateListener {
  private _dispatcherId: string;

  get dispatcherId(): string {
    return this._dispatcherId;
  }

  private onUpdate: (state: string) => void;

  constructor(onUpdate: (state: string) => void) {
    this._dispatcherId = MatrixSdk.roomListServiceStateEventDispatcher_init();
    this.onUpdate = onUpdate;
    roomListServiceStateListener_store.set(this._dispatcherId, this);
  }

  destroy() {
    roomListServiceStateListener_store.delete(this._dispatcherId);
    MatrixSdk.roomListServiceStateEventDispatcher_destroy(this._dispatcherId);
  }

  receive(event: any) {
    const state = event?.state;
    if (!state) {
      console.warn(
        `[RoomListServiceStateListener] Ignoring unknown event ${event}`
      );
      return;
    }
    this.onUpdate(state);
  }
}

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

// Event Handling

const emitter = new NativeEventEmitter(MatrixSdk);
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
