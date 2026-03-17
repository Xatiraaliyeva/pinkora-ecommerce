import { Router } from "express";
import { listProducts, getProduct, toggleFavorite, myFavorites } from "../controllers/product.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);


router.post("/:id/favorite", requireAuth, toggleFavorite);
router.get("/me/favorites/list", requireAuth, myFavorites);

export default router;