import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  UIManager,
} from "react-native";
import { useAuth, Grade } from "../../context/AuthContext";
import { COLORS, FONT_SIZES, SPACING } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LoginView = () => {
  const { login, isLoading, loadingMessage } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      <Text style={styles.loginTitle}>Access Your Grades</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
        disabled={!!loadingMessage}
      >
        <Text style={styles.buttonText}>
          {loadingMessage || "Login & Sync Grades"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getGradeColor = (grade: string) => {
  const gradeUpper = grade.toUpperCase();
  if (gradeUpper.startsWith("A")) return "#28a745"; // Green for A
  if (gradeUpper.startsWith("B")) return "#17a2b8"; // Blue for B
  if (gradeUpper.startsWith("C")) return "#ffc107"; // Yellow for C
  if (gradeUpper.startsWith("D") || gradeUpper.startsWith("F"))
    return "#dc3545"; // Red for D/F
  return COLORS.primary;
};

export default function GradeScreen() {
  const { isLoggedIn, grades, isLoading, loadingMessage } = useAuth();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    string | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const groupedGrades = grades.reduce<Record<string, Record<string, Grade[]>>>(
    (acc, grade) => {
      const academicYear = grade.academicYear || "Unknown Year";
      const semester = grade.semester || "Unknown Semester";

      if (academicYear === "Unknown Year") return acc;

      if (!acc[academicYear]) {
        acc[academicYear] = {};
      }
      if (!acc[academicYear][semester]) {
        acc[academicYear][semester] = [];
      }
      acc[academicYear][semester].push(grade);
      return acc;
    },
    {}
  );

  const academicYears = Object.keys(groupedGrades).sort((a, b) =>
    b.localeCompare(a)
  );

  useEffect(() => {
    if (academicYears.length > 0 && !selectedAcademicYear) {
      setSelectedAcademicYear(academicYears[0]);
    }
  }, [academicYears, selectedAcademicYear]);

  if (isLoading && grades.length === 0) {
    return (
      <View style={styles.loadingContainerFull}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderAssessmentItem = ({
    item,
    index,
  }: {
    item: { name: string; result: string };
    index: number;
  }) => (
    <View
      style={[
        styles.assessmentRow,
        index % 2 !== 0 && styles.assessmentRowAlternate,
        item.name.toLowerCase() === "total" && styles.totalRow,
      ]}
    >
      <Text
        style={[
          styles.assessmentName,
          item.name.toLowerCase() === "total" && styles.totalName,
        ]}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.assessmentResult,
          item.name.toLowerCase() === "total" && styles.totalResult,
        ]}
      >
        {item.result}
      </Text>
    </View>
  );

  const renderGradeCard = (grade: Grade) => {
    const gradeColor = getGradeColor(grade.grade);
    return (
      <TouchableOpacity
        key={`${grade.no}-${grade.code}`}
        style={styles.card}
        onPress={() => setSelectedGrade(grade)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{grade.courseTitle}</Text>
          <View style={[styles.gradeDisplay, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{grade.grade}</Text>
          </View>
        </View>
        <View style={styles.cardSeparator} />
        <View style={styles.cardBody}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Code</Text>
            <Text style={styles.detailValue}>{grade.code}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Credit</Text>
            <Text style={styles.detailValue}>{grade.creditHour}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ECTS</Text>
            <Text style={styles.detailValue}>{grade.ects}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Academic Year</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setPickerOpen(true)}
          disabled={academicYears.length === 0}
        >
          <Text style={styles.pickerButtonText}>
            {selectedAcademicYear || "No grades available"}
          </Text>
          <Feather name="chevron-down" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedAcademicYear &&
          groupedGrades[selectedAcademicYear] &&
          Object.keys(groupedGrades[selectedAcademicYear])
            .sort()
            .map((semester) => (
              <View key={semester} style={styles.semesterSection}>
                <Text style={styles.semesterTitle}>{semester}</Text>
                {groupedGrades[selectedAcademicYear][semester].map((grade) =>
                  renderGradeCard(grade)
                )}
              </View>
            ))}
      </ScrollView>

      <Modal
        transparent={true}
        visible={pickerOpen}
        onRequestClose={() => setPickerOpen(false)}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setPickerOpen(false)}
        >
          <View style={styles.pickerModal}>
            {academicYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedAcademicYear(year);
                  setPickerOpen(false);
                }}
              >
                <Text style={styles.pickerItemText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        visible={selectedGrade !== null}
        onRequestClose={() => setSelectedGrade(null)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedGrade && (
              <>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedGrade(null)}
                >
                  <Feather name="x" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {selectedGrade.courseTitle}
                </Text>
                <FlatList
                  data={selectedGrade.assessments}
                  renderItem={renderAssessmentItem}
                  keyExtractor={(item) => item.name}
                  ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                      <Text style={styles.listHeaderTextName}>Assessment</Text>
                      <Text style={styles.listHeaderTextResult}>Result</Text>
                    </View>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },
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
  pickerContainer: {
    marginBottom: SPACING.md,
  },
  pickerLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.sm,
  },
  pickerButton: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.body,
  },
  semesterSection: {
    marginBottom: SPACING.lg,
  },
  semesterTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    flexShrink: 1,
    marginRight: SPACING.sm,
  },
  gradeDisplay: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeText: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  pickerModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SPACING.sm,
    width: "80%",
    maxHeight: "60%",
  },
  pickerItem: {
    padding: SPACING.md,
  },
  pickerItemText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.body,
    textAlign: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    width: "100%",
  },
  listHeader: {
    flexDirection: "row",
    paddingBottom: SPACING.sm,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  listHeaderTextName: {
    color: COLORS.textSecondary,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
    flex: 3,
  },
  listHeaderTextResult: {
    color: COLORS.textSecondary,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
    flex: 1,
    textAlign: "right",
  },
  assessmentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  assessmentRowAlternate: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  assessmentName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    flex: 3,
  },
  assessmentResult: {
    fontSize: FONT_SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    borderTopWidth: 2,
    borderColor: COLORS.primary,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: "rgba(29, 161, 242, 0.1)",
  },
  totalName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
  },
  totalResult: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
  },
  modalCloseButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    padding: SPACING.xs,
  },
});
