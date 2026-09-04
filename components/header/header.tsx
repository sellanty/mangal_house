import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function Header() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      
        <View className="pt-2 pb-3 px-4">
          {/* Верхняя строка с иконками */}
          <View className="flex-row justify-between items-center mb-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="menu" size={18} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
              <Text className="text-white/80 text-[10px]">Работаем 11:00–23:00</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push('/')}
              className="w-8 h-8 bg-white/20 rounded-full items-center justify-center relative"
            >
              <Ionicons name="cart-outline" size={18} color="white" />
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[8px] font-bold">0</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Логотип и название */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                <Text className="text-2xl">🔥</Text>
              </View>
              <View>
                <Text className="text-white text-lg font-bold tracking-wide">
                  Mangal House
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Ionicons name="star-half" size={12} color="#fbbf24" />
                  <Text className="text-orange-100 text-[10px] ml-1">4.8</Text>
                </View>
              </View>
            </View>
            
            {/* Информация о доставке */}
            <View className="flex-row">
              <View className="flex-row items-center bg-white/15 px-2 py-1 rounded-full mr-1">
                <Ionicons name="time-outline" size={10} color="#fed7aa" />
                <Text className="text-orange-100 text-[9px] ml-0.5">30–45</Text>
              </View>
              <View className="flex-row items-center bg-white/15 px-2 py-1 rounded-full">
                <Ionicons name="bicycle-outline" size={10} color="#fed7aa" />
                <Text className="text-orange-100 text-[9px] ml-0.5">0₽</Text>
              </View>
            </View>
          </View>

          {/* Акция */}
          <View className="mt-2 bg-white/15 rounded-lg p-1.5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-sm mr-1">🎁</Text>
              <Text className="text-orange-100 text-[10px] font-medium">
                Десерт в подарок за первый заказ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={12} color="#fed7aa" />
          </View>
        </View>
    </LinearGradient>
  );
}