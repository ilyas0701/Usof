import { Router } from "express";
import AdminController from "../controllers/AdminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/comments", AdminController.findComments);
router.get("/likes", AdminController.findLikes);
router.delete("/likes/:id", AdminController.deleteLike);

export default router;
