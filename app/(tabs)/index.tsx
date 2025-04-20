import { Text, StyleSheet, Pressable, View } from "react-native";

import { useNavigation } from "expo-router";

export default function HomeScreen() {
  const navigator = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the EMS</Text>
      <Text style={styles.description}>
        Stay on top of your grades with instant updates and insights.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => navigator.navigate("grade")}
      >
        <Text style={styles.buttonText}>Check My Grade</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1e1e1e",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
