import api from './api';
import { OrderData, OrderResponse } from '@/types/order.types';
import { ApiResponse } from '@/types/api.types';

export const createOrder = async (
  orderData: OrderData
): Promise<ApiResponse> => {
  try {
    const response = await api.post<OrderResponse>("/orders", orderData);

    return { success: true, order: response.data };
  } catch (error) {
    console.log("API error", error);
    return { success: false, error: "Не удалось создать заказ" };
  }
};

export const getOrders = async (): Promise<OrderResponse[]> => {
  const response = await api.get<OrderResponse[]>("/orders");
  return response.data;
};

export const getOrderById = async (id: number): Promise<OrderResponse> => {
  const response = await api.get<OrderResponse>(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (
  id: number,
  status: "new" | "cooking" | "delivering" | "completed" | "cancelled"
): Promise<OrderResponse> => {
  const response = await api.put<OrderResponse>(`/orders/${id}/status`, {
    status,
  });
  return response.data;
};
