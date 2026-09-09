import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 40,
    gap: 8,
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
  vSpaceCenter: {
    alignItems: 'center',
  },
  vSpaceBottom: {
    alignContent: 'flex-end',
  },
  hStack: {
    flexDirection: 'row',
    gap: 4,
  },
  hSpaceBetween: {
    justifyContent: 'space-between',
  },
  hSpaceCenter: {
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picture: {
    borderRadius: 100,
    backgroundColor: 'gray',
    overflow: 'hidden',
    justifyContent: 'center',
    alignContent: 'center',
  },
  pictureLarge: {
    width: 50,
    height: 50,
  },
  pictureSmall: {
    width: 30,
    height: 30,
  },
  badge: {
    borderRadius: 100,
    backgroundColor: 'red',
  },
  buttonBubble: {
    width: 40, height: 40,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#007AFF',
  },
  messageBubble: {
    borderRadius: 10,
    padding: 5,
    backgroundColor: 'darkgray',
  },
});