import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getMenuItemById } from "@/services/menuApi";
import { MenuItem } from "@/types/menu.types";
import { getAssetUrl } from "@/services/api";

export default function ModalMenu() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const rawId = Array.isArray(id) ? id[0] : id;
  const itemId = rawId ? Number(rawId) : null;

  useEffect(() => {
    if (!itemId || Number.isNaN(itemId)) {
      setLoading(false);
      return;
    }

    loadMenuItem(itemId);
  }, [itemId]);

  const loadMenuItem = async (menuItemId: number) => {
    try {
      const data = await getMenuItemById(menuItemId);
      setItem(data);
    } catch (error) {
      console.error("Ошибка загрузки блюда:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="bg-white p-8 rounded-2xl items-center shadow-lg">
          <Text className="text-red-600 text-2xl font-bold text-center mb-4">
            Блюдо не найдено
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-orange-500 px-8 py-3 rounded-xl mt-4"
          >
            <Text className="text-white font-semibold text-lg">
              Назад к меню
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const imageUrl = getAssetUrl(item.image);

  const handleAddToCart = () => {
    console.log("Добавлено в корзину:", item.name, "Количество:", quantity);
    router.back();
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <View className="flex-1 bg-white">
      {/* Градиентный заголовок */}
      <LinearGradient
        colors={["#f97316", "#ea580c", "#c2410c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="p-6 pt-14">
          {/* Кнопка закрытия */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-14 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center z-10 active:bg-white/30"
          >
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>

          {/* Фото блюда */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-52 rounded-2xl mb-4"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-52 bg-white/20 rounded-2xl items-center justify-center mb-4">
              <Text className="text-7xl">{item.emoji}</Text>
            </View>
          )}

          {/* Название и рейтинг */}
          <View className="mb-2">
            <Text className="text-white text-3xl font-bold tracking-tight">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Ionicons name="star-half" size={14} color="#fbbf24" />
                <Text className="text-white text-sm ml-1 font-medium">4.8</Text>
              </View>
              <Text className="text-orange-200 text-xs ml-2">
                ⭐ 128 отзывов
              </Text>
            </View>
          </View>

          {/* Цена */}
          <View className="mt-3">
            <View className="flex-row items-baseline">
              <Text className="text-white text-4xl font-bold">
                {item.price} ₽
              </Text>
              <Text className="text-orange-200 text-sm ml-2">за порцию</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Основной контент */}
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Описание */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#ea580c"
              />
            </View>
            <Text className="font-bold text-xl text-gray-900">Описание</Text>
          </View>
          <Text className="text-gray-600 leading-6 text-base ml-13">
            {item.description}
          </Text>
        </View>

        {/* Состав */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
              <Ionicons name="nutrition-outline" size={22} color="#ea580c" />
            </View>
            <Text className="font-bold text-xl text-gray-900">Состав</Text>
          </View>
          <View className="bg-orange-50 rounded-xl p-5 ml-13 border border-orange-100">
            <Text className="text-gray-700 leading-relaxed text-base">
              {item.ingredients || "Баранина, лук, специи, зелень"}
            </Text>
          </View>
        </View>

        {/* Категория и информация */}
        <View className="flex-row mb-8 ml-12">
          <View className="flex-1 bg-gray-100 rounded-xl p-4 mr-2">
            <View className="items-center">
              <Ionicons name="restaurant-outline" size={20} color="#ea580c" />
              <Text className="text-gray-500 text-xs text-center mt-1">
                Категория
              </Text>
              <Text className="text-gray-800 font-bold text-center text-sm mt-1">
                {item.category}
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-gray-100 rounded-xl p-4 ml-2">
            <View className="items-center">
              <Ionicons name="time-outline" size={20} color="#ea580c" />
              <Text className="text-gray-500 text-xs text-center mt-1">
                Время готовки
              </Text>
              <Text className="text-gray-800 font-bold text-center text-sm mt-1">
                20-30 мин
              </Text>
            </View>
          </View>
        </View>

        {/* Выбор количества */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
              <Ionicons name="add-circle-outline" size={22} color="#ea580c" />
            </View>
            <Text className="font-bold text-xl text-gray-900">Количество</Text>
          </View>

          <View className="flex-row justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100 ml-12">
            <TouchableOpacity
              onPress={decreaseQuantity}
              className="w-12 h-12 bg-white rounded-full items-center justify-center active:bg-gray-100 shadow-sm"
            >
              <Text className="text-2xl font-bold text-gray-600">-</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-4xl font-bold text-orange-600">
                {quantity}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">порций</Text>
            </View>

            <TouchableOpacity
              onPress={increaseQuantity}
              className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center active:bg-orange-600 shadow-md"
            >
              <Text className="text-2xl font-bold text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Итого */}
        <View className="bg-orange-50 rounded-xl p-5 mb-8 mx-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 font-semibold text-base">
              Сумма заказа:
            </Text>
            <Text className="text-3xl font-bold text-orange-600">
              {item.price * quantity} ₽
            </Text>
          </View>
        </View>

        {/* Кнопки действий */}
        <View className="pb-10">
          <TouchableOpacity
            onPress={handleAddToCart}
            className="bg-orange-500 py-4 rounded-xl mb-4 active:bg-orange-600 shadow-lg shadow-orange-200"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="cart" size={22} color="white" />
              <Text className="text-white text-center font-bold text-lg ml-2">
                Добавить в корзину
              </Text>
            </View>
            <Text className="text-orange-100 text-center text-sm mt-1">
              {quantity} шт. • {item.price * quantity} ₽
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="py-4 rounded-xl border border-gray-300 active:bg-gray-50"
          >
            <Text className="text-gray-600 text-center font-semibold text-base">
              Продолжить выбор
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
