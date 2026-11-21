
import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import { getAssetUrl } from "@/services/api";
import { createOrder } from "@/services/orderApi";
import type { OrderResponse } from "@/types/order.types";

const formatPrice = (value: number) =>
  `${value.toLocaleString("ru-RU")} ₽`;

export default function BasketScreen() {
  const {
    items,
    ready,
    totalItems,
    totalPrice,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [completedOrder, setCompletedOrder] =
    useState<OrderResponse | null>(null);

  const submittingRef = useRef(false);

  // Подставляем адрес из профиля пользователя
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadAddress() {
        try {
          const saved = await AsyncStorage.getItem("@user");

          if (!saved || !active) return;

          const user: unknown = JSON.parse(saved);

          if (
            user &&
            typeof user === "object" &&
            "address" in user &&
            typeof user.address === "string"
          ) {
            setAddress((previous) => previous || user.address as string);
          }
        } catch (e) {
          console.error("Ошибка чтения адреса:", e);
        }
      }

      loadAddress();

      return () => {
        active = false;
      };
    }, [])
  );

  const checkout = async () => {
    if (submittingRef.current || !ready || items.length === 0) {
      return;
    }

    if (!address.trim()) {
      setError("Укажи адрес доставки");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const token = await AsyncStorage.getItem("@authToken");

      if (!token) {
        setError("Для заказа необходимо войти в аккаунт");
        return;
      }

      const result = await createOrder({
        customerAddress: address.trim(),
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      if (!result.success || !result.order) {
        setError(result.error || "Не удалось оформить заказ");
        return;
      }

      setCompletedOrder(result.order);
      clearCart();
    } catch (e) {
      console.error("Ошибка оформления заказа:", e);
      setError("Не удалось оформить заказ. Попробуй ещё раз.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Экран после успешного оформления
  if (completedOrder) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: BRAND.white }}
      >
        <StatusBar style="dark" />

        <View
          className="mb-6 h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: BRAND.accentSoft }}
        >
          <Ionicons
            name="checkmark-circle"
            size={65}
            color={BRAND.accent}
          />
        </View>

        <Text
          className="text-center text-3xl font-black"
          style={{ color: BRAND.black }}
        >
          Заказ оформлен!
        </Text>

        <Text
          className="mt-3 text-center text-base leading-6"
          style={{ color: BRAND.muted }}
        >
          Спасибо за заказ. Мы получили его и скоро приступим
          к обработке.
        </Text>

        <View
          className="mt-8 w-full rounded-3xl p-5"
          style={{ backgroundColor: BRAND.surface }}
        >
          <View className="flex-row justify-between">
            <Text style={{ color: BRAND.muted }}>
              Номер заказа
            </Text>
            <Text
              className="font-bold"
              style={{ color: BRAND.black }}
            >
              №{completedOrder.id}
            </Text>
          </View>

          <View className="mt-4 flex-row justify-between">
            <Text style={{ color: BRAND.muted }}>
              Стоимость блюд
            </Text>
            <Text
              className="font-bold"
              style={{ color: BRAND.black }}
            >
              {formatPrice(completedOrder.totalAmount)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setCompletedOrder(null);
            router.navigate("/(tabs)");
          }}
          className="mt-8 w-full items-center rounded-2xl py-4"
          style={{ backgroundColor: BRAND.black }}
        >
          <Text
            className="text-base font-bold"
            style={{ color: BRAND.white }}
          >
            Вернуться в меню
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: BRAND.white }}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center justify-between px-5 pb-4 pt-5">
          <View>
            <Text
              className="text-xs font-bold tracking-[3px]"
              style={{ color: BRAND.accent }}
            >
              MANGAL HOUSE
            </Text>

            <Text
              className="mt-1 text-3xl font-black"
              style={{ color: BRAND.black }}
            >
              Корзина
            </Text>

            <Text
              className="mt-1 text-sm"
              style={{ color: BRAND.muted }}
            >
              {totalItems} шт. в заказе
            </Text>
          </View>

          {items.length > 0 && (
            <Pressable
              onPress={() => setConfirmClear(true)}
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: BRAND.surface }}
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color={BRAND.black}
              />
            </Pressable>
          )}
        </View>

        {confirmClear && (
          <View
            className="mx-5 mb-3 rounded-2xl p-4"
            style={{ backgroundColor: BRAND.surface }}
          >
            <Text
              className="font-bold"
              style={{ color: BRAND.black }}
            >
              Удалить все блюда из корзины?
            </Text>

            <View className="mt-3 flex-row" style={{ gap: 10 }}>
              <Pressable
                onPress={() => setConfirmClear(false)}
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: BRAND.white }}
              >
                <Text style={{ color: BRAND.black }}>
                  Отмена
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  clearCart();
                  setConfirmClear(false);
                }}
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: BRAND.black }}
              >
                <Text style={{ color: BRAND.white }}>
                  Очистить
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!ready ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color={BRAND.accent}
            />
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View
              className="h-28 w-28 items-center justify-center rounded-full"
              style={{ backgroundColor: BRAND.surface }}
            >
              <Ionicons
                name="bag-handle-outline"
                size={52}
                color={BRAND.accent}
              />
            </View>

            <Text
              className="mt-7 text-center text-2xl font-black"
              style={{ color: BRAND.black }}
            >
              Пока ничего нет
            </Text>

            <Text
              className="mt-3 text-center text-sm leading-6"
              style={{ color: BRAND.muted }}
            >
              Кажется, самое время выбрать что-нибудь вкусное!
            </Text>

            <Pressable
              onPress={() => router.navigate("/(tabs)")}
              className="mt-7 rounded-2xl px-8 py-4"
              style={{ backgroundColor: BRAND.accent }}
            >
              <Text
                className="font-bold"
                style={{ color: BRAND.white }}
              >
                Перейти к меню
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 25,
              }}
            >
              <Text
                className="mb-4 mt-4 text-lg font-extrabold"
                style={{ color: BRAND.black }}
              >
                Твои блюда
              </Text>

              {items.map((item) => {
                const imageUrl = getAssetUrl(item.image);

                return (
                  <View
                    key={item.id}
                    className="mb-3 flex-row overflow-hidden rounded-3xl p-3"
                    style={{
                      backgroundColor: BRAND.white,
                      borderWidth: 1,
                      borderColor: BRAND.border,
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{
                          width: 94,
                          height: 106,
                          borderRadius: 16,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="items-center justify-center rounded-2xl"
                        style={{
                          width: 94,
                          height: 106,
                          backgroundColor: BRAND.surface,
                        }}
                      >
                        <Text style={{ fontSize: 43 }}>
                          {item.emoji}
                        </Text>
                      </View>
                    )}

                    <View className="ml-3 flex-1 justify-between">
                      <View>
                        <Text
                          className="text-sm font-bold"
                          numberOfLines={2}
                          style={{ color: BRAND.black }}
                        >
                          {item.name}
                        </Text>

                        <Text
                          className="mt-1 text-xs"
                          style={{ color: BRAND.muted }}
                        >
                          {formatPrice(item.price)} / шт.
                        </Text>
                      </View>

                      <View className="flex-row items-end justify-between">
                        <Text
                          className="text-base font-black"
                          style={{ color: BRAND.black }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </Text>

                        <View
                          className="flex-row items-center rounded-xl"
                          style={{ backgroundColor: BRAND.surface }}
                        >
                          <Pressable
                            onPress={() =>
                              setQuantity(item.id, item.quantity - 1)
                            }
                            className="h-9 w-9 items-center justify-center"
                          >
                            <Ionicons
                              name="remove"
                              size={18}
                              color={BRAND.black}
                            />
                          </Pressable>

                          <Text
                            className="min-w-6 text-center font-bold"
                            style={{ color: BRAND.black }}
                          >
                            {item.quantity}
                          </Text>

                          <Pressable
                            disabled={item.quantity >= 30}
                            onPress={() =>
                              setQuantity(item.id, item.quantity + 1)
                            }
                            className="h-9 w-9 items-center justify-center"
                          >
                            <Ionicons
                              name="add"
                              size={18}
                              color={
                                item.quantity >= 30
                                  ? BRAND.muted
                                  : BRAND.black
                              }
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View
                className="mt-6 rounded-3xl p-5"
                style={{ backgroundColor: BRAND.surface }}
              >
                <View className="mb-4 flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={BRAND.accent}
                  />

                  <Text
                    className="ml-2 text-lg font-extrabold"
                    style={{ color: BRAND.black }}
                  >
                    Адрес доставки
                  </Text>
                </View>

                <TextInput
                  value={address}
                  onChangeText={(value) => {
                    setAddress(value);
                    setError("");
                  }}
                  editable={!submitting}
                  placeholder="Улица, дом, квартира, подъезд..."
                  placeholderTextColor={BRAND.muted}
                  multiline
                  textAlignVertical="top"
                  style={{
                    minHeight: 85,
                    padding: 15,
                    borderRadius: 16,
                    backgroundColor: BRAND.white,
                    color: BRAND.black,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: BRAND.border,
                  }}
                />
              </View>

              <View
                className="mt-5 rounded-3xl p-5"
                style={{
                  borderWidth: 1,
                  borderColor: BRAND.border,
                }}
              >
                <Text
                  className="mb-4 text-lg font-extrabold"
                  style={{ color: BRAND.black }}
                >
                  Детали заказа
                </Text>

                <View className="flex-row justify-between">
                  <Text style={{ color: BRAND.muted }}>
                    Блюда ({totalItems} шт.)
                  </Text>

                  <Text style={{ color: BRAND.black }}>
                    {formatPrice(totalPrice)}
                  </Text>
                </View>

                <Text
                  className="mt-4 text-xs leading-5"
                  style={{ color: BRAND.muted }}
                >
                  Стоимость доставки пока не рассчитывается
                  приложением. Перед подтверждением заказа
                  уточните её у ресторана.
                </Text>
              </View>
            </ScrollView>

            <View
              className="px-5 pb-4 pt-4"
              style={{
                backgroundColor: BRAND.white,
                borderTopWidth: 1,
                borderColor: BRAND.border,
              }}
            >
              {error ? (
                <Text
                  className="mb-3 text-center text-sm"
                  style={{ color: BRAND.accent }}
                >
                  {error}
                </Text>
              ) : null}

              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-xs"
                    style={{ color: BRAND.muted }}
                  >
                    Итого за блюда
                  </Text>

                  <Text
                    className="mt-1 text-2xl font-black"
                    style={{ color: BRAND.black }}
                  >
                    {formatPrice(totalPrice)}
                  </Text>
                </View>

                <Text
                  className="text-xs"
                  style={{ color: BRAND.muted }}
                >
                  {totalItems} шт.
                </Text>
              </View>

              <Pressable
                disabled={submitting}
                onPress={checkout}
                className="flex-row items-center justify-center rounded-2xl py-4"
                style={{
                  backgroundColor: submitting
                    ? BRAND.muted
                    : BRAND.accent,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color={BRAND.white} />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={BRAND.white}
                  />
                )}

                <Text
                  className="ml-3 text-base font-extrabold"
                  style={{ color: BRAND.white }}
                >
                  {submitting
                    ? "Оформляем..."
                    : "Оформить заказ"}
                </Text>
              </Pressable>

              <Text
                className="mt-3 text-center text-xs"
                style={{ color: BRAND.muted }}
              >
                Сумма подтверждается сервером при оформлении
              </Text>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
