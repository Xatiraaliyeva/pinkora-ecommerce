import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { listComments, addComment, deleteComment, toggleLikeComment } from "../controllers/comment.controller.js";

const router = Router();

router.get("/:productId", listComments);
router.post("/:productId", requireAuth, addComment);

router.delete("/by-id/:id", requireAuth, deleteComment);
router.post("/by-id/:id/like", requireAuth, toggleLikeComment);

export default router;