import { useState, type FunctionComponent } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { useMatrix, type Credentials } from './use-matrix';

export const LoginScreen: FunctionComponent<{ afterLogin?: () => void }> = ({ afterLogin }) => {
    const [loggingIn, setLoggingIn] = useState(false);
    const [credentials, setCredentials] = useState<Partial<Credentials>>({
        // url: 'https://matrix.org',
        // FIXME remote
        url: 'http://10.0.2.2:8008',
        username: '@mafo:my.matrix.host',
        password: 'test-friendsaver',
    });
    const { login } = useMatrix();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.vStack, styles.widget, { gap: 10 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Login</Text>
                    <TextInput
                        id='serverUrl'
                        style={styles.input}
                        placeholder="Homeserver URL (e.g. https://matrix.org)"
                        value={credentials.url}
                        onChangeText={(url) => setCredentials((old) => ({ ...old, url }))}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        id='username'
                        style={styles.input}
                        placeholder="Username"
                        value={credentials.username}
                        onChangeText={(username) => setCredentials((old) => ({ ...old, username }))}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        id='password'
                        style={styles.input}
                        placeholder="Password"
                        value={credentials.password}
                        onChangeText={(password) => setCredentials((old) => ({ ...old, password }))}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <Button disabled={loggingIn} title="Login" onPress={async () => {
                        const { url, username, password } = credentials;
                        if (url && username && password) {
                            setLoggingIn(true);
                            await login({ url, username, password });
                            afterLogin?.();
                        } else {
                            console.warn("Missing credentials", { url, username, password });
                        }
                        setLoggingIn(false);
                    }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}