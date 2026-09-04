import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        {/* Экран загрузки */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Экран входа */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />

        {/* Основное приложение */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
