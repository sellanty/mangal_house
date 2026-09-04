import api from "./api";
import { MenuItem } from "@/types/menu.types";

export const getMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get("/menu");
  return response.data;
};

export const getMenuItemById = async (id: number): Promise<MenuItem> => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};
