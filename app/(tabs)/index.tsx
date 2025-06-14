import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONT_SIZES, SPACING } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  const { sync, logout, isLoading, loadingMessage, isLoggedIn } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="home" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Welcome to EMS</Text>
        <Text style={styles.subtitle}>
          Your student portal companion. Access your grades and performance
          analysis instantly.
        </Text>
      </View>

      {isLoggedIn ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={sync}
            disabled={isLoading}
          >
            {isLoading && loadingMessage ? (
              <View style={styles.loadingContainerRow}>
                <ActivityIndicator
                  color={COLORS.text}
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.buttonText}>{loadingMessage}</Text>
              </View>
            ) : (
              <>
                <Feather
                  name="refresh-cw"
                  size={20}
                  color={COLORS.text}
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.buttonText}>Sync Data</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={logout}
            disabled={isLoading}
          >
            <Feather
              name="log-out"
              size={20}
              color={COLORS.text}
              style={{ marginRight: SPACING.sm }}
            />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loggedOutContainer}>
          <Text style={styles.loggedOutText}>
            Please log in via the 'Grades' or 'Analysis' tab to get started.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.sm,
    maxWidth: "90%",
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
  },
  loadingContainerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loggedOutContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    width: "100%",
  },
  loggedOutText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: FONT_SIZES.body,
  },
});
