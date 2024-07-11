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

// Misc

export function createRandomSessionDirectory(): string {
  return MatrixSdk.createRandomSessionDirectory();
}

export function sessionBaseDirectory(): string {
  return MatrixSdk.sessionBaseDirectory();
}
