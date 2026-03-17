import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { productUpload } from "../middlewares/upload.middleware.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import User from "../models/User.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.post("/make-me-admin", requireAuth, async (req, res, next) => {
  try {
    const allowed =
      (process.env.FIRST_ADMIN_EMAIL || "xatiree81@gmail.com").toLowerCase().trim();

    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    if ((u.email || "").toLowerCase().trim() !== allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (u.role !== "admin") {
      u.role = "admin";
      await u.save();
    }

    res.json({ ok: true, role: "admin" });
  } catch (e) {
    next(e);
  }
});

router.post("/products", requireAuth, requireAdmin, productUpload, createProduct);
router.put("/products/:id", requireAuth, requireAdmin, productUpload, updateProduct);
router.delete("/products/:id", requireAuth, requireAdmin, deleteProduct);

export default router;