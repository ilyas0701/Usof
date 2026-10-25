import { Router } from "express";
import PostController from "../controllers/PostController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";
import uploadPostImagesMiddleware from "../middleware/uploadPostImagesMiddleware.js";

const router = Router();

router.get("/", optionalAuthMiddleware, PostController.findAll);
router.get("/search", optionalAuthMiddleware, PostController.search);
router.get("/favorites", authMiddleware, PostController.findFavorites);
router.get("/subscriptions", authMiddleware, PostController.findSubscriptions);
router.get("/:id", optionalAuthMiddleware, PostController.findById);
router.get("/:id/events", optionalAuthMiddleware, PostController.events);
router.get("/:id/comments", optionalAuthMiddleware, PostController.findComments);
router.post("/:id/comments", authMiddleware, PostController.createComment);
router.get("/:id/categories", optionalAuthMiddleware, PostController.findCategories);
router.get("/:id/images", optionalAuthMiddleware, PostController.findImages);
router.get("/:id/images/:imageId/file", optionalAuthMiddleware, PostController.findImageFile);
router.post("/:id/images", authMiddleware, uploadPostImagesMiddleware, PostController.addImages);
router.get("/:id/like", optionalAuthMiddleware, PostController.findLikes);
router.post("/", authMiddleware, PostController.create);
router.post("/:id/like", authMiddleware, PostController.createLike);
router.post("/:id/favorite", authMiddleware, PostController.addFavorite);
router.post("/:id/subscribe", authMiddleware, PostController.addSubscription);
router.patch("/:id", authMiddleware, PostController.update);
router.delete("/:id", authMiddleware, PostController.delete);
router.delete("/:id/like", authMiddleware, PostController.deleteLike);
router.delete("/:id/favorite", authMiddleware, PostController.deleteFavorite);
router.delete("/:id/subscribe", authMiddleware, PostController.deleteSubscription);

export default router;
