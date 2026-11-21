
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { BRAND } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import { getMenu } from "@/services/menuApi";
import { getAssetUrl } from "@/services/api";

import type { MenuItem } from "@/types/menu.types";

type FilterMode = "all" | "available" | "popular";
type SortMode = "popular" | "cheap" | "expensive";

const formatPrice = (price: number) =>
  `${price.toLocaleString("ru-RU")} ₽`;

function ProductCard({ item }: { item: MenuItem }) {
  const { addItem, ready } = useCart();

  const imageUrl = getAssetUrl(item.image);

  const openProduct = () => {
    router.push({
      pathname: "/modal",
      params: { id: String(item.id) },
    });
  };

  return (
    <View style={styles.productCard}>
      <Pressable
        onPress={openProduct}
        style={styles.productImageWrap}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productPlaceholder}>
            <Text style={{ fontSize: 46 }}>
              {item.emoji || "🍽️"}
            </Text>
          </View>
        )}

        {item.popular && (
          <View style={styles.hitBadge}>
            <Text style={styles.hitText}>ХИТ</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.productContent}>
        <Pressable onPress={openProduct}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category}
          </Text>

          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <Text
            style={styles.productDescription}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </Pressable>

        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>
            {formatPrice(item.price)}
          </Text>

          <Pressable
            onPress={() => addItem(item)}
            disabled={!item.available || !ready}
            style={[
              styles.addButton,
              (!item.available || !ready) &&
                styles.addButtonDisabled,
            ]}
          >
            <Ionicons
              name={item.available ? "add" : "close"}
              size={22}
              color={
                !item.available || !ready
                  ? BRAND.muted
                  : BRAND.white
              }
            />
          </Pressable>
        </View>

        {!item.available && (
          <Text style={styles.unavailableText}>
            Нет в наличии
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const { totalItems } = useCart();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("popular");

  const loadMenu = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await getMenu();
      setMenu(result);
    } catch (err) {
      console.error("Ошибка каталога:", err);
      setError("Не удалось загрузить каталог блюд");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(menu.map((item) => item.category))
    );

    return [
      "Все",
      ...unique.sort((a, b) => a.localeCompare(b, "ru")),
    ];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru-RU");

    const result = menu.filter((item) => {
      const matchSearch =
        !query ||
        item.name.toLocaleLowerCase("ru-RU").includes(query) ||
        (item.description || "")
          .toLocaleLowerCase("ru-RU")
          .includes(query);

      const matchCategory =
        category === "Все" || item.category === category;

      const matchFilter =
        filter === "all" ||
        (filter === "available" && item.available) ||
        (filter === "popular" && item.popular);

      return matchSearch && matchCategory && matchFilter;
    });

    result.sort((a, b) => {
      if (sort === "cheap") {
        return a.price - b.price;
      }

      if (sort === "expensive") {
        return b.price - a.price;
      }

      return (
        Number(Boolean(b.popular)) -
          Number(Boolean(a.popular)) ||
        a.name.localeCompare(b.name, "ru")
      );
    });

    return result;
  }, [menu, search, category, filter, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("Все");
    setFilter("all");
    setSort("popular");
  };

  const filterOptions: {
    value: FilterMode;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { value: "all", title: "Все блюда", icon: "grid-outline" },
    {
      value: "available",
      title: "В наличии",
      icon: "checkmark-circle-outline",
    },
    { value: "popular", title: "Хиты", icon: "flame-outline" },
  ];

  const sortOptions: {
    value: SortMode;
    title: string;
  }[] = [
    { value: "popular", title: "Популярные" },
    { value: "cheap", title: "Сначала дешевле" },
    { value: "expensive", title: "Сначала дороже" },
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.container}
    >
