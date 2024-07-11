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
  type Session,
} from 'react-native-matrix-sdk';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export default function App() {
  let [isLoading, setIsLoading] = React.useState(false);
  let [client, setClient] = React.useState<Client | null>(null);
  let [session, setSession] = React.useState<Session | null>(null);

  const buildClient = React.useCallback(async () => {
    const builder = new ClientBuilder()
      .homeserverUrl('https://...')
      .sessionPath(createRandomSessionDirectory());

    try {
      return await builder.build();
    } finally {
      builder.destroy();
    }
  }, []);

  const logInWithSso = React.useCallback(async () => {
    setIsLoading(true);

    const theClient = await buildClient();
    setClient(theClient);

    const ssoHandler = await theClient.startSsoLogin(
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
      setSession(theClient.session());
    } catch (e) {
      theClient.destroy();
      console.error(e);
    } finally {
      ssoHandler.destroy();
      setIsLoading(false);
    }
  }, [buildClient]);

  const logOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await client?.logout();
      client?.destroy();
      setClient(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

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
