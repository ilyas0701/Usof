import { Router } from "express";
import CommentController from "../controllers/CommentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";

const router = Router();

router.get("/:id", optionalAuthMiddleware, CommentController.findById);
router.get("/:id/like", optionalAuthMiddleware, CommentController.findLikes);
router.post("/:id/like", authMiddleware, CommentController.createLike);
router.patch("/:id", authMiddleware, CommentController.update);
router.delete("/:id", authMiddleware, CommentController.delete);
router.delete("/:id/like", authMiddleware, CommentController.deleteLike);

export default router;
