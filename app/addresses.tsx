import { useCallback, useRef, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

import { BRAND } from "@/constants/brand";
import {
  getSavedAddresses,
  saveAddresses,
  type SavedAddress,
} from "@/services/addressBook";
import {
  getProfile,
  updateProfile,
  type ProfileUser,
} from "@/services/profileApi";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const value = error.response?.data?.message ?? error.response?.data?.error;
    if (typeof value === "string") return value;
    if (!error.response) return "Не удаётся связаться с сервером";
  }
  return "Не получилось сохранить изменения. Попробуй ещё раз.";
}

function addressIcon(label: string): keyof typeof Ionicons.glyphMap {
  const text = label.toLocaleLowerCase("ru-RU");
  if (text.includes("дом")) return "home-outline";
  if (text.includes("работ")) return "briefcase-outline";
  return "location-outline";
}

export default function AddressesScreen() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        setError("");

        try {
          const profile = await getProfile();
          const saved = await getSavedAddresses(
            profile.id,
            profile.address ?? ""
          );

          if (active) {
            setUser(profile);
            setAddresses(saved);
          }
        } catch (err) {
          if (active) setError(errorMessage(err));
        } finally {
          if (active) setLoading(false);
        }
      }

      void load();
      return () => {
        active = false;
      };
    }, [])
  );

  async function runSafely(task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const addAddress = () => {
    const cleanLabel = label.trim();
    const cleanAddress = value.trim();

    if (cleanLabel.length < 2 || cleanLabel.length > 30) {
      setError("Название адреса — от 2 до 30 символов");
      return;
    }
    if (cleanAddress.length < 5 || cleanAddress.length > 250) {
      setError("Адрес должен содержать от 5 до 250 символов");
      return;
    }
    if (
      addresses.some(
        (item) =>
          item.address.trim().toLocaleLowerCase("ru-RU") ===
          cleanAddress.toLocaleLowerCase("ru-RU")
      )
    ) {
      setError("Такой адрес уже сохранён");
      return;
    }
    if (addresses.length >= 10) {
      setError("Можно сохранить максимум 10 адресов");
      return;
    }

    void runSafely(async () => {
      if (!user) throw new Error("Не удалось определить аккаунт");

      const entry: SavedAddress = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        label: cleanLabel,
        address: cleanAddress,
      };
      const next = [...addresses, entry];
      await saveAddresses(user.id, next);
      setAddresses(next);
      setLabel("");
      setValue("");
      setShowForm(false);
      setNotice("Адрес добавлен");
    });
  };

  const makePrimary = (item: SavedAddress) => {
    void runSafely(async () => {
      if (!user) throw new Error("Не удалось определить аккаунт");
      const updated = await updateProfile({
        name: user.name,
        address: item.address,
      });
      await AsyncStorage.setItem("@user", JSON.stringify(updated));
      setUser(updated);
      setNotice(`«${item.label}» теперь основной адрес`);
    });
  };

  const remove = (item: SavedAddress) => {
    if (item.address.trim() === (user?.address ?? "").trim()) {
      setError("Чтобы удалить этот адрес, сначала выбери другой основной");
      return;
    }

    void runSafely(async () => {
      if (!user) throw new Error("Не удалось определить аккаунт");
      const next = addresses.filter((entry) => entry.id !== item.id);
      await saveAddresses(user.id, next);
      setAddresses(next);
      setNotice("Адрес удалён");
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={BRAND.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Мои адреса</Text>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={BRAND.accent} />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.eyebrow}>ДОСТАВКА MANGAL HOUSE</Text>
            <Text style={styles.title}>Куда привезти?</Text>
            <Text style={styles.description}>
              Сохрани адреса, чтобы каждый раз не вводить их заново. Основной
              адрес автоматически подставится при оформлении заказа.
            </Text>

            {error ? (
              <View style={styles.message}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={BRAND.accent}
                />
                <Text style={styles.messageText}>{error}</Text>
              </View>
            ) : null}
            {notice ? (
              <View style={styles.message}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={BRAND.accent}
                />
                <Text style={styles.messageText}>{notice}</Text>
              </View>
            ) : null}

            {addresses.map((item) => {
              const selected =
                item.address.trim() === (user?.address ?? "").trim();
              return (
                <View
                  key={item.id}
                  style={[styles.addressCard, selected && styles.selectedCard]}
                >
                  <View style={styles.addressTop}>
                    <View style={styles.iconBox}>
                      <Ionicons
                        name={addressIcon(item.label)}
                        size={23}
                        color={BRAND.accent}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.labelRow}>
                        <Text style={styles.cardTitle}>{item.label}</Text>
                        {selected ? (
                          <Text style={styles.primaryBadge}>ОСНОВНОЙ</Text>
                        ) : null}
                      </View>
                      <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {selected ? (
                      <View style={styles.selectedAction}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={BRAND.accent}
                        />
                        <Text style={styles.selectedActionText}>Выбран</Text>
                      </View>
                    ) : (
                      <Pressable
                        disabled={busy}
                        onPress={() => makePrimary(item)}
                        style={styles.chooseButton}
                      >
                        <Text style={styles.chooseText}>Сделать основным</Text>
                      </Pressable>
                    )}
                    <Pressable
                      disabled={busy || selected}
                      onPress={() => remove(item)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={selected ? BRAND.muted : BRAND.black}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {addresses.length === 0 && !error ? (
              <View style={styles.empty}>
                <Ionicons
                  name="location-outline"
                  size={42}
                  color={BRAND.accent}
                />
                <Text style={styles.emptyTitle}>Адресов пока нет</Text>
                <Text style={styles.addressText}>
                  Добавь свой первый адрес доставки
                </Text>
              </View>
            ) : null}

            {!showForm ? (
              <Pressable
                disabled={busy}
                onPress={() => {
                  setError("");
                  setNotice("");
                  setShowForm(true);
                }}
                style={styles.addButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={BRAND.white}
                />
                <Text style={styles.addButtonText}>Добавить адрес</Text>
              </Pressable>
            ) : (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Новый адрес</Text>
                <Text style={styles.fieldLabel}>Название</Text>
                <TextInput
                  value={label}
                  onChangeText={setLabel}
                  placeholder="Дом, Работа, Дача..."
                  maxLength={30}
                  placeholderTextColor={BRAND.muted}
                  style={styles.input}
                />
                <Text style={styles.fieldLabel}>Адрес</Text>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="Город, улица, дом, квартира"
                  multiline
                  maxLength={250}
                  placeholderTextColor={BRAND.muted}
                  style={[styles.input, styles.multiInput]}
                  textAlignVertical="top"
                />
                <Pressable
                  onPress={addAddress}
                  disabled={busy}
                  style={styles.addButton}
                >
                  {busy ? (
                    <ActivityIndicator color={BRAND.white} />
                  ) : (
                    <Ionicons name="checkmark" size={20} color={BRAND.white} />
                  )}
                  <Text style={styles.addButtonText}>Сохранить адрес</Text>
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </Pressable>
              </View>
            )}
            <Text style={styles.footerNote}>
              Дополнительные адреса пока сохраняются только на этом устройстве.
              Основной адрес синхронизируется с аккаунтом.
            </Text>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.white },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: BRAND.black },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 48 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: BRAND.accent,
  },
  title: { fontSize: 31, fontWeight: "900", color: BRAND.black, marginTop: 8 },
  description: {
    color: BRAND.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 11,
    marginBottom: 23,
  },
  message: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 14,
    borderRadius: 14,
    backgroundColor: BRAND.accentSoft,
    marginBottom: 15,
  },
  messageText: { flex: 1, fontSize: 12, lineHeight: 18, color: BRAND.accent },
  addressCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 17,
    marginBottom: 13,
  },
  selectedCard: { borderColor: BRAND.accent },
  addressTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: BRAND.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  cardTitle: { color: BRAND.black, fontWeight: "800", fontSize: 16 },
  primaryBadge: {
    color: BRAND.accent,
    fontWeight: "800",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  addressText: {
    color: BRAND.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  selectedAction: { flexDirection: "row", alignItems: "center", gap: 7 },
  selectedActionText: { color: BRAND.accent, fontWeight: "700", fontSize: 12 },
  chooseButton: {
    borderRadius: 12,
    backgroundColor: BRAND.accent,
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  chooseText: { color: BRAND.white, fontWeight: "800", fontSize: 12 },
  removeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.surface,
    borderRadius: 12,
  },
  empty: {
    backgroundColor: BRAND.surface,
    borderRadius: 23,
    padding: 30,
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    color: BRAND.black,
    fontWeight: "800",
    fontSize: 17,
    marginTop: 10,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: BRAND.accent,
    borderRadius: 17,
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    padding: 13,
  },
  addButtonText: { color: BRAND.white, fontSize: 14, fontWeight: "800" },
  form: {
    borderRadius: 23,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 18,
    marginTop: 10,
  },
  formTitle: { color: BRAND.black, fontWeight: "800", fontSize: 19 },
  fieldLabel: {
    color: BRAND.black,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 17,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BRAND.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: BRAND.black,
    fontSize: 14,
  },
  multiInput: { minHeight: 90 },
  cancelButton: { alignItems: "center", padding: 16 },
  cancelText: { color: BRAND.muted, fontWeight: "700" },
  footerNote: {
    marginTop: 22,
    fontSize: 11,
    lineHeight: 17,
    color: BRAND.muted,
    textAlign: "center",
  },
});
