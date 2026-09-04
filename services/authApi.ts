import api, { API_ORIGIN } from "./api";
import { AuthResponse } from "../types/auth.types";

export const login = async (
  phone: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", {
      phone,
      password,
    });

    return response.data;
  } catch (error: any) {
    console.error("Login API error:", {
      message: error.message,
      code: error.code,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });

    return {
      success: false,
      message: error.response?.data?.message || "Ошибка входа",
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
    console.log("API_ORIGIN:", API_ORIGIN);

    console.log("HEALTH CHECK START");

    const healthResponse = await api.get("/health");

    console.log("HEALTH CHECK RESPONSE:", healthResponse.data);

    console.log("REGISTER START");

    const response = await api.post("/auth/register", {
      phone,
      name,
      address,
      password,
    });

    console.log("REGISTER RESPONSE:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Register API error:", {
      message: error.message,
      code: error.code,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });

    return {
      success: false,
      message: error.response?.data?.message || "Ошибка регистрации",
    };
  }
};