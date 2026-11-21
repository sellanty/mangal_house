
import axios from "axios";
import api from "./api";

import type {
  OrderData,
  OrderResponse,
} from "@/types/order.types";

import type { ApiResponse } from "@/types/api.types";

type ErrorResponse = {
  error?: string;
  message?: string;
};

export const createOrder = async (
  orderData: OrderData
): Promise<ApiResponse> => {
  try {
    const response = await api.post<OrderResponse>(
      "/orders",
      orderData
    );

    return {
      success: true,
      order: response.data,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError<ErrorResponse>(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          error: "Сессия истекла. Войдите в аккаунт снова.",
        };
      }

      const serverMessage =
        error.response?.data?.error ??
        error.response?.data?.message;

      if (typeof serverMessage === "string") {
        return {
          success: false,
          error: serverMessage,
        };
      }

      if (!error.response) {
        return {
          success: false,
          error: "Нет связи с сервером. Проверь интернет и backend.",
        };
      }
    }

    return {
      success: false,
      error: "Не удалось оформить заказ",
    };
  }
};

export const getMyOrders = async (): Promise<OrderResponse[]> => {
  const response = await api.get<OrderResponse[]>("/orders/my");

  return response.data;
};
