import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "@/contexts/CartContext";

import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="edit-profile"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="addresses"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
