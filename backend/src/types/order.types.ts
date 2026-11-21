import { Optional } from "sequelize";

export type OrderStatus =
  | "new"
  | "cooking"
  | "delivering"
  | "completed"
  | "cancelled";

export interface OrderAttributes {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any;
  totalAmount: number;
  status: OrderStatus;
  userId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<OrderAttributes, "id" | "createdAt" | "updatedAt"> {}


// То, что присылает клиент в items
export type IncomingOrderItem = {
  id: number;
  quantity: number;
};

// То, что сохраняется в БД как снимок блюда
export type OrderItemSnapshot = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
};

// Тело запроса от клиента при создании заказа
export type CreateOrderRequest = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: IncomingOrderItem[];
};

// Ответ сервера после создания заказа
export type CreateOrderResponse = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemSnapshot[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};