import { type FunctionComponent } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHAT, type ChatListScreenProps } from './AppNavigator';
import { styles } from './styles';
import { useMatrix, type MatrixAPI } from './use-matrix';
import { Picture } from './Picture';
import { Footer } from './Footer';
import { roomWithNewestMessageFirst } from './matrix-lib/sort';

export const ChatListScreen: FunctionComponent<ChatListScreenProps> = ({ navigation }) => {
    const { roomMap, messageMap, spaceMap } = useMatrix();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {
                    Object.entries(roomMap)
                        .sort(([_idA,roomA],[_idB, roomB]) => roomWithNewestMessageFirst(roomA, roomB))
                        .map(([id, chat]) => <Pressable onPress={() => navigation.navigate(CHAT, { id })}>
                            <ChatRow chat={chat} messageList={messageMap[id] ?? []} space={spaceMap[id]?.displayName}/>
                        </Pressable>)
                }
            </ScrollView>
            <Footer />
        </SafeAreaView>
    );
}

type Chat = MatrixAPI['roomMap'][keyof MatrixAPI['roomMap']];
type MessageList = MatrixAPI['messageMap'][keyof MatrixAPI['messageMap']]
const ChatRow: FunctionComponent<{ chat: Chat, messageList: MessageList, space: string | undefined }> = ({ chat, messageList, space }) => {
    const lastMessage = messageList[messageList.length - 1];
    const unreadMessages = messageList.filter(({ isRead }) => !isRead);
    return <View>
        <Picture url={chat.avatarUrl()} style={[styles.picture, styles.pictureLarge]}/>
        <View>
            <View style={[styles.hStack, styles.hSpaceBetween, styles.vSpaceCenter]}>
                <Text>{chat.displayName()} {space ? `(${space})` : ''}</Text>
                <Text>{lastMessage?.timestamp.toLocaleString()}</Text>
            </View>
            <View style={[styles.hStack, styles.hSpaceBetween, styles.vSpaceBottom]}>
                <Text numberOfLines={2}>{lastMessage?.body}</Text>
                {
                    unreadMessages.length > 0
                    ? <View style={[styles.badge]}><Text>{unreadMessages.length}</Text></View>
                    : null
                }
            </View>
        </View>
    </View>
}