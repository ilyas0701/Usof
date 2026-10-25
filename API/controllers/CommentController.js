import CommentService from "../services/CommentService.js";
import { sendErrorResponse } from "../utils/HttpError.js";

class CommentController {
    static async findById(req, res) {
        try {
            const comment = await CommentService.findById(req.params.id, req.user);
            return res.status(200).json(comment);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findLikes(req, res) {
        try {
            const likes = await CommentService.findLikes(req.params.id, req.user);
            return res.status(200).json(likes);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async createLike(req, res) {
        try {
            const like = await CommentService.createLike(req.params.id, req.user, req.body?.type);
            return res.status(201).json(like);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async update(req, res) {
        try {
            const comment = await CommentService.update(req.params.id, req.user, req.body);
            return res.status(200).json(comment);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async delete(req, res) {
        try {
            await CommentService.delete(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteLike(req, res) {
        try {
            await CommentService.deleteLike(req.params.id, req.user);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default CommentController;
