import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdminApiKey } from "../middlewares/adminApiKey.js";

const router = Router();

// Маршруты пользователя
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getMyOrders);

// Административные маршруты
router.get("/", requireAdminApiKey, getAllOrders);
router.get("/:id", requireAdminApiKey, getOrderById);
router.put("/:id/status", requireAdminApiKey, updateOrderStatus);

export default router;
