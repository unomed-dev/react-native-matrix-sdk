import { type FunctionComponent } from 'react';
import { Button, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ChatScreenProps } from './AppNavigator';
import { styles } from './styles';
import { useMatrix, type Message } from './use-matrix';
import { Picture } from './Picture';
import { Footer } from './Footer';
import { newestMessageLast } from './matrix-lib/sort';

export const ChatScreen: FunctionComponent<ChatScreenProps> = ({ navigation, route }) => {
  const chatId = route.params.id;
  const { roomMap, messageMap } = useMatrix();
  const room = roomMap[chatId]!; // if you hit this route the room will exists
  const messageList = messageMap[chatId] ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Pressable style={[styles.buttonBubble]} onPress={() => navigation.goBack()}>
          <Text>&lt;</Text>
        </Pressable>
        <View>
          <Picture url={room.avatarUrl()} />
          <Text>{room.displayName()}</Text>
        </View>
        <View style={[{ width: 20, height: 20 }]} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {
          messageList
            .sort(newestMessageLast)
            .map((message) => <MessageRow key={message.id} message={message} />)
        }
      </ScrollView>
      <TextInput placeholder='your message' />
      <Footer />
    </SafeAreaView>
  );
}

export const MessageRow: FunctionComponent<{ message: Message }> = ({ message }) => {
  const { session, userMap } = useMatrix();
  const isOwnMessage = message.userId === session?.userId;
  const user = userMap[message.userId];

  if (isOwnMessage) {
    return <View style={[styles.messageBubble, { marginLeft: 20 }]}>
        <Text>{message.body}</Text>
    </View>
  }

  return <View style={[styles.hStack]}>
      <Picture url={user!.avatarUrl} />
      <View style={[styles.messageBubble, { marginRight: 10 }]}>
        <Text style={[styles.bold]}>{user?.displayName}</Text>
        <Text>{message.body}</Text>
      </View>
  </View>
}