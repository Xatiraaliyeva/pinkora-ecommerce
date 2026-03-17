import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

import {
  adminListProducts,
  adminDeleteProduct,
  adminListComments,
  adminDeleteComment,
  adminListUsers,
  adminUpdateUserRole,
  adminDeleteUser,
  adminListOrders,
  adminUpdateOrder,
} from "../controllers/adminPanel.controller.js";

const router = Router();

router.get("/panel/products", requireAuth, requireAdmin, adminListProducts);
router.delete("/panel/products/:id", requireAuth, requireAdmin, adminDeleteProduct);

router.get("/panel/comments", requireAuth, requireAdmin, adminListComments);
router.delete("/panel/comments/:id", requireAuth, requireAdmin, adminDeleteComment);

router.get("/panel/users", requireAuth, requireAdmin, adminListUsers);
router.patch("/panel/users/:id/role", requireAuth, requireAdmin, adminUpdateUserRole);
router.delete("/panel/users/:id", requireAuth, requireAdmin, adminDeleteUser);

router.get("/panel/orders", requireAuth, requireAdmin, adminListOrders);
router.patch("/panel/orders/:id", requireAuth, requireAdmin, adminUpdateOrder);

export default router;