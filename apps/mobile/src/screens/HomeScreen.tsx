import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utmark</Text>
      <Text style={styles.subtitle}>Expo + TypeScript is ready.</Text>
      <Text style={styles.hint}>Add screens under src/screens and wire navigation next.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
