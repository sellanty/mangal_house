
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import { getMenuItemById } from "@/services/menuApi";
import { getAssetUrl } from "@/services/api";
import type { MenuItem } from "@/types/menu.types";

export default function ModalMenu() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const itemId = Number(id);

  const { addItem, ready } = useCart();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (!Number.isSafeInteger(itemId) || itemId <= 0) {
          return;
        }

        const data = await getMenuItemById(itemId);

        if (active) setItem(data);
      } catch (error) {
        console.error("Ошибка загрузки блюда:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [itemId]);

  const addToCart = () => {
    if (!item || !ready || !item.available) return;

    addItem(item, quantity);
    router.back();
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: BRAND.white }}
      >
        <ActivityIndicator color={BRAND.accent} size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: BRAND.white }}
      >
        <Text
          className="mb-5 text-xl font-bold"
          style={{ color: BRAND.black }}
        >
          Блюдо не найдено
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text style={{ color: BRAND.accent }}>
            Вернуться к меню
          </Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl = getAssetUrl(item.image);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: BRAND.white }}
    >
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: BRAND.surface }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={BRAND.black}
          />
        </Pressable>

        <Text
          className="text-sm font-bold"
          style={{ color: BRAND.black }}
        >
          О блюде
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ height: 290, width: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="h-72 items-center justify-center"
            style={{ backgroundColor: BRAND.surface }}
          >
            <Text style={{ fontSize: 96 }}>{item.emoji}</Text>
          </View>
        )}

        <View className="px-6 pt-7">
          <View className="mb-3 flex-row items-center">
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: BRAND.accentSoft }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: BRAND.accent }}
              >
                {item.category}
              </Text>
            </View>

            {item.popular && (
              <Text
                className="ml-3 text-xs font-bold"
                style={{ color: BRAND.accent }}
              >
                ★ ХИТ МЕНЮ
              </Text>
            )}
          </View>

          <Text
            className="text-3xl font-black"
            style={{ color: BRAND.black }}
          >
            {item.name}
          </Text>

          <Text
            className="mt-4 text-base leading-6"
            style={{ color: BRAND.muted }}
          >
            {item.description}
          </Text>

          {!!item.ingredients && (
            <View className="mt-8">
              <Text
                className="mb-2 text-lg font-bold"
                style={{ color: BRAND.black }}
              >
                Состав
              </Text>

              <Text
                className="text-sm leading-6"
                style={{ color: BRAND.muted }}
              >
                {item.ingredients}
              </Text>
            </View>
          )}

          <View
            className="my-8 h-px"
            style={{ backgroundColor: BRAND.border }}
          />

          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className="text-xs"
                style={{ color: BRAND.muted }}
              >
                Цена за порцию
              </Text>

              <Text
                className="mt-1 text-3xl font-black"
                style={{ color: BRAND.black }}
              >
                {item.price} ₽
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-2xl p-1"
              style={{ backgroundColor: BRAND.surface }}
            >
              <Pressable
                onPress={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={BRAND.black}
                />
              </Pressable>

              <Text
                className="w-9 text-center text-lg font-bold"
                style={{ color: BRAND.black }}
              >
                {quantity}
              </Text>

              <Pressable
                onPress={() =>
                  setQuantity((q) => Math.min(30, q + 1))
                }
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={BRAND.black}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-4 pt-3">
        <Pressable
          onPress={addToCart}
          disabled={!ready || !item.available}
          className="flex-row items-center justify-center rounded-2xl py-4"
          style={{
            backgroundColor:
              !ready || !item.available
                ? BRAND.muted
                : BRAND.accent,
          }}
        >
          <Ionicons
            name="bag-add-outline"
            size={22}
            color={BRAND.white}
          />

          <Text
            className="ml-3 text-base font-bold"
            style={{ color: BRAND.white }}
          >
            {item.available
              ? `В корзину · ${item.price * quantity} ₽`
              : "Нет в наличии"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
