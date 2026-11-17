import { Request, Response } from "express";
import Order from "../models/order.js";
import { Op } from "sequelize";
import MenuItem from "../models/menuItem.js";
import { 
  IncomingOrderItem, 
  OrderItemSnapshot, 
  CreateOrderRequest 
} from '../types/order.types.js';


export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, customerAddress, items } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        error: "Имя, телефон и адрес обязательны",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Заказ должен содержать хотя бы одно блюдо",
      });
    }

    const normalizedItems: IncomingOrderItem[] = [];

    for (const item of items) {
      const id = Number(item.id);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          error: "Некорректный id блюда",
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          error: "Некорректное количество блюда",
        });
      }

      const existingItem = normalizedItems.find(
        (orderItem) => orderItem.id === id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        normalizedItems.push({ id, quantity });
      }
    }

    const menuItemIds = normalizedItems.map((item) => item.id);

    const menuItems = await MenuItem.findAll({
      where: {
        id: {
          [Op.in]: menuItemIds,
        },
        available: true,
      },
    });

    if (menuItems.length !== normalizedItems.length) {
      return res.status(400).json({
        error: "Некоторые блюда не найдены или недоступны",
      });
    }

    const menuItemsById = new Map(
      menuItems.map((menuItem) => [menuItem.id, menuItem])
    );

    const orderItems: OrderItemSnapshot[] = normalizedItems.map((item) => {
      const menuItem = menuItemsById.get(item.id);

      if (!menuItem) {
        throw new Error("Блюдо не найдено");
      }

      return {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        emoji: menuItem.emoji,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const order = await Order.create({
      customerName,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      status: "new",
    });

    res.status(201).json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";

    res.status(500).json({ error: message });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении заказов" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID не указан" });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении заказа" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID не указан" });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении статуса" });
  }
};
