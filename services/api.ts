import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANDROID_USE_EMULATOR = true;

const getApiOrigin = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  if (Platform.OS === "android") {
    if (__DEV__ && ANDROID_USE_EMULATOR) {
      return "http://10.0.2.2:5000";
    }

    return "http://192.168.1.97:5000";
  }

  if (Platform.OS === "ios") {
    return "http://192.168.1.97:5000";
  }

  return "http://192.168.1.97:5000";
};

export const API_ORIGIN = getApiOrigin();

export const getAssetUrl = (path?: string | null) => {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

console.log("Platform.OS:", Platform.OS);
console.log("API_ORIGIN:", API_ORIGIN);

export default api;