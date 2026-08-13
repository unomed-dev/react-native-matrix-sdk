import { useCallback, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { StyleSheet, View, Text, TextInput, Button, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useMatrix, type Connection, type SessionData } from './use-matrix';
import { SyncServiceState } from '@unomed/react-native-matrix-sdk';

export default function App() {
  const [session, setSession] = useState<SessionData>();
  const [credentials, setCredentials] = useState<Partial<Credentials>>({
    url: 'https://matrix.org',
  });
  const {
    login, logout, connection,
    sync, syncStatus,
    rooms, contacts,
    error,
  } = useMatrix({ name: 'ExampleMatrixSdkApp', id: 'ExampleMatrixSdkApp' }, { get: () => Promise.resolve(session), set: async (data) => setSession(data ?? undefined) });

  const onLogin = useCallback(async (creds: Credentials) => {
    try {
      await login(creds);
    } catch (err) {
      console.error('Login failed:', err);
    }
  }, [login]);

  const callSync = useCallback(async () => {
    try {
      await sync();
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }, [sync]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {connection ? (
          <SessionInfo connection={connection} onLogout={logout} />
        ) : (
          <LoginForm value={credentials} onChange={setCredentials} onLogin={onLogin} />
        )}
        <View style={[styles.vStack, styles.widget]}>
          <SyncStatus syncStatus={syncStatus.state} />
          <Button title='Sync' onPress={callSync} />
        </View>
        {
          error
            ? <View style={[styles.vStack, styles.widget, { backgroundColor: 'red' }]}>
              <Text>{error.message}</Text>
              <Text>{error.details}</Text>
        </View>
          : null
        }
        <View style={styles.vStack}>
          {rooms.map((room) => (
            <View key={room.id()} style={[styles.vStack, { margin: 5 }]}>
              <Text>Room: {room.displayName()} ({room.id()})</Text>
            </View>
          ))}
        </View>
        <View style={styles.vStack}>
          {contacts.map((contact) => (
            <View key={contact.userId} style={[styles.vStack, { margin: 5 }]}>
              <Text>Contact: {contact.displayName} ({contact.userId})</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Credentials = { url: string, username: string, password: string };

const LoginForm = ({ value, onChange, onLogin }: {
  value: Partial<Credentials> | undefined;
  onChange: Dispatch<SetStateAction<Partial<Credentials>>>;
  onLogin: (credentials: Credentials) => void;
}) => {
  return <View style={[styles.vStack, styles.widget, { gap: 10 }]}>
      <Text style={{ fontWeight: 'bold' }}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Homeserver URL (e.g. https://matrix.org)"
        value={value?.url}
        onChangeText={(url) => onChange((old) => ({ ...old, url }))}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={value?.username}
        onChangeText={(username) => onChange((old) => ({ ...old, username }))}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={value?.password}
        onChangeText={(password) => onChange((old) => ({ ...old, password }))}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button title="Login" onPress={() => {
        const { url, username, password } = value || {};
        if (url && username && password) {
          onLogin({ url, username, password });
        } else {
          console.warn("Missing credentials", { url, username, password });
        }
      }} />
    </View>
}

const SessionInfo = ({ connection, onLogout }: { connection: Connection, onLogout: () => Promise<void> }) => {
  return <View style={styles.vStack}>
        <View style={[styles.hStack, { alignItems: 'center', gap: 10 }]}>
          <View style={[styles.vStack, { alignItems: 'flex-start', gap: 2 }]}>
            <Text>Connected</Text>
            <Text>to {connection.url}</Text>
            <Text>as {connection.session.userId}</Text>
          </View>
          {
            connection.avatarUrl
              ? <Image source={{ uri: connection.avatarUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              : <View style={{ width: 50, height: 50, borderRadius: 100, backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center' }}>
                <Text>{connection.session.userId.replaceAll('@', '').charAt(0).toUpperCase()}</Text>
              </View>
          }

        </View>
        <Button title="Logout" onPress={async () => {
          await onLogout();
        }} />
      </View>;
}

const SyncStatus = ({ syncStatus }: { syncStatus?: SyncServiceState }) => {
    if (!syncStatus || syncStatus === undefined) {
      return <Text>No sync status</Text>;
    }
    switch (syncStatus) {
      // case SyncServiceState.Idle:
      //   return <Text>Sync is idle</Text>;
      case SyncServiceState.Offline:
        return <Text>Offline</Text>;
      case SyncServiceState.Error:
        return <Text>Sync error</Text>;
      case SyncServiceState.Running:
        return <Text>Syncing...</Text>;
      case SyncServiceState.Terminated:
        return <Text>Sync terminated</Text>;
      default:
        return <Text>Unknown sync status</Text>;
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 40,
    gap: 4,
  },
  widget: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  vStack: {
    flexDirection: 'column',
    gap: 4,
  },
  hStack: {
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  }
});

