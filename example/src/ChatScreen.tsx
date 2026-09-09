import { type FunctionComponent } from 'react';
import { Button, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.hStack, styles.hSpaceBetween, styles.vSpaceCenter, { padding: 5 }]}>
        <Pressable style={[styles.buttonBubble, styles.hStack, styles.hSpaceCenter, styles.vSpaceCenter]} onPress={() => navigation.goBack()}>
          <Text style={[{ color: 'white' }]}>&lt;</Text>
        </Pressable>
        <View style={[styles.hStack, styles.hSpaceCenter, styles.vSpaceCenter]}>
          <Picture style={[styles.picture, styles.pictureLarge]} url={room.avatarUrl()} />
          <Text>{room.displayName()}</Text>
        </View>
        <View style={[styles.buttonBubble, { backgroundColor: 'transparent' }]} />
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 5, gap: 4 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {
          messageList.length === 0
          ? <View style={[styles.hStack, styles.hSpaceCenter]}>
            <Text>no messages available</Text>
          </View>
          : messageList
            .sort(newestMessageLast)
            .map((message) => <MessageRow key={message.id} message={message} />)
        }
      </ScrollView>
      <TextInput style={[styles.input, { margin: 5 }]} placeholder='your message' />
      <Footer />
    </SafeAreaView>
  );
}

export const MessageRow: FunctionComponent<{ message: Message }> = ({ message }) => {
  const { session, userMap } = useMatrix();
  const isOwnMessage = message.userId === session?.userId;
  const user = userMap[message.userId];

  if (isOwnMessage) {
    return <View style={[styles.hStack, { paddingLeft: 50, justifyContent: 'flex-end' }]}>
      <View style={[styles.messageBubble, { backgroundColor: '#34C759', overflow: 'hidden' }]}>
          <MessageContent message={message} />
      </View>
    </View>
  }

  return <View style={[styles.hStack, { paddingRight: 100 }]}>
      <Picture url={user!.avatarUrl} style={[styles.picture, styles.pictureSmall]}/>
      <View style={[styles.messageBubble, { overflow: 'hidden' }]}>
        <Text style={[{ fontWeight: 'bold' }]}>{user?.displayName}</Text>
        <MessageContent message={message} />
      </View>
  </View>
}