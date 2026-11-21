import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";

export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: BRAND.accent,
        tabBarInactiveTintColor: BRAND.muted,

        tabBarStyle: {
          backgroundColor: BRAND.white,
          borderTopWidth: 1,
          borderTopColor: BRAND.border,
          height: 74,
          paddingTop: 9,
          paddingBottom: 10,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarBadgeStyle: {
          backgroundColor: BRAND.accent,
          color: BRAND.white,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Меню",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="restaurant-outline"
              size={size}
              color={focused ? BRAND.accent : BRAND.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Поиск",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={focused ? BRAND.accent : BRAND.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="basket"
        options={{
          title: "Корзина",
          tabBarBadge:
            totalItems > 0
              ? totalItems > 99
                ? "99+"
                : totalItems
              : undefined,

          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="bag-handle-outline"
              size={size}
              color={focused ? BRAND.accent : BRAND.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="other"
        options={{
          title: "Профиль",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={focused ? BRAND.accent : BRAND.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}