import { NavigationContainer } from '@react-navigation/native';

import { AppNavigationStack, CHAT, CHAT_LIST } from './AppNavigator';
import { ChatListScreen } from './ChatListScreen';
import { ChatScreen } from './ChatScreen';
import { LoginScreen } from './LoginScreen';

import { MatrixProvider, useMatrix } from './use-matrix';

function ExampleApp() {
  const { session } = useMatrix();

  if (!session) {
    return <LoginScreen />
  }

  return (
    <NavigationContainer>
      <AppNavigationStack.Navigator
        initialRouteName={CHAT_LIST}
        screenOptions={{
          headerShown: false,
        }}>
        <AppNavigationStack.Screen name={CHAT_LIST} component={ChatListScreen} />
        <AppNavigationStack.Screen name={CHAT} component={ChatScreen} />
      </AppNavigationStack.Navigator>
    </NavigationContainer>
  );
}


export default function App() {
  return (
    <MatrixProvider>
      <ExampleApp />
    </MatrixProvider>
  );
}
