import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function OtherScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@user');
            await AsyncStorage.removeItem('@authToken')
            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-blue-500 p-6">
      <Text className="text-white text-2xl font-bold mb-4">Профиль</Text>
      
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-xl mt-4"
      >
        <Text className="text-white font-semibold text-lg">Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}