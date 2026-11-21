
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import { getMenu } from "@/services/menuApi";
import { getAssetUrl } from "@/services/api";
import type { MenuItem } from "@/types/menu.types";

function DishCard({ item }: { item: MenuItem }) {
  const { addItem, ready } = useCart();
  const imageUrl = getAssetUrl(item.image);

  const openDish = () => {
    router.push({
      pathname: "/modal",
      params: { id: String(item.id) },
    });
  };

  return (
    <View
      className="flex-1 overflow-hidden rounded-3xl bg-paper"
      style={{
        borderWidth: 1,
        borderColor: BRAND.border,
      }}
    >
      <Pressable onPress={openDish}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 140 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="h-36 items-center justify-center"
            style={{ backgroundColor: BRAND.surface }}
          >
            <Text style={{ fontSize: 54 }}>{item.emoji}</Text>
          </View>
        )}

        {item.popular && (
          <View
            className="absolute left-2 top-2 rounded-full px-3 py-1"
            style={{ backgroundColor: BRAND.black }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: BRAND.white }}
            >
              ХИТ
            </Text>
          </View>
        )}

        <View className="px-3 pt-3">
          <Text
            className="text-[15px] font-bold"
            style={{ color: BRAND.black }}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text
            className="mt-1 text-xs"
            style={{ color: BRAND.muted }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      </Pressable>

      <View className="mt-auto flex-row items-center justify-between p-3">
        <Text
          className="text-base font-extrabold"
          style={{ color: BRAND.black }}
        >
          {item.price} ₽
        </Text>

        <Pressable
          disabled={!ready || !item.available}
          onPress={() => addItem(item)}
          className="h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor:
              !ready || !item.available
                ? BRAND.surface
                : BRAND.accent,
          }}
        >
          <Ionicons
            name={item.available ? "add" : "close"}
            size={22}
            color={
              !ready || !item.available
                ? BRAND.muted
                : BRAND.white
            }
          />
        </Pressable>
      </View>

      {!item.available && (
        <Text
          className="pb-3 text-center text-xs"
          style={{ color: BRAND.muted }}
        >
          Сейчас недоступно
        </Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { totalItems } = useCart();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");

  const loadMenu = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const data = await getMenu();
      setMenu(data);
    } catch {
      setError("Не удалось загрузить меню. Проверь подключение к серверу.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(
    () => [
      "Все",
      ...Array.from(new Set(menu.map((item) => item.category))),
    ],
    [menu]
  );

  const filteredMenu = useMemo(() => {
    const search = query.trim().toLowerCase();

    return menu.filter((item) => {
      const matchesCategory =
        category === "Все" || item.category === category;

      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [menu, query, category]);

  const rows: MenuItem[][] = [];

  for (let i = 0; i < filteredMenu.length; i += 2) {
    rows.push(filteredMenu.slice(i, i + 2));
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: BRAND.white }}
    >
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMenu(true)}
            tintColor={BRAND.accent}
            colors={[BRAND.accent]}
          />
        }
      >
        <View className="px-5 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text
                className="text-xs font-semibold tracking-[3px]"
                style={{ color: BRAND.accent }}
              >
                MANGAL
              </Text>

              <Text
                className="text-3xl font-black"
                style={{ color: BRAND.black }}
              >
                HOUSE.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/basket")}
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: BRAND.surface }}
            >
              <Ionicons
                name="bag-handle-outline"
                size={23}
                color={BRAND.black}
              />

              {totalItems > 0 && (
                <View
                  className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1"
                  style={{ backgroundColor: BRAND.accent }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: BRAND.white }}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <ImageBackground
            source={require("@/assets/images/foodBg.jpg")}
            imageStyle={{
              borderRadius: 28,
              opacity: 0.32,
            }}
            style={{
              height: 208,
              borderRadius: 28,
              backgroundColor: BRAND.black,
              overflow: "hidden",
              justifyContent: "space-between",
              padding: 22,
            }}
          >
            <View
              className="self-start rounded-full px-3 py-1.5"
              style={{ backgroundColor: BRAND.accent }}
            >
              <Text
                className="text-[10px] font-bold tracking-widest"
                style={{ color: BRAND.white }}
              >
                ВКУС НА ОГНЕ
              </Text>
            </View>

            <View>
              <Text
                className="text-[31px] font-black leading-9"
                style={{ color: BRAND.white }}
              >
                Сочно.{"\n"}Ярко. Вкусно.
              </Text>

              <Text
                className="mt-2 text-sm"
                style={{ color: BRAND.white, opacity: 0.85 }}
              >
                Выбирай любимые блюда в Mangal House
              </Text>
            </View>
          </ImageBackground>

          <View
            className="mt-6 flex-row items-center rounded-2xl px-4"
            style={{
              backgroundColor: BRAND.surface,
              height: 54,
            }}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color={BRAND.muted}
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Найти любимое блюдо..."
              placeholderTextColor={BRAND.muted}
              className="ml-3 flex-1 text-sm"
              style={{ color: BRAND.black }}
            />

            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={BRAND.muted}
                />
              </Pressable>
            )}
          </View>

          <View className="mb-4 mt-8 flex-row items-end justify-between">
            <View>
              <Text
                className="text-2xl font-extrabold"
                style={{ color: BRAND.black }}
              >
                Наше меню
              </Text>

              <Text
                className="mt-1 text-xs"
                style={{ color: BRAND.muted }}
              >
                Выбирай то, что хочется сегодня
              </Text>
            </View>

            <Text
              className="text-xs font-bold"
              style={{ color: BRAND.accent }}
            >
              {filteredMenu.length} блюд
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            gap: 8,
          }}
        >
          {categories.map((name) => {
            const active = name === category;

            return (
              <Pressable
                key={name}
                onPress={() => setCategory(name)}
                className="rounded-full px-5 py-3"
                style={{
                  backgroundColor: active
                    ? BRAND.black
                    : BRAND.surface,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: active ? BRAND.white : BRAND.black,
                  }}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-5">
          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator
                size="large"
                color={BRAND.accent}
              />
              <Text
                className="mt-4 text-sm"
                style={{ color: BRAND.muted }}
              >
                Загружаем вкусное...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center py-12">
              <Ionicons
                name="cloud-offline-outline"
                size={42}
                color={BRAND.muted}
              />

              <Text
                className="mt-4 text-center text-sm"
                style={{ color: BRAND.black }}
              >
                {error}
              </Text>

              <Pressable
                onPress={() => loadMenu()}
                className="mt-5 rounded-2xl px-6 py-3"
                style={{ backgroundColor: BRAND.accent }}
              >
                <Text style={{ color: BRAND.white }}>
                  Повторить
                </Text>
              </Pressable>
            </View>
          ) : rows.length === 0 ? (
            <View className="items-center py-14">
              <Ionicons
                name="restaurant-outline"
                size={42}
                color={BRAND.muted}
              />
              <Text
                className="mt-3 text-base font-semibold"
                style={{ color: BRAND.black }}
              >
                Ничего не найдено
              </Text>
            </View>
          ) : (
            rows.map((row, index) => (
              <View
                key={index}
                className="mb-3 flex-row"
                style={{ gap: 12 }}
              >
                {row.map((item) => (
                  <DishCard key={item.id} item={item} />
                ))}

                {row.length === 1 && (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
