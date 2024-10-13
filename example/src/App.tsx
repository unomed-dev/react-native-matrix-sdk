import * as React from 'react';

import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { ClientBuilder } from '@unomed/react-native-matrix-sdk';

export default function App() {
  const [homeserver, setHomeserver] = React.useState("https://matrix.org");
  const [status, setStatus] = React.useState("");

  const updateHomeserverLoginDetails = React.useCallback(async () => {
    if (!homeserver.length) {
      setStatus("");
      return;
    }

    try {
      const client = await (new ClientBuilder()).homeserverUrl(homeserver).build(); 
      const loginDetails = await client.homeserverLoginDetails();

      setStatus(`url: ${loginDetails.url()}\n`
        + `supportsOidcLogin: ${loginDetails.supportsOidcLogin()}\n`
        + `supportsPasswordLogin: ${loginDetails.supportsPasswordLogin()}`);
    } catch (error) {
     setStatus(`${error}`);
    }
  }, [homeserver]);

  return (
    <View style={styles.container}>
      <TextInput value={homeserver} onChangeText={setHomeserver}></TextInput>
      <Button title='Go' onPress={updateHomeserverLoginDetails}></Button>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
