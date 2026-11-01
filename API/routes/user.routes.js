import { Router } from "express";
import UserController from "../controllers/UserController.js";
import InvitationController from "../controllers/InvitationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import uploadAvatarMiddleware from "../middleware/uploadAvatarMiddleware.js";

const router = Router();

router.get("/", authMiddleware, UserController.findAll);
router.get("/:id", authMiddleware, UserController.findById);
router.post("/", authMiddleware, adminMiddleware, UserController.createUser);
router.post("/invitations", authMiddleware, adminMiddleware, InvitationController.invite);
router.patch("/avatar", authMiddleware, uploadAvatarMiddleware, UserController.uploadAvatar);
router.patch("/:id", authMiddleware, UserController.update);
router.patch("/:id/role", authMiddleware, adminMiddleware, UserController.updateRole);
router.delete("/:id", authMiddleware, adminMiddleware, UserController.delete);

export default router;
