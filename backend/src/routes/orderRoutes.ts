import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdminApiKey } from "../middlewares/adminApiKey.js";

const router = Router();

router.post("/", createOrder);


router.get("/", requireAdminApiKey, getAllOrders);
router.get("/:id", requireAdminApiKey, getOrderById);
router.put("/:id/status", requireAdminApiKey, updateOrderStatus);

export default router;
