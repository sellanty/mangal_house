import { Request, Response } from "express";
import MenuItem from "../models/menuItem";

export const getMenu = async (_req: Request, res: Response) => {
  try {
    const menu = await MenuItem.findAll({
      where: { available: true },
      order: [["category", "ASC"]],
    });
    res.json(menu);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка при получении меню" });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const id =
      typeof req.params.id === "string"
        ? parseInt(req.params.id)
        : parseInt(req.params.id[0]);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Неверный ID" });
    }
    const item = await MenuItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Блюдо не найдено" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении блюда" });
  }
};
