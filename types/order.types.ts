export type OrderStatus =
  | "new"
  | "cooking"
  | "delivering"
  | "completed"
  | "cancelled";

export type OrderData = {
  customerAddress: string;
  items: {
    id: number;
    quantity: number;
  }[];
};

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
};

export type OrderResponse = {
  id: number;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};
