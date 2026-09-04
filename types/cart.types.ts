export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
}

export interface CartContextType {
    cartItem: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    submitOrder: (customerName: string, customerPhone: string, customerAddress: string) => Promise<any>;
}