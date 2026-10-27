import PostService from "../services/PostService.js";
import { sendErrorResponse } from "../utils/HttpError.js";
import { subscribeToPost } from "../services/PostEvents.js";

class PostController {
    static async events(req, res) {
        try {
            const post = await PostService.findById(req.params.id, req.user);
            res.set({
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            });
            res.flushHeaders();
            const unsubscribe = subscribeToPost(post.id, res);
            const heartbeat = setInterval(() => {
                if (!res.write(": keep-alive\n\n")) res.end();
            }, 15000);
            const expiry = req.user?.exp ? setTimeout(() => res.end(), Math.min(Math.max(req.user.exp * 1000 - Date.now(), 0), 2147483647)) : null;
            res.on("close", () => {
                clearInterval(heartbeat);
                clearTimeout(expiry);
                unsubscribe();
            });
            res.write("event: ready\ndata: {}\n\n");
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findSubscriptions(req, res) {
        try {
            const posts = await PostService.findSubscriptions(req.query, req.user);
            return res.status(200).json(posts);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async addSubscription(req, res) {
        try {
            const post = await PostService.addSubscription(req.params.id, req.user);
            return res.status(201).json(post);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteSubscription(req, res) {
        try {
            await PostService.deleteSubscription(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findFavorites(req, res) {
        try {
            const posts = await PostService.findFavorites(req.query, req.user);
            return res.status(200).json(posts);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async addFavorite(req, res) {
        try {
            const post = await PostService.addFavorite(req.params.id, req.user);
            return res.status(201).json(post);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteFavorite(req, res) {
        try {
            await PostService.deleteFavorite(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findAll(req, res) {
        try {
            const posts = await PostService.findAll(req.query, req.user);
            return res.status(200).json(posts);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async search(req, res) {
        try {
            const posts = await PostService.search(req.query, req.user);
            return res.status(200).json(posts);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findById(req, res) {
        try {
            const post = await PostService.findById(req.params.id, req.user);
            return res.status(200).json(post);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findCategories(req, res) {
        try {
            const categories = await PostService.findCategories(req.params.id, req.user);
            return res.status(200).json(categories);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findImages(req, res) {
        try {
            const images = await PostService.findImages(req.params.id, req.user);
            return res.status(200).json(images);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findImageFile(req, res) {
        try {
            const filePath = await PostService.findImage(req.params.id, req.params.imageId, req.user);
            return res.sendFile(filePath, error => {
                if (error && !res.headersSent) {
                    return res.status(error.statusCode ?? 404).json({message: "Image does not exist"});
                }
            });
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteImage(req, res) {
        try {
            await PostService.deleteImage(req.params.id, req.params.imageId, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async addImages(req, res) {
        try {
            const images = await PostService.addImages(req.params.id, req.user, req.files);
            return res.status(201).json(images);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async create(req, res) {
        try {
            const post = await PostService.create(req.user.userId, req.body);
            return res.status(201).json(post);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async update(req, res) {
        try {
            const post = await PostService.update(req.params.id, req.user, req.body);
            return res.status(200).json(post);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async delete(req, res) {
        try {
            await PostService.delete(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findComments(req, res) {
        try {
            const comments = await PostService.findComments(req.params.id, req.user);
            return res.status(200).json(comments);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async createComment(req, res) {
        try {
            const comment = await PostService.createComment(req.params.id, req.user, req.body?.content, req.body?.parent_id);
            return res.status(201).json(comment);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findLikes(req, res) {
        try {
            const likes = await PostService.findLikes(req.params.id, req.user);
            return res.status(200).json(likes);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async createLike(req, res) {
        try {
            const like = await PostService.createLike(req.params.id, req.user, req.body?.type);
            return res.status(201).json(like);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteLike(req, res) {
        try {
            await PostService.deleteLike(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default PostController;
