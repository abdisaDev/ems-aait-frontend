import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";

const API_URL = "https://bk-ems.abdisa.me";

export interface Assessment {
  name: string;
  result: string;
}

export interface Grade {
  no: string;
  courseTitle: string;
  code: string;
  creditHour: string;
  ects: string;
  grade: string;
  academicYear?: string;
  year?: string;
  semester?: string;
  assessments: Assessment[];
}

interface User {
  username: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  grades: Grade[];
  isLoggedIn: boolean;
  isLoading: boolean;
  loadingMessage: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  sync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string | null>("");

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setLoadingMessage("Checking credentials...");
        const storedCredentials = await SecureStore.getItemAsync(
          "userCredentials"
        );
        const storedGrades = await AsyncStorage.getItem("userGrades");

        if (storedCredentials) {
          setLoadingMessage("Credentials found, logging in...");
          const parsedCredentials = JSON.parse(storedCredentials);
          setUser(parsedCredentials);
          setIsLoggedIn(true);
          if (storedGrades) {
            setGrades(JSON.parse(storedGrades));
          }
        } else {
          setLoadingMessage("No credentials found.");
        }
      } catch (error) {
        console.error("Failed to load data from storage:", error);
        Alert.alert("Error", "Failed to load session data.");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    };

    loadStoredData();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setLoadingMessage("Checking credentials...");
    try {
      const userCredentials = { username, password };
      // Optimistically set credentials for immediate use
      setUser(userCredentials);
      await SecureStore.setItemAsync(
        "userCredentials",
        JSON.stringify(userCredentials)
      );
      setIsLoggedIn(true);
      setLoadingMessage("Almost there...");
      // Automatically sync after login
      await sync(userCredentials);
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login Failed",
        "Could not save credentials. Please try again."
      );
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setLoadingMessage("Logging out...");
    try {
      await SecureStore.deleteItemAsync("userCredentials");
      await AsyncStorage.removeItem("userGrades");
      setUser(null);
      setGrades([]);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Failed", "Could not clear session data.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const sync = async (creds?: { username?: string; password?: string }) => {
    const credsToUse = creds || user;

    if (!credsToUse?.username || !credsToUse?.password) {
      Alert.alert(
        "Authentication Error",
        "Credentials not found. Please log in again."
      );
      setIsLoading(false);
      setIsLoggedIn(false);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Syncing grades... This may take a moment.");
    try {
      const response = await axios.post(`${API_URL}/scrape`, credsToUse, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setLoadingMessage("Sync complete!");
        setGrades(response.data);
        await AsyncStorage.setItem("userGrades", JSON.stringify(response.data));
      } else {
        throw new Error("Invalid data format received from server.");
      }
    } catch (error) {
      console.error("Sync failed:", error);
      let errorMessage = "An unknown error occurred during sync.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server Error: ${error.response.status} - ${
            error.response.data?.message || "Please try again."
          }`;
        } else if (error.request) {
          errorMessage = "Network Error: Could not connect to the server.";
        } else {
          errorMessage = `Request Error: ${error.message}`;
        }
      }
      Alert.alert("Sync Failed", errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        grades,
        isLoggedIn,
        isLoading,
        loadingMessage,
        login,
        logout,
        sync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
