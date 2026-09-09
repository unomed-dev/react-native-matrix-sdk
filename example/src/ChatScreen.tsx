import { useRef, type FunctionComponent } from 'react';
import { Button, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ChatScreenProps } from './AppNavigator';
import { styles } from './styles';
import { useMatrix, type Message } from './use-matrix';
import { Picture } from './Picture';
import { Footer } from './Footer';
import { newestMessageLast } from './matrix-lib/sort';
import { MessageType_Tags } from '@unomed/react-native-matrix-sdk';

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

export const MessageContent: FunctionComponent<{ message: Message }> = ({ message }) => {
  switch (message.msgType.tag) {
    case MessageType_Tags.Emote:
      return <Text style={{ fontSize: 30 }}>{message.msgType.inner.content.body}</Text>;

    case MessageType_Tags.Audio: {
      const { filename } = message.msgType.inner.content;
      return <Text style={{ fontStyle: 'italic' }}>♬ Audio Message: {filename}</Text>;
    }

    case MessageType_Tags.File: {
      const { filename } = message.msgType.inner.content;
      return <View><Text style={{ fontStyle: 'italic' }}>💾 File:</Text><Text>{filename}</Text></View>;
    }

    case MessageType_Tags.Gallery: {
      const { body } = message.msgType.inner.content;
      return <View><Text style={{ fontStyle: 'italic' }}>🖼️ Gallery:</Text><Text>{body}</Text></View>;
    }

    case MessageType_Tags.Image: {
      const { source, filename, caption } = message.msgType.inner.content;
      return <View>
        <Image source={{ uri: source.url() }} />
        <Text>{caption ?? filename}</Text>
      </View>;
    }

    case MessageType_Tags.Location: {
      const { description, body } = message.msgType.inner.content;
      return <View><Text style={{ fontStyle: 'italic' }}>📍 Location:</Text><Text>{description ?? body}</Text></View>;
    }

    case MessageType_Tags.Notice:
      return <View><Text style={{ fontStyle: 'italic' }}>📝 Notice:</Text><Text>{message.msgType.inner.content.body}</Text></View>;

    case MessageType_Tags.Video: {
      const { source, filename, caption } = message.msgType.inner.content;
      return <View>
        <Image source={{ uri: source.url() }} />
        <Text>{caption ?? filename}</Text>
      </View>;
    }

    case MessageType_Tags.Other:
    case MessageType_Tags.Text:
    default:
      return <Text>{message.body}</Text>;
  }
}

export const MessagePreview: FunctionComponent<{ message: Message }> = ({ message }) => {
  switch (message.msgType.tag) {
    case MessageType_Tags.Emote:
      return <Text numberOfLines={2} style={{ fontStyle: 'italic' }}>{message.msgType.inner.content.body}</Text>;

    case MessageType_Tags.Audio:
      return <Text numberOfLines={2}>♬ {message.msgType.inner.content.filename}</Text>;

    case MessageType_Tags.File:
      return <Text numberOfLines={2}>💾 {message.msgType.inner.content.filename}</Text>;

    case MessageType_Tags.Gallery:
      return <Text numberOfLines={2}>🖼️ {message.msgType.inner.content.body}</Text>;

    case MessageType_Tags.Image:
      return <Text numberOfLines={2}>🖼️ {message.msgType.inner.content.caption}</Text>;

    case MessageType_Tags.Location: {
      const { description, body } = message.msgType.inner.content;
      return <Text numberOfLines={2}>📍 {description ?? body}</Text>;
    }

    case MessageType_Tags.Notice:
      return <Text numberOfLines={2}>📝 {message.msgType.inner.content.body}</Text>;

    case MessageType_Tags.Video:
      return <Text numberOfLines={2}>🎬 {message.msgType.inner.content.filename}</Text>;

    case MessageType_Tags.Other:
    case MessageType_Tags.Text:
    default:
      return <Text numberOfLines={2}>{message.body}</Text>;
  }
}