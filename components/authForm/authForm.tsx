import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { login, register } from "@/services/authApi";
import { router } from "expo-router";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isLoginMode = mode === "login";

  const handleSubmit = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Введите телефон и пароль");
      return;
    }

    if (!isLoginMode && (!name.trim() || !address.trim())) {
      Alert.alert("Ошибка", "Заполните имя и адрес доставки");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Ошибка", "Пароль должен быть минимум 6 символов");
      return;
    }

    setLoading(true);

    try {
      const response = isLoginMode
        ? await login(phone, password)
        : await register(phone, name, address, password);

      if (response.success) {
        if (response.user) {
          await AsyncStorage.setItem("@user", JSON.stringify(response.user));
        }

        if (response.token) {
          await AsyncStorage.setItem("@authToken", response.token);
        }

        Alert.alert("Успех", response.message || "Добро пожаловать!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Ошибка", response.message || "Что-то пошло не так");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось соединиться с сервером");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setFocusedField(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <ImageBackground
          source={require("../../assets/images/foodBg.jpg")}
          className="flex-1"
          imageStyle={{ opacity: 0.7 }}
        >
          <View className="flex-1 justify-center p-6 pt-16 pb-10">
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4 shadow-lg">
                <Text className="text-5xl">🔥</Text>
              </View>
              <Text className="text-3xl font-bold text-orange-600">
                Mangal House
              </Text>
              <Text className="text-white/90 font-bold text-center mt-2 max-w-xs">
                Добро пожаловать в ресторан азербайджанской кухни
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-300">
              <Text className="text-xl font-bold text-gray-800 mb-2">
                {isLoginMode ? "Вход" : "Регистрация"}
              </Text>

              <Text className="text-gray-500 text-sm mb-5">
                {isLoginMode
                  ? "Введите телефон и пароль, чтобы войти"
                  : "Создайте аккаунт для оформления заказов"}
              </Text>

              {!isLoginMode && (
                <View className="mb-5">
                  <Text className="text-gray-700 font-medium mb-2 ml-1">
                    Ваше имя
                  </Text>
                  <TextInput
                    className={`bg-gray-50 p-4 rounded-2xl text-base border transition-all ${
                      focusedField === "name"
                        ? "border-orange-500 bg-white"
                        : "border-gray-200"
                    }`}
                    placeholder="Рамин"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    editable={!loading}
                  />
                </View>
              )}

              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Номер телефона
                </Text>
                <TextInput
                  className={`bg-gray-50 p-4 rounded-2xl text-base border transition-all ${
                    focusedField === "phone"
                      ? "border-orange-500 bg-white"
                      : "border-gray-200"
                  }`}
                  placeholder="+7 (999) 123-45-67"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                />
              </View>

              {!isLoginMode && (
                <View className="mb-5">
                  <Text className="text-gray-700 font-medium mb-2 ml-1">
                    Адрес доставки
                  </Text>
                  <TextInput
                    className={`bg-gray-50 p-4 rounded-2xl text-base border transition-all min-h-[80px] max-h-[100px] ${
                      focusedField === "address"
                        ? "border-orange-500 bg-white"
                        : "border-gray-200"
                    }`}
                    placeholder="ул. Пушкина, д. 10, кв. 5"
                    placeholderTextColor="#9ca3af"
                    value={address}
                    onChangeText={setAddress}
                    onFocus={() => setFocusedField("address")}
                    onBlur={() => setFocusedField(null)}
                    editable={!loading}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View className="mb-7">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Пароль
                </Text>
                <TextInput
                  className={`bg-gray-50 p-4 rounded-2xl text-base border transition-all ${
                    focusedField === "password"
                      ? "border-orange-500 bg-white"
                      : "border-gray-200"
                  }`}
                  placeholder="Минимум 6 символов"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    loading ? ["#fdba74", "#f97316"] : ["#f97316", "#ea580c"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 rounded-2xl shadow-lg shadow-orange-300"
                >
                  {loading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="white" />
                      <Text className="text-white text-center font-bold text-lg ml-2">
                        Подождите...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">
                      {isLoginMode ? "Войти" : "Зарегистрироваться"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={switchMode}
                disabled={loading}
                className="mt-5"
              >
                <Text className="text-center text-gray-600">
                  {isLoginMode
                    ? "Нет аккаунта?"
                    : "Уже есть аккаунт?"}{" "}
                  <Text className="text-orange-600 font-bold">
                    {isLoginMode ? "Зарегистрироваться" : "Войти"}
                  </Text>
                </Text>
              </TouchableOpacity>

              <Text className="text-gray-400 text-xs text-center mt-6">
                Нажимая кнопку, вы соглашаетесь с условиями доставки
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}