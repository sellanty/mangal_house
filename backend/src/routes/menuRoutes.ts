import { Router } from "express";

import {getMenu, getMenuItemById} from "../controllers/menuController.js";

const router = Router();

router.get("/", getMenu);
router.get("/:id", getMenuItemById);

export default router;
