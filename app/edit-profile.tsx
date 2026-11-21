
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { BRAND } from "@/constants/brand";
import { getProfile, updateProfile } from "@/services/profileApi";

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const savingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const user = await getProfile();

        if (!active) return;

        setName(user.name ?? "");
        setPhone(user.phone ?? "");
        setAddress(user.address ?? "");
      } catch {
        if (active) {
          setError("Не удалось загрузить профиль. Проверь соединение.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (savingRef.current) return;

    const cleanName = name.trim();
    const cleanAddress = address.trim();

    if (cleanName.length < 2 || cleanName.length > 60) {
      setError("Имя должно содержать от 2 до 60 символов");
      return;
    }

    if (cleanAddress.length > 250) {
      setError("Адрес не должен превышать 250 символов");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      const user = await updateProfile({
        name: cleanName,
        address: cleanAddress,
      });

      await AsyncStorage.setItem(
        "@user",
        JSON.stringify(user)
      );

      router.back();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;

        setError(
          typeof message === "string"
            ? message
            : "Не удалось сохранить изменения"
        );
      } else {
        setError("Произошла ошибка при сохранении");
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.screen}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={BRAND.black}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Редактирование
          </Text>

          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={BRAND.accent}
            />
          </View>
        ) : (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.eyebrow}>
                ЛИЧНЫЙ КАБИНЕТ
              </Text>

              <Text style={styles.title}>
                Твои данные.
              </Text>

              <Text style={styles.description}>
                Обнови имя и адрес, чтобы оформление
                следующих заказов стало удобнее.
              </Text>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name.trim().charAt(0).toUpperCase() || "M"}
                </Text>
              </View>

              <Text style={styles.label}>
                Имя
              </Text>

              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="Как тебя зовут?"
                placeholderTextColor={BRAND.muted}
                maxLength={60}
                autoCapitalize="words"
                style={styles.input}
              />

              <Text style={styles.label}>
                Номер телефона
              </Text>

              <View style={styles.lockedInput}>
                <Text style={styles.phoneText}>
                  {phone}
                </Text>

                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={BRAND.muted}
                />
              </View>

              <Text style={styles.hint}>
                Телефон привязан к аккаунту и пока не изменяется.
              </Text>

              <Text style={styles.label}>
                Адрес доставки
              </Text>

              <TextInput
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  setError("");
                }}
                placeholder="Город, улица, дом, квартира"
                placeholderTextColor={BRAND.muted}
                multiline
                maxLength={250}
                textAlignVertical="top"
                style={[styles.input, styles.addressInput]}
              />

              <Text style={styles.hint}>
                Этот адрес будет указан в профиле.
                При оформлении заказа его можно изменить.
              </Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={BRAND.accent}
                  />

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[
                  styles.saveButton,
                  saving && { opacity: 0.65 },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={BRAND.white} />
                ) : (
                  <Ionicons
                    name="checkmark-outline"
                    size={22}
                    color={BRAND.white}
                  />
                )}

                <Text style={styles.saveText}>
                  {saving ? "Сохраняем..." : "Сохранить изменения"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: BRAND.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: BRAND.black,
    fontSize: 15,
    fontWeight: "800",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 35,
  },
  eyebrow: {
    color: BRAND.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  title: {
    color: BRAND.black,
    fontSize: 33,
    fontWeight: "900",
    marginTop: 8,
  },
  description: {
    color: BRAND.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: BRAND.black,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 14,
  },
  avatarText: {
    color: BRAND.accent,
    fontSize: 34,
    fontWeight: "900",
  },
  label: {
    color: BRAND.black,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 10,
  },
  input: {
    backgroundColor: BRAND.surface,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 17,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: BRAND.black,
  },
  addressInput: {
    minHeight: 100,
  },
  lockedInput: {
    backgroundColor: BRAND.surface,
    borderRadius: 17,
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneText: {
    color: BRAND.muted,
    fontSize: 15,
  },
  hint: {
    color: BRAND.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: BRAND.accentSoft,
    borderRadius: 14,
    padding: 14,
    marginTop: 25,
  },
  errorText: {
    flex: 1,
    color: BRAND.accent,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  saveButton: {
    backgroundColor: BRAND.accent,
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  saveText: {
    color: BRAND.white,
    fontSize: 15,
    fontWeight: "800",
  },
});
