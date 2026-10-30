import { Router } from "express";
import CategoryController from "../controllers/CategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";

const router = Router();

router.get("/", CategoryController.findAll);
router.get("/:id", CategoryController.findById);
router.get("/:id/posts", optionalAuthMiddleware, CategoryController.findPosts);
router.post("/", authMiddleware, adminMiddleware, CategoryController.create);
router.patch("/:id", authMiddleware, adminMiddleware, CategoryController.update);
router.delete("/:id", authMiddleware, adminMiddleware, CategoryController.delete);

export default router;
