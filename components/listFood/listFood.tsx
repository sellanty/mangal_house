import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getMenu } from "@/services/menuApi";
import { MenuItem } from "@/types/menu.types";
import { getAssetUrl } from "@/services/api";

export function ListFood() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getMenu();
      setMenu(data);
    } catch (error) {
      console.error("Ошибка загрузки меню:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-500 mt-4">Загрузка меню...</Text>
      </View>
    );
  }

  // двухколоночноe отображениe
  const chunkedMenu = [];
  for (let i = 0; i < menu.length; i += 2) {
    chunkedMenu.push(menu.slice(i, i + 2));
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {chunkedMenu.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-4">
          {row.map((item) => {
            const imageUrl = getAssetUrl(item.image);

            return (
              <Link href={`/modal?id=${item.id}`} asChild key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  className="w-[48%] bg-white rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-32 bg-orange-100 items-center justify-center">
                      <Text className="text-5xl">{item.emoji}</Text>
                    </View>
                  )}

                  <LinearGradient
                    colors={["#ffffff", "#fff7ed"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="p-3"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text
                        className="text-base font-bold text-gray-800 flex-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          console.log("Добавлено в корзину:", item.name);
                        }}
                        className="w-7 h-7 bg-orange-500 rounded-full items-center justify-center shadow-md active:bg-orange-600"
                      >
                        <Ionicons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="text-orange-600 font-extrabold text-base">
                        {item.price} ₽
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={12} color="#fbbf24" />
                        <Text className="text-gray-500 text-xs ml-0.5">
                          4.5
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
