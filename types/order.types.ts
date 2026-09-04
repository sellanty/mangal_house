import { CartItem } from "./cart.types";

export interface OrderData {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: CartItem[];
    totalAmount: number;
}

export interface OrderResponse {
    id: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: CartItem[];
    totalAmount: number;
    status: 'new' | 'cooking' | 'delivering' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}