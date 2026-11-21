import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from "react";
  
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import type { MenuItem } from "@/types/menu.types";
  
  export type CartProduct = Pick<
    MenuItem,
    "id" | "name" | "price" | "emoji" | "image"
  >;
  
  export type CartEntry = CartProduct & {
    quantity: number;
  };
  
  type CartContextValue = {
    items: CartEntry[];
    ready: boolean;
    totalItems: number;
    totalPrice: number;
    addItem: (item: CartProduct, quantity?: number) => void;
    removeItem: (id: number) => void;
    setQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
  };
  
  const STORAGE_KEY = "@mangal_cart_v2";
  const MAX_QUANTITY = 30;
  
  const CartContext = createContext<CartContextValue | null>(null);
  
  export function CartProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [items, setItems] = useState<CartEntry[]>([]);
    const [ready, setReady] = useState(false);
  
    useEffect(() => {
      let mounted = true;
  
      async function loadCart() {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
  
          if (saved && mounted) {
            const parsed: unknown = JSON.parse(saved);
  
            if (Array.isArray(parsed)) {
              const validItems = parsed.filter(
                (item) =>
                  item &&
                  Number.isSafeInteger(item.id) &&
                  typeof item.name === "string" &&
                  Number.isFinite(item.price) &&
                  item.price >= 0 &&
                  Number.isInteger(item.quantity) &&
                  item.quantity > 0
              );
  
              setItems(
                validItems.map((item) => ({
                  ...item,
                  quantity: Math.min(item.quantity, MAX_QUANTITY),
                }))
              );
            }
          }
        } catch (error) {
          console.error("Ошибка загрузки корзины:", error);
        } finally {
          if (mounted) setReady(true);
        }
      }
  
      loadCart();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    useEffect(() => {
      if (!ready) return;
  
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(
        (error) => console.error("Ошибка сохранения корзины:", error)
      );
    }, [items, ready]);
  
    const addItem = (product: CartProduct, quantity = 1) => {
      if (!ready || !Number.isInteger(quantity) || quantity <= 0) return;
  
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
  
        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + quantity,
                    MAX_QUANTITY
                  ),
                }
              : item
          );
        }
  
        return [
          ...current,
          {
            ...product,
            quantity: Math.min(quantity, MAX_QUANTITY),
          },
        ];
      });
    };
  
    const removeItem = (id: number) => {
      setItems((current) => current.filter((item) => item.id !== id));
    };
  
    const setQuantity = (id: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
  
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.min(Math.floor(quantity), MAX_QUANTITY),
              }
            : item
        )
      );
    };
  
    const clearCart = () => setItems([]);
  
    const totalItems = useMemo(
      () => items.reduce((sum, item) => sum + item.quantity, 0),
      [items]
    );
  
    const totalPrice = useMemo(
      () =>
        items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      [items]
    );
  
    return (
      <CartContext.Provider
        value={{
          items,
          ready,
          totalItems,
          totalPrice,
          addItem,
          removeItem,
          setQuantity,
          clearCart,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  }
  
  export function useCart() {
    const context = useContext(CartContext);
  
    if (!context) {
      throw new Error("useCart должен использоваться внутри CartProvider");
    }
  
    return context;
  }