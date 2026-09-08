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