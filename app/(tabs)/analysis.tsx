import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS, FONT_SIZES, SPACING } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

// GPA conversion logic (can be moved to a utils file later)
const gpaConversion: { [key: string]: number } = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

// A reusable LoginView component
const LoginView = () => {
  const { login, isLoading, loadingMessage } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    try {
      await login(username, password);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    }
  };

  return (
    <View style={styles.loginBox}>
      <Text style={styles.loginTitle}>Access Your GPA Analysis</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Portal Username"
        placeholderTextColor={COLORS.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainerRow}>
            <ActivityIndicator
              color={COLORS.text}
              style={{ marginRight: SPACING.sm }}
            />
            <Text style={styles.buttonText}>
              {loadingMessage || "Loading..."}
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Login & Analyze</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function AnalysisScreen() {
  const { isLoggedIn, grades, isLoading, loadingMessage } = useAuth();

  if (isLoading && grades.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginView />;
  }

  if (grades.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>No Grade Data</Text>
        <Text style={styles.loadingText}>
          Please go to the Grades tab to sync your data first.
        </Text>
      </View>
    );
  }

  // Process grades for the chart
  const gpaByYear = grades.reduce((acc, grade) => {
    const year = grade.academicYear;
    const gpa = gpaConversion[grade.grade];
    const credit = parseFloat(grade.creditHour);

    if (year && gpa !== undefined && !isNaN(credit) && credit > 0) {
      if (!acc[year]) {
        acc[year] = { totalPoints: 0, totalCredits: 0 };
      }
      acc[year].totalPoints += gpa * credit;
      acc[year].totalCredits += credit;
    }
    return acc;
  }, {} as Record<string, { totalPoints: number; totalCredits: number }>);

  const chartData = {
    labels: Object.keys(gpaByYear).sort(),
    datasets: [
      {
        data: Object.keys(gpaByYear)
          .sort()
          .map((year) => {
            const yearData = gpaByYear[year];
            return yearData.totalCredits > 0
              ? yearData.totalPoints / yearData.totalCredits
              : 0;
          }),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yearly GPA Progression</Text>
      <Text style={styles.subtitle}>
        A visual summary of your academic performance over the years.
      </Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - SPACING.md * 2}
          height={250}
          yAxisLabel="GPA "
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: COLORS.primary,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(203, 213, 225, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: COLORS.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    textAlign: "center",
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SPACING.sm,
  },
  chart: {
    marginVertical: SPACING.md,
    borderRadius: SPACING.md,
  },
  // LoginView styles
  loginBox: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  loginTitle: {
    fontSize: FONT_SIZES.h1,
    color: COLORS.text,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: "center",
    marginTop: SPACING.sm,
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
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
});
