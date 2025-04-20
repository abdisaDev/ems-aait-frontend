import axios from "axios";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface Grade {
  no: string;
  courseTitle: string;
  code: string;
  creditHour: string;
  ects: string;
  grade: string;
  academicYear: string;
  year: string;
  semester: string;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TabTwoScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>(
    {}
  );
  const [loggedIn, setLoggedIn] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (!username || !password) {
      setError({ message: "Please fill both fields." });
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .post("http://localhost:2423/grades", { username, password })
      .then((response) => {
        setGrades(response.data);
        setLoggedIn(true);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Login error:", err.response?.data || err.message);
        setError({
          message: err.response?.data?.message || err.message || "Login failed",
        });
        setLoading(false);
      });
  };

  const toggleYear = (year: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const groupedByYear = grades.reduce<Record<string, Grade[]>>((acc, grade) => {
    const year = grade.year || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(grade);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    const yearOrder = ["I", "II", "III", "IV", "V", "Unknown"];
    return yearOrder.indexOf(b) - yearOrder.indexOf(a);
  });

  if (!loggedIn) {
    return (
      <View style={styles.darkBackground}>
        <View style={styles.loginBoxDark}>
          <Text style={styles.loginTitleDark}>Login to View Grades</Text>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            style={styles.inputDarkBox}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            style={styles.inputDarkBox}
            secureTextEntry
          />
          {error && error.message ? (
            <Text style={styles.errorTextLoginBox}>{error.message}</Text>
          ) : null}
          <TouchableOpacity
            onPress={login}
            style={styles.loginButtonDarkBox}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonTextDarkBox}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.darkBackground}>
      <ScrollView contentContainerStyle={styles.container}>
        {grades.length === 0 && !loading && !error ? (
          <View style={styles.centeredContentDark}>
            {" "}
            <Text style={styles.noDataTextDark}>
              No grades available at the moment.
            </Text>
          </View>
        ) : (
          sortedYears.map((year) => {
            const yearGrades = groupedByYear[year];
            if (!yearGrades || yearGrades.length === 0) return null;

            return (
              <View key={year} style={styles.yearSection}>
                <TouchableOpacity
                  onPress={() => toggleYear(year)}
                  style={styles.yearHeaderDark}
                  activeOpacity={0.7}
                >
                  <Text style={styles.yearHeaderTextDark}>
                    Year {year} {collapsedYears[year] ? "▼" : "▲"}
                  </Text>
                </TouchableOpacity>

                {!collapsedYears[year] && (
                  <View>
                    {yearGrades.map((grade) => (
                      <TouchableOpacity
                        key={grade.no}
                        onPress={() =>
                          alert(
                            `Course: ${grade.courseTitle}, Grade: ${grade.grade}`
                          )
                        }
                        activeOpacity={0.8}
                        style={styles.cardDark}
                      >
                        <Text style={styles.cardLabelDark}>COURSE</Text>
                        <Text style={styles.cardTitleDark}>
                          {grade.courseTitle}
                        </Text>
                        <Text style={styles.cardBodyTextDark}>
                          Code: {grade.code} | Credit: {grade.creditHour} |
                          ECTS: {grade.ects}
                        </Text>
                        <View style={styles.gradeDetailsRowDark}>
                          <View style={styles.detailsColumnDark}>
                            <Text style={styles.cardDetailsDark}>
                              Credit Hour: {grade.creditHour}
                            </Text>
                            <Text style={styles.cardDetailsDark}>
                              ECTS: {grade.ects}
                            </Text>
                          </View>
                          <View style={styles.gradeDisplayDark}>
                            <Text style={styles.gradeTextDark}>
                              {grade.grade}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.academicInfoContainer}>
                          <Text style={styles.cardAcademicInfoDark}>
                            {grade.academicYear} | {grade.semester}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
        {loading && grades.length === 0 && (
          <View style={styles.centeredContentDark}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingTextDark}>Fetching Grades...</Text>
          </View>
        )}
        {error && grades.length === 0 && (
          <View style={styles.centeredContentDark}>
            <Text style={styles.errorTitleDark}>Error Loading Data</Text>
            <Text style={styles.errorTextDarkBackground}>{error.message}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 20,
    alignItems: "stretch",
  },
  yearSection: {
    marginBottom: 25,
    width: "100%",
    alignSelf: "center",
  },
  yearHeaderDark: {
    backgroundColor: "#282c34",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3a3f47",
    width: "100%",
  },
  yearHeaderTextDark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  cardDark: {
    backgroundColor: "#282c34",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3a3f47",
    width: "100%",
  },
  cardLabelDark: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
  },
  cardTitleDark: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "left",
  },
  cardBodyTextDark: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 15,
    lineHeight: 20,
    textAlign: "left",
  },
  cardSeparatorDark: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 15,
  },
  gradeDetailsRowDark: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 0,
    borderTopWidth: 0,
    borderTopColor: "transparent",
  },
  detailsColumnDark: {
    flexShrink: 1,
    marginRight: 15,
  },
  cardDetailsDark: {
    fontSize: 13,
    color: "#ccc",
    marginBottom: 2,
    textAlign: "left",
  },
  gradeDisplayDark: {
    backgroundColor: "#3a3f47",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeTextDark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  academicInfoContainer: {
    marginTop: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3a3f47",
    paddingTop: 10,
  },
  cardAcademicInfoDark: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
  },

  centeredContentDark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingTextDark: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  errorTitleDark: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 10,
    textAlign: "center",
  },
  errorTextDarkBackground: {
    color: "#ff8e8e",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  noDataTextDark: {
    fontSize: 18,
    color: "#ccc",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  loginBoxDark: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#282c34",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3a3f47",
  },
  loginTitleDark: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },
  inputDarkBox: {
    backgroundColor: "#3a3f47",
    padding: 14,
    marginBottom: 20,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#555",
    color: "#fff",
  },
  loginButtonDarkBox: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonTextDarkBox: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorTextLoginBox: {
    color: "#ffb3b3",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
});
