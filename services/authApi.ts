
import axios from "axios";
import api from "./api";
import type { AuthResponse } from "../types/auth.types";

type ApiError = {
  message?: string;
  error?: string;
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }

    if (!error.response) {
      return "Не удалось подключиться к серверу. Проверь backend и адрес API.";
    }
  }

  return fallback;
}

export const login = async (
  phone: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>(
      "/auth/login",
      {
        phone: phone.trim(),
        password,
      }
    );

    return data;
  } catch (error: unknown) {
    console.error(
      "Login API error:",
      getErrorMessage(error, "Ошибка входа")
    );

    return {
      success: false,
      message: getErrorMessage(error, "Ошибка входа"),
    };
  }
};

export const register = async (
  phone: string,
  name: string,
  address: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>(
      "/auth/register",
      {
        phone: phone.trim(),
        name: name.trim(),
        address: address.trim(),
        password,
      }
    );

    return data;
  } catch (error: unknown) {
    console.error(
      "Register API error:",
      getErrorMessage(error, "Ошибка регистрации")
    );

    return {
      success: false,
      message: getErrorMessage(error, "Ошибка регистрации"),
    };
  }
};