import CommentModel from "../models/CommentModel.js";
import LikeService from "../services/LikeService.js";
import { sendErrorResponse } from "../utils/HttpError.js";

class AdminController {
    static async findComments(req, res) {
        try {
            const comments = await CommentModel.findAll();
            return res.status(200).json(comments);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findLikes(req, res) {
        try {
            const likes = await LikeService.findAll();
            return res.status(200).json(likes);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async deleteLike(req, res) {
        try {
            await LikeService.delete(req.params.id);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default AdminController;