<StatusBar style="dark" />
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard item={item} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => void loadMenu(true)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandLabel}>
                  MANGAL HOUSE
                </Text>

                <Text style={styles.title}>
                  Каталог блюд.
                </Text>

                <Text style={styles.subtitle}>
                  Найди то, что хочется именно сейчас
                </Text>
              </View>

              <Pressable
                style={styles.basketButton}
                onPress={() =>
                  router.navigate("/(tabs)/basket")
                }
              >
                <Ionicons
                  name="bag-handle-outline"
                  size={24}
                  color={BRAND.black}
                />

                {totalItems > 0 && (
                  <View style={styles.basketBadge}>
                    <Text style={styles.basketBadgeText}>
                      {totalItems > 99 ? "99+" : totalItems}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={22}
                color={BRAND.accent}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Шашлык, картофель, напитки..."
                placeholderTextColor={BRAND.muted}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={21}
                    color={BRAND.muted}
                  />
                </Pressable>
              )}
            </View>

            <Text style={styles.sectionLabel}>
              КАТЕГОРИИ
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalFilters}
            >
              {categories.map((name) => {
                const selected = category === name;

                return (
                  <Pressable
                    key={name}
                    onPress={() => setCategory(name)}
                    style={[
                      styles.categoryChip,
                      selected && styles.selectedCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.selectedCategoryText,
                      ]}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalFilters}
              style={{ marginTop: 16 }}
            >
              {filterOptions.map((option) => {
                const selected = filter === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setFilter(option.value)}
                    style={[
                      styles.filterChip,
                      selected && styles.selectedFilter,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={17}
                      color={
                        selected
                          ? BRAND.accent
                          : BRAND.black
                      }
                    />

                    <Text
                      style={[
                        styles.filterText,
                        selected && {
                          color: BRAND.accent,
                        },
                      ]}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
              СОРТИРОВКА
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalFilters}
            >
              {sortOptions.map((option) => {
                const selected = sort === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSort(option.value)}
                    style={[
                      styles.sortChip,
                      selected && styles.selectedSort,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortText,
                        selected && {
                          color: BRAND.white,
                        },
                      ]}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>
                  Найденные блюда
                </Text>

                <Text style={styles.resultsCount}>
                  {filteredMenu.length} позиций
                </Text>
              </View>

              {(search ||
                category !== "Все" ||
                filter !== "all" ||
                sort !== "popular") && (
                <Pressable onPress={resetFilters}>
                  <Text style={styles.resetText}>
                    Сбросить
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color={BRAND.accent}
                />
                <Text style={styles.emptyText}>
                  Загружаем каталог...
                </Text>
              </>
            ) : error ? (
              <>
                <Ionicons
                  name="cloud-offline-outline"
                  size={48}
                  color={BRAND.muted}
                />

                <Text style={styles.emptyTitle}>
                  Нет связи с сервером
                </Text>

                <Text style={styles.emptyText}>
                  {error}
                </Text>

                <Pressable
                  onPress={() => void loadMenu()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Попробовать снова
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={BRAND.muted}
                />

                <Text style={styles.emptyTitle}>
                  Ничего не найдено
                </Text>

                <Text style={styles.emptyText}>
                  Попробуй выбрать другую категорию или изменить запрос.
                </Text>

                <Pressable
                  onPress={resetFilters}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Сбросить фильтры
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 25,
  },
  brandLabel: {
    color: BRAND.accent,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 2.5,
  },
  title: {
    color: BRAND.black,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },
  subtitle: {
    color: BRAND.muted,
    fontSize: 12,
    marginTop: 7,
  },
  basketButton: {
    height: 48,
    width: 48,
    borderRadius: 17,
    backgroundColor: BRAND.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  basketBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.accent,
  },
  basketBadgeText: {
    color: BRAND.white,
    fontSize: 10,
    fontWeight: "800",
  },
  searchBox: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: BRAND.surface,
    marginBottom: 26,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: BRAND.black,
    fontSize: 14,
    height: "100%",
  },
  sectionLabel: {
    fontSize: 10,
    color: BRAND.muted,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },
  horizontalFilters: {
    gap: 9,
    paddingRight: 10,
  },
  categoryChip: {
    paddingHorizontal: 19,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: BRAND.surface,
  },
  selectedCategory: {
    backgroundColor: BRAND.black,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND.black,
  },
  selectedCategoryText: {
    color: BRAND.white,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BRAND.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  selectedFilter: {
    backgroundColor: BRAND.accentSoft,
    borderColor: BRAND.accent,
  },
  filterText: {
    color: BRAND.black,
    fontSize: 12,
    fontWeight: "600",
  },
  sortChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: BRAND.surface,
    borderRadius: 12,
  },
  selectedSort: {
    backgroundColor: BRAND.black,
  },
  sortText: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND.black,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 29,
    marginBottom: 16,
  },
  resultsTitle: {
    color: BRAND.black,
    fontSize: 21,
    fontWeight: "900",
  },
  resultsCount: {
    color: BRAND.muted,
    fontSize: 12,
    marginTop: 5,
  },
  resetText: {
    color: BRAND.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  productCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.white,
    borderRadius: 23,
    padding: 10,
    marginBottom: 13,
    overflow: "hidden",
    minHeight: 146,
  },
  productImageWrap: {
    width: 118,
    height: 125,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productPlaceholder: {
    flex: 1,
    backgroundColor: BRAND.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  hitBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: BRAND.black,
  },
  hitText: {
    fontSize: 9,
    fontWeight: "900",
    color: BRAND.white,
  },
  productContent: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 4,
    justifyContent: "space-between",
  },
  productCategory: {
    color: BRAND.accent,
    fontSize: 10,
    fontWeight: "700",
  },
  productName: {
    color: BRAND.black,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  productDescription: {
    color: BRAND.muted,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },
  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: BRAND.black,
  },
  addButton: {
    height: 38,
    width: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.accent,
  },
  addButtonDisabled: {
    backgroundColor: BRAND.surface,
  },
  unavailableText: {
    color: BRAND.muted,
    fontSize: 10,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: BRAND.black,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 18,
    textAlign: "center",
  },
  emptyText: {
    color: BRAND.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 11,
  },
  retryButton: {
    backgroundColor: BRAND.accent,
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 22,
  },
  retryText: {
    color: BRAND.white,
    fontWeight: "800",
    fontSize: 13,
  },
});
