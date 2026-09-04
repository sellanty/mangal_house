import { Router } from "express";

import {getMenu, getMenuItemById} from "../controllers/menuController";

const router = Router();

router.get("/", getMenu);
router.get("/:id", getMenuItemById);

export default router;
