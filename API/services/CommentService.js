import CommentModel from "../models/CommentModel.js";
import UserModel from "../models/UserModel.js";
import PostService from "./PostService.js";
import HttpError from "../utils/HttpError.js";
import { publishPostEvent } from "./PostEvents.js";

function validId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, "Invalid comment id");
    }

    return id;
}

class CommentService {
    static async findById(id, user) {
        const comment = await CommentModel.findById(validId(id));

        if (!comment) {
            throw new HttpError(404, "Comment does not exist");
        }

        await PostService.findById(comment.post_id, user);

        if (!comment.deleted_by && comment.status === "inactive" && user?.role !== "admin" &&
            String(user?.userId) !== String(comment.author_id)) {
            throw new HttpError(404, "Comment does not exist");
        }

        return comment;
    }

    static async findLikes(id, user) {
        const comment = await this.findById(id, user);
        return CommentModel.findLikes(comment.id);
    }

    static async createLike(id, user, type) {
        const comment = await this.findById(id, user);
        if (comment.deleted_by) throw new HttpError(410, "Comment has been deleted");
        const post = await PostService.findById(comment.post_id, user);

        if ((comment.status !== "active" || post.status !== "active") && user.role !== "admin") {
            throw new HttpError(403, "Comment or post is inactive");
        }

        if ((comment.is_locked || post.is_locked) && user.role !== "admin") {
            throw new HttpError(403, "Comment or post is locked");
        }

        if (!["like", "dislike"].includes(type)) {
            throw new HttpError(400, "Type must be like or dislike");
        }

        try {
            const like = await CommentModel.createLike(comment.id, user.userId, type);
            publishPostEvent(comment.post_id);
            await UserModel.refreshRatings(comment.author_id);
            return like;
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpError(409, "You have already liked or disliked this comment");
            }

            throw error;
        }
    }

    static async update(id, user, data = {}) {
        const comment = await CommentModel.findById(validId(id));

        if (!comment || comment.deleted_by) {
            throw new HttpError(404, "Comment does not exist");
        }

        await PostService.findById(comment.post_id, user);

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new HttpError(400, "Invalid comment data");
        }

        const fields = Object.keys(data);

        if (!fields.length || fields.some(field => !["status", "is_locked"].includes(field))) {
            throw new HttpError(400, "Only status and is_locked can be updated; comment content cannot be edited");
        }

        const changes = {};

        if ("status" in data) {
            if (String(user.userId) !== String(comment.author_id) && user.role !== "admin") {
                throw new HttpError(403, "Only the author or an admin can change the comment status");
            }

            if (!["active", "inactive"].includes(data.status)) {
                throw new HttpError(400, "Status must be active or inactive");
            }

            changes.status = data.status;
        }

        if ("is_locked" in data) {
            if (String(user.userId) !== String(comment.author_id) && user.role !== "admin") {
                throw new HttpError(403, "You cannot lock this comment");
            }

            if (typeof data.is_locked !== "boolean") {
                throw new HttpError(400, "is_locked must be true or false");
            }

            changes.is_locked = data.is_locked;
        }

        await CommentModel.update(comment.id, changes);
        publishPostEvent(comment.post_id);
        return CommentModel.findById(comment.id);
    }

    static async delete(id, user) {
        const comment = await this.findById(id, user);

        if (String(user.userId) !== String(comment.author_id) && user.role !== "admin") {
            throw new HttpError(403, "You cannot delete this comment");
        }

        await CommentModel.delete(comment.id, user.role === "admin" ? "admin" : "user");
        publishPostEvent(comment.post_id);
        await UserModel.refreshRatings(comment.author_id);
    }

    static async deleteLike(id, user) {
        const comment = await CommentModel.findById(validId(id));

        if (!comment || comment.deleted_by) {
            throw new HttpError(404, "Comment does not exist");
        }

        const deleted = await CommentModel.deleteLike(comment.id, user.userId);

        if (!deleted) {
            throw new HttpError(404, "Your like does not exist");
        }

        publishPostEvent(comment.post_id);
        await UserModel.refreshRatings(comment.author_id);
    }
}

export default CommentService;
