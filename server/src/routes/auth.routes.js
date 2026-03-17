import { Router } from "express";
import {
  register, login, requestOtp, verifyOtp, refresh, logout, forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select("_id username email role cart favorites");
    if (!u) return res.status(404).json({ message: "User not found" });

    const productIds = [
      ...u.favorites.map((id) => id.toString()),
      ...u.cart.map((item) => item.product?.toString()).filter(Boolean),
    ];

    const existingProducts = await Product.find({ _id: { $in: productIds } }).select("_id");
    const existingProductIdSet = new Set(existingProducts.map((p) => p._id.toString()));

    const validFavoritesCount = u.favorites.filter((id) =>
      existingProductIdSet.has(id.toString())
    ).length;

    const validCartCount = u.cart.reduce((sum, item) => {
      const productId = item.product?.toString();
      if (!productId || !existingProductIdSet.has(productId)) return sum;
      return sum + item.qty;
    }, 0);

    res.json({
      id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      cartCount: validCartCount,
      favoritesCount: validFavoritesCount,
    });
  } catch (e) {
    next(e);
  }
});

export default router;