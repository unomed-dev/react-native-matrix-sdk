import { type FunctionComponent } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHAT, type ChatListScreenProps } from './AppNavigator';
import { styles } from './styles';
import { useMatrix, type MatrixAPI } from './use-matrix';
import { Picture } from './Picture';
import { Footer } from './Footer';
import { roomWithNewestMessageFirst } from './matrix-lib/sort';
import { MessagePreview } from './ChatScreen';

export const ChatListScreen: FunctionComponent<ChatListScreenProps> = ({ navigation }) => {
    const { roomMap, messageMap, spaceMap, session, userMap } = useMatrix();
    const ownUserId = session?.userId;
    const ownUser = ownUserId ? userMap[ownUserId] : undefined;

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.hStack, styles.hSpaceCenter, styles.vSpaceCenter, { padding: 5 }]}>
                <Picture url={ownUser?.avatarUrl} style={[styles.picture, styles.pictureSmall]}/>
                <Text>{ownUser?.displayName}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 10 }}>
                {
                    Object.entries(roomMap)
                        .sort(([_idA,roomA],[_idB, roomB]) => roomWithNewestMessageFirst(roomA, roomB))
                        .map(([id, chat], index) => <Pressable key={chat.id()} onPress={() => navigation.navigate(CHAT, { id })} style={[
                            { paddingVertical: 5},
                            index === 0 ? { borderTopWidth: 1, borderTopColor: 'black'} : {},
                            { borderBottomWidth: 1, borderBottomColor: 'black' }
                            ]}>
                            <ChatRow chat={chat} messageList={messageMap[id] ?? []} space={spaceMap[id]?.displayName()}/>
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
    return <View style={[styles.hStack, { gap: 8, width: '100%' }]}>
        <Picture url={chat.avatarUrl()} style={[styles.picture, styles.pictureLarge]}/>
        <View style={[styles.vStack, styles.hSpaceCenter]}>
            <View style={[styles.hStack, styles.hSpaceBetween, styles.vSpaceCenter, { width: '100%' }]}>
                <Text>{chat.displayName()} {space ? `(${space.split(' ')[0]})` : ''}</Text>
                <Text>{lastMessage?.timestamp.toLocaleString()}</Text>
            </View>
            <View style={[styles.hStack, styles.hSpaceBetween, styles.vSpaceBottom]}>
                {
                    messageList.length > 0
                    ? <MessagePreview message={messageList[0]!} />
                    : <Text style={{fontStyle: 'italic'}}>no message</Text>
                }
                {
                    unreadMessages.length > 0
                    ? <View style={[styles.badge]}><Text>{unreadMessages.length}</Text></View>
                    : null
                }
            </View>
        </View>
    </View>
}
