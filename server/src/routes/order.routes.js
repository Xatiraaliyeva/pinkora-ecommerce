import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createOrder, myOrders } from "../controllers/order.controller.js";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/me", requireAuth, myOrders);

export default router;