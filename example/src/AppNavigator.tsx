import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';

export const LOGIN = 'login';
export const CHAT_LIST = 'chat-list';
export const CHAT = 'chat';

export type AppNavigationType = {
    [LOGIN]: undefined;
    [CHAT_LIST]: undefined;
    [CHAT]: { id: string };
};

export type LoginScreenProps = NativeStackScreenProps<
    AppNavigationType,
    typeof LOGIN
>;
export type ChatListScreenProps = NativeStackScreenProps<
    AppNavigationType,
    typeof CHAT_LIST
>;
export type ChatScreenProps = NativeStackScreenProps<
    AppNavigationType,
    typeof CHAT
>;

export const AppNavigationStack =
  createNativeStackNavigator<AppNavigationType>();
