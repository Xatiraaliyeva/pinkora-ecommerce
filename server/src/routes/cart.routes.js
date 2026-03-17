import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getCart, addToCart, setQty, removeFromCart } from "../controllers/cart.controller.js";

const router = Router();

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addToCart);
router.post("/qty", requireAuth, setQty);
router.delete("/remove/:productId", requireAuth, removeFromCart);

export default router;