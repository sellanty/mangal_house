
import { Router } from "express";

import {
  login,
  register,
  getMe,
  updateMe,
} from "../controllers/authController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);

export default router;
