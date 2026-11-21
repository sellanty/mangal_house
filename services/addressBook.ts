import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

const storageKey = (userId: number) => `@mangal_addresses_${userId}`;

const normalized = (value: string) => value.trim().toLocaleLowerCase("ru-RU");

export async function getSavedAddresses(
  userId: number,
  primaryAddress: string
): Promise<SavedAddress[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  let addresses: SavedAddress[] = [];

  if (raw) {
    try {
      const decoded: unknown = JSON.parse(raw);

      if (Array.isArray(decoded)) {
        addresses = decoded.filter(
          (entry): entry is SavedAddress =>
            entry !== null &&
            typeof entry === "object" &&
            typeof entry.id === "string" &&
            typeof entry.label === "string" &&
            typeof entry.address === "string" &&
            entry.address.trim().length > 0
        );
      }
    } catch {
      addresses = [];
    }
  }

  const primary = primaryAddress.trim();

  if (primary && !addresses.some((item) => normalized(item.address) === normalized(primary))) {
    addresses = [
      { id: `primary-${userId}-${Date.now()}`, label: "Основной", address: primary },
      ...addresses,
    ];
  }

  const unique = new Set<string>();

  return addresses.filter((item) => {
    const key = normalized(item.address);
    if (unique.has(key)) return false;
    unique.add(key);
    return true;
  });
}

export async function saveAddresses(
  userId: number,
  addresses: SavedAddress[]
): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(addresses));
}
