import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#EA580C",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 80,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Меню",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="restaurant-outline"
              size={size}
              color={typeof color === "number" ? undefined : (color ?? undefined)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Поиск",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={typeof color === "number" ? undefined : (color ?? undefined)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="basket"
        options={{
          title: "Корзина",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={typeof color === "number" ? undefined : (color ?? undefined)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="other"
        options={{
          title: "Ещё",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              size={size}
              color={typeof color === "number" ? undefined : (color ?? undefined)}
            />
          ),
        }}
      />
    </Tabs>
  );
}
