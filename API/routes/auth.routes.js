import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import InvitationController from "../controllers/InvitationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/accept-invitation", InvitationController.accept);
router.get("/verify-email/:token", AuthController.verify);
router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.post("/password-reset", AuthController.requestPasswordReset);
router.post("/password-reset/:confirm_token", AuthController.resetPassword);

export default router;
