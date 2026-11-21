
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import api from "@/services/api";
import { getMyOrders } from "@/services/orderApi";

import type { AuthResponse } from "@/types/auth.types";
import type {
  OrderResponse,
  OrderStatus,
} from "@/types/order.types";

type ProfileUser = NonNullable<AuthResponse["user"]>;

const statusLabels: Record<OrderStatus, string> = {
  new: "Новый",
  cooking: "Готовится",
  delivering: "Доставляется",
  completed: "Завершён",
  cancelled: "Отменён",
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("ru-RU")} ₽`;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата неизвестна";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: BRAND.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={21} color={BRAND.accent} />
      </View>

      <View style={{ marginLeft: 13, flex: 1 }}>
        <Text style={{ color: BRAND.muted, fontSize: 12 }}>
          {label}
        </Text>

        <Text
          style={{
            color: BRAND.black,
            fontSize: 15,
            fontWeight: "600",
            marginTop: 3,
          }}
        >
          {value || "Не указан"}
        </Text>
      </View>
    </View>
  );
}

function OrderCard({ order }: { order: OrderResponse }) {
  const [expanded, setExpanded] = useState(false);

  const orderItems = Array.isArray(order.items)
    ? order.items
    : [];

  return (
    <View
      style={{
        backgroundColor: BRAND.white,
        borderWidth: 1,
        borderColor: BRAND.border,
        borderRadius: 22,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={{ padding: 17 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: BRAND.black,
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            Заказ №{order.id}
          </Text>

          <View
            style={{
              backgroundColor: BRAND.accentSoft,
              borderRadius: 99,
              paddingHorizontal: 11,
              paddingVertical: 7,
            }}
          >
            <Text
              style={{
                color: BRAND.accent,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {statusLabels[order.status] ?? order.status}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: BRAND.muted,
            marginTop: 7,
            fontSize: 12,
          }}
        >
          {formatDate(order.createdAt)}
        </Text>

        <View
          style={{
            marginTop: 17,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: BRAND.muted,
                fontSize: 11,
              }}
            >
              Стоимость блюд
            </Text>

            <Text
              style={{
                color: BRAND.black,
                fontWeight: "800",
                fontSize: 19,
                marginTop: 4,
              }}
            >
              {formatPrice(order.totalAmount)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text
              style={{
                color: BRAND.accent,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {expanded ? "Свернуть" : "Подробнее"}
            </Text>

            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={17}
              color={BRAND.accent}
            />
          </View>
        </View>
      </Pressable>

      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: BRAND.border,
            padding: 17,
            gap: 14,
          }}
        >
          {orderItems.map((item, index) => (
            <View
              key={`${item.id}-${index}`}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Text
                style={{
                  color: BRAND.black,
                  fontSize: 13,
                  flex: 1,
                }}
              >
                {item.emoji} {item.name} × {item.quantity}
              </Text>

              <Text
                style={{
                  color: BRAND.black,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View
            style={{
              height: 1,
              backgroundColor: BRAND.border,
            }}
          />

          <Text
            style={{
              color: BRAND.muted,
              fontSize: 12,
              lineHeight: 19,
            }}
          >
            Адрес: {order.customerAddress}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { clearCart } = useCart();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setProfileError("");
    setOrdersError("");

    try {
      const token = await AsyncStorage.getItem("@authToken");

      if (!token) {
        setAuthenticated(false);
        setUser(null);
        setOrders([]);
        return;
      }

      setAuthenticated(true);

      // Сначала показываем сохранённый профиль.
      const cached = await AsyncStorage.getItem("@user");

      if (cached) {
        try {
          const parsed: unknown = JSON.parse(cached);

          if (
            parsed &&
            typeof parsed === "object" &&
            "name" in parsed &&
            "phone" in parsed &&
            typeof parsed.name === "string" &&
            typeof parsed.phone === "string"
          ) {
            setUser(parsed as ProfileUser);
          }
        } catch {
          console.warn("Не удалось прочитать сохранённый профиль");
        }
      }

      // Затем запрашиваем свежие данные у сервера.
      try {
        const { data } = await api.get<{
          success: boolean;
          user: ProfileUser;
        }>("/auth/me");

        if (data.success && data.user) {
          setUser(data.user);

          await AsyncStorage.setItem(
            "@user",
            JSON.stringify(data.user)
          );
        }
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          await AsyncStorage.multiRemove([
            "@authToken",
            "@user",
          ]);

          setAuthenticated(false);
          setUser(null);
          setOrders([]);
          setProfileError("Сессия истекла. Войди снова.");
          return;
        }

        setProfileError(
          "Не удалось обновить профиль. Показаны сохранённые данные."
        );
      }

      // Заказы получаем отдельно, чтобы ошибка истории
      // не мешала отображению профиля.
      try {
        const data = await getMyOrders();

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Ошибка истории заказов:", error);

        setOrdersError(
          "Не удалось загрузить историю заказов"
        );
      }
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      setProfileError("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@user",
        "@authToken",
      ]);

      // Не оставляем корзину одного аккаунта другому.
      clearCart();

      setUser(null);
      setOrders([]);
      setAuthenticated(false);
      setConfirmLogout(false);

      router.replace("/auth");
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: BRAND.white,
      }}
    >
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 22,
          paddingBottom: 45,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={BRAND.accent}
            colors={[BRAND.accent]}
          />
        }
      >
        <Text
          style={{
            color: BRAND.accent,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 3,
          }}
        >
          MANGAL HOUSE
        </Text>

        <Text
          style={{
            color: BRAND.black,
            fontSize: 32,
            fontWeight: "900",
            marginTop: 5,
            marginBottom: 25,
          }}
        >
          Профиль
        </Text>

        {loading ? (
          <View
            style={{
              paddingVertical: 90,
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color={BRAND.accent}
            />

            <Text
              style={{
                marginTop: 15,
                color: BRAND.muted,
              }}
            >
              Загружаем профиль...
            </Text>
          </View>
        ) : !authenticated ? (
          <View
            style={{
              padding: 26,
              borderRadius: 26,
              backgroundColor: BRAND.surface,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="person-circle-outline"
              size={66}
              color={BRAND.accent}
            />

            <Text
              style={{
                color: BRAND.black,
                fontSize: 22,
                fontWeight: "800",
                marginTop: 13,
              }}
            >
              Войди в аккаунт
            </Text>

            <Text
              style={{
                color: BRAND.muted,
                textAlign: "center",
                marginTop: 9,
                lineHeight: 21,
              }}
            >
              Здесь будут твои данные и история заказов.
            </Text>

            {profileError ? (
              <Text
                style={{
                  color: BRAND.accent,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                {profileError}
              </Text>
            ) : null}

            <Pressable
              onPress={() => router.push("/auth")}
              style={{
                backgroundColor: BRAND.accent,
                borderRadius: 16,
                paddingVertical: 15,
                paddingHorizontal: 35,
                marginTop: 22,
              }}
            >
              <Text
                style={{
                  color: BRAND.white,
                  fontWeight: "800",
                }}
              >
                Войти
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={{
                backgroundColor: BRAND.black,
                borderRadius: 28,
                padding: 22,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View
                style={{
                  height: 64,
                  width: 64,
                  borderRadius: 21,
                  backgroundColor: BRAND.accent,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: BRAND.white,
                    fontSize: 30,
                    fontWeight: "900",
                  }}
                >
                  {user?.name?.trim().charAt(0).toUpperCase() || "M"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: BRAND.white,
                    fontSize: 21,
                    fontWeight: "800",
                  }}
                >
                  {user?.name || "Гость"}
                </Text>

                <Text
                  style={{
                    color: BRAND.white,
                    opacity: 0.65,
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  {user?.phone || "Аккаунт Mangal House"}
                </Text>
              </View>
            </View>

            {profileError ? (
              <Text
                style={{
                  color: BRAND.accent,
                  marginTop: 13,
                  fontSize: 12,
                }}
              >
                {profileError}
              </Text>
            ) : null}

            <Text
              style={{
                color: BRAND.black,
                fontSize: 21,
                fontWeight: "800",
                marginTop: 32,
                marginBottom: 9,
              }}
            >
              Личные данные
            </Text>

            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: BRAND.border,
                paddingHorizontal: 18,
              }}
            >
              <InfoRow
                icon="person-outline"
                label="Имя"
                value={user?.name || ""}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: BRAND.border,
                }}
              />

              <InfoRow
                icon="call-outline"
                label="Телефон"
                value={user?.phone || ""}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: BRAND.border,
                }}
              />

              <InfoRow
                icon="location-outline"
                label="Адрес доставки"
                value={user?.address || ""}
              />
            </View>

            <Pressable
              onPress={() => router.push("/edit-profile")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BRAND.accent,
                borderRadius: 18,
                paddingVertical: 16,
                marginTop: 15,
              }}
            >
              <Ionicons
                name="create-outline"
                size={21}
                color={BRAND.white}
              />

              <Text
                style={{
                  color: BRAND.white,
                  fontSize: 14,
                  fontWeight: "800",
                  marginLeft: 10,
                }}
              >
                Изменить данные
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/addresses")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BRAND.surface,
                borderRadius: 18,
                paddingVertical: 16,
                marginTop: 11,
                gap: 9,
              }}
            >
              <Ionicons name="location-outline" size={21} color={BRAND.accent} />
              <Text style={{ color: BRAND.black, fontSize: 14, fontWeight: "800" }}>
                Мои адреса доставки
              </Text>
              <Ionicons name="chevron-forward" size={17} color={BRAND.muted} />
            </Pressable>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 34,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: BRAND.black,
                  fontSize: 21,
                  fontWeight: "800",
                }}
              >
                Мои заказы
              </Text>

              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: BRAND.accentSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text
                  style={{
                    color: BRAND.accent,
                    fontWeight: "800",
                  }}
                >
                  {orders.length}
                </Text>
              </View>
            </View>

            {ordersError ? (
              <View
                style={{
                  backgroundColor: BRAND.surface,
                  padding: 20,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: BRAND.black,
                    textAlign: "center",
                  }}
                >
                  {ordersError}
                </Text>

                <Pressable
                  onPress={() => loadData(true)}
                  style={{ marginTop: 12 }}
                >
                  <Text
                    style={{
                      color: BRAND.accent,
                      textAlign: "center",
                      fontWeight: "800",
                    }}
                  >
                    Повторить
                  </Text>
                </Pressable>
              </View>
            ) : orders.length === 0 ? (
              <View
                style={{
                  backgroundColor: BRAND.surface,
                  borderRadius: 24,
                  padding: 30,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={BRAND.accent}
                />

                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 17,
                    fontWeight: "800",
                    color: BRAND.black,
                  }}
                >
                  Заказов пока нет
                </Text>

                <Text
                  style={{
                    color: BRAND.muted,
                    marginTop: 8,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Первый заказ обязательно появится здесь!
                </Text>

                <Pressable
                  onPress={() => router.navigate("/(tabs)")}
                  style={{
                    backgroundColor: BRAND.accent,
                    borderRadius: 14,
                    paddingHorizontal: 23,
                    paddingVertical: 12,
                    marginTop: 20,
                  }}
                >
                  <Text
                    style={{
                      color: BRAND.white,
                      fontWeight: "800",
                    }}
                  >
                    Выбрать блюда
                  </Text>
                </Pressable>
              </View>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}

            <View style={{ marginTop: 35 }}>
              {confirmLogout ? (
                <View
                  style={{
                    backgroundColor: BRAND.surface,
                    padding: 20,
                    borderRadius: 22,
                  }}
                >
                  <Text
                    style={{
                      color: BRAND.black,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    Выйти из аккаунта?
                  </Text>

                  <Text
                    style={{
                      color: BRAND.muted,
                      fontSize: 13,
                      marginTop: 7,
                    }}
                  >
                    Корзина на этом устройстве также очистится.
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginTop: 18,
                    }}
                  >
                    <Pressable
                      onPress={() => setConfirmLogout(false)}
                      style={{
                        flex: 1,
                        padding: 13,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: BRAND.black,
                          fontWeight: "700",
                        }}
                      >
                        Отмена
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={logout}
                      style={{
                        flex: 1,
                        backgroundColor: BRAND.black,
                        borderRadius: 14,
                        padding: 13,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: BRAND.white,
                          fontWeight: "700",
                        }}
                      >
                        Выйти
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setConfirmLogout(true)}
                  style={{
                    padding: 18,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: BRAND.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={21}
                    color={BRAND.black}
                  />

                  <Text
                    style={{
                      color: BRAND.black,
                      fontWeight: "800",
                    }}
                  >
                    Выйти из аккаунта
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
