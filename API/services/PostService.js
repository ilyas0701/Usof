import PostModel from "../models/PostModel.js";
import CommentModel from "../models/CommentModel.js";
import UserModel from "../models/UserModel.js";
import EmailService from "./EmailService.js";
import HttpError from "../utils/HttpError.js";
import { publishPostEvent } from "./PostEvents.js";
import imageExtension from "../utils/imageExtension.js";
import {randomUUID} from "node:crypto";
import {mkdir, unlink, writeFile} from "node:fs/promises";
import path from "node:path";

const postImageDirectory = path.resolve("uploads/posts");

function validId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, "Invalid id");
    }

    return id;
}

function validText(value, name, maxLength) {
    if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
        throw new HttpError(400, `Invalid ${name}`);
    }

    return value.trim();
}

function validCategories(value) {
    if (!Array.isArray(value) || !value.length) {
        throw new HttpError(400, "Categories are required");
    }

    const categories = value.map(validId);

    if (new Set(categories).size !== categories.length) {
        throw new HttpError(400, "Categories must be unique");
    }

    return categories;
}

function validDate(value, name) {
    if (value === undefined) return null;

    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new HttpError(400, `Invalid ${name}`);
    }

    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new HttpError(400, `Invalid ${name}`);
    }

    return value;
}

class PostService {
    static async search(query = {}, user) {
        if (query.q === undefined) {
            throw new HttpError(400, "Search query is required");
        }

        return this.findAll(query, user);
    }

    static async notifySubscribers(emails, post, type) {
        const results = await Promise.allSettled(
            emails.map(email => EmailService.sendPostNotification(email, post, type))
        );

        for (const result of results) {
            if (result.status === "rejected") {
                console.error("Failed to send post notification:", result.reason);
            }
        }
    }

    static async findSubscriptions(query = {}, user) {
        const page = query.page === undefined ? 1 : validId(query.page);
        const pageSize = query.pageSize === undefined ? 10 : validId(query.pageSize);

        if (pageSize > 100) {
            throw new HttpError(400, "Page size cannot exceed 100");
        }

        return PostModel.findSubscriptions({userId: user.userId, role: user.role, page, pageSize});
    }

    static async addSubscription(id, user) {
        const post = await this.findById(id, user);

        try {
            await PostModel.addSubscription(post.id, user.userId);
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpError(409, "You already follow this post");
            }

            throw error;
        }

        return post;
    }

    static async deleteSubscription(id, user) {
        const deleted = await PostModel.deleteSubscription(validId(id), user.userId);

        if (!deleted) {
            throw new HttpError(404, "You do not follow this post");
        }
    }

    static async findFavorites(query = {}, user) {
        const page = query.page === undefined ? 1 : validId(query.page);
        const pageSize = query.pageSize === undefined ? 10 : validId(query.pageSize);

        if (pageSize > 100) {
            throw new HttpError(400, "Page size cannot exceed 100");
        }

        return PostModel.findFavorites({userId: user.userId, role: user.role, page, pageSize});
    }

    static async addFavorite(id, user) {
        const post = await this.findById(id, user);

        try {
            await PostModel.addFavorite(post.id, user.userId);
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpError(409, "Post is already in favorites");
            }

            throw error;
        }

        return post;
    }

    static async deleteFavorite(id, user) {
        const deleted = await PostModel.deleteFavorite(validId(id), user.userId);

        if (!deleted) {
            throw new HttpError(404, "Post is not in favorites");
        }
    }

    static async findAll(query = {}, user) {
        const page = query.page === undefined ? 1 : validId(query.page);
        const pageSize = query.pageSize === undefined ? 10 : validId(query.pageSize);

        if (pageSize > 100) {
            throw new HttpError(400, "Page size cannot exceed 100");
        }

        let search = null;

        if (query.q !== undefined) {
            if (typeof query.q !== "string" || !query.q.trim() || query.q.trim().length > 100) {
                throw new HttpError(400, "Search query must have 1 to 100 characters");
            }

            search = query.q.trim();
        }

        const sort = query.sort ?? (search ? "relevance" : "likes");

        if (!["likes", "dislikes", "date", "relevance"].includes(sort) || (sort === "relevance" && !search)) {
            throw new HttpError(400, "Sort must be likes, dislikes, date or relevance with a search query");
        }

        const status = query.status;

        if (status !== undefined && !["active", "inactive"].includes(status)) {
            throw new HttpError(400, "Status must be active or inactive");
        }

        if (status === "inactive" && !user) {
            throw new HttpError(401, "Authorization required");
        }

        const categoryId = query.category === undefined ? null : validId(query.category);
        let categoryIds = [];
        if (query.categories !== undefined) {
            if (typeof query.categories !== "string" || !query.categories.trim() || query.categories.split(',').length > 100) {
                throw new HttpError(400, "Categories must contain up to 100 category IDs");
            }
            categoryIds = [...new Set(query.categories.split(',').map(value => validId(value.trim())))];
        }
        const authorId = query.author === undefined ? null : validId(query.author);
        const dateFrom = validDate(query.dateFrom, "dateFrom");
        const dateTo = validDate(query.dateTo, "dateTo");

        if (dateFrom && dateTo && dateFrom > dateTo) {
            throw new HttpError(400, "dateFrom must not be after dateTo");
        }

        return PostModel.findAll({
            page,
            pageSize,
            sort,
            categoryId,
            categoryIds,
            authorId,
            dateFrom: dateFrom ? `${dateFrom} 00:00:00` : null,
            dateTo: dateTo ? `${dateTo} 23:59:59` : null,
            status,
            search,
            user
        });
    }

    static async findById(id, user) {
        const post = await PostModel.findById(validId(id));

        if (!post || (post.status === "inactive" &&
            user?.role !== "admin" && String(user?.userId) !== String(post.author_id))) {
            throw new HttpError(404, "Post does not exist");
        }

        return post;
    }

    static async findCategories(id, user) {
        await this.findById(id, user);
        return PostModel.findCategories(id);
    }

    static async findImages(id, user) {
        const post = await this.findById(id, user);
        const images = await PostModel.findImages(post.id);

        return images.map(image => ({
            ...image,
            url: `/api/posts/${post.id}/images/${image.id}/file`
        }));
    }

    static async findImage(id, imageId, user) {
        const post = await this.findById(id, user);
        const image = await PostModel.findImage(post.id, validId(imageId));

        if (!image) {
            throw new HttpError(404, "Image does not exist");
        }

        return path.join(postImageDirectory, path.basename(image.image_path));
    }

    static async deleteImage(id, imageId, user) {
        const post = await this.findById(id, user);
        if (String(post.author_id) !== String(user.userId)) {
            throw new HttpError(403, "You cannot delete images from this post");
        }
        const image = await PostModel.findImage(post.id, validId(imageId));
        if (!image || !await PostModel.deleteImage(post.id, image.id)) {
            throw new HttpError(404, "Image does not exist");
        }
        const filename = path.basename(image.image_path);
        if (filename.startsWith("post-")) {
            await unlink(path.join(postImageDirectory, filename)).catch(() => {});
        }
        publishPostEvent(post.id);
    }

    static async addImages(id, user, files) {
        const post = await this.findById(id, user);

        if (String(post.author_id) !== String(user.userId)) {
            throw new HttpError(403, "You cannot add images to this post");
        }

        if (!Array.isArray(files) || !files.length) {
            throw new HttpError(400, "Images are required");
        }

        const emails = await PostModel.findSubscriberEmails(post.id);

        const images = files.map(file => {
            const extension = imageExtension(file.buffer);

            if (!extension) {
                throw new HttpError(400, "Images must be JPEG, PNG, WebP or GIF");
            }

            const filename = `post-${randomUUID()}.${extension}`;

            return {
                buffer: file.buffer,
                filePath: path.join(postImageDirectory, filename),
                imagePath: `/uploads/posts/${filename}`
            };
        });

        const written = [];

        try {
            await mkdir(postImageDirectory, {recursive: true});

            for (const image of images) {
                await writeFile(image.filePath, image.buffer);
                written.push(image.filePath);
            }

            await PostModel.addImages(post.id, images.map(image => image.imagePath));
        } catch (error) {
            await Promise.all(written.map(filePath => unlink(filePath).catch(() => {})));
            throw error;
        }

        const savedImages = await this.findImages(post.id, user);
        await this.notifySubscribers(emails, post, "post_updated");
        return savedImages;
    }

    static async create(userId, data = {}) {
        const title = validText(data?.title, "title", 255);
        const content = validText(data?.content, "content", 65535);
        const categories = validCategories(data?.categories);
        const status = data?.status ?? 'active';
        if (!["active", "inactive"].includes(status)) {
            throw new HttpError(400, "Status must be active or inactive");
        }

        if (await PostModel.countCategories(categories) !== categories.length) {
            throw new HttpError(400, "Category does not exist");
        }

        const id = await PostModel.create(userId, title, content, categories, status);
        return PostModel.findById(id);
    }

    static async update(id, user, data = {}) {
        const post = await this.findById(id, user);
        const isOwner = String(user.userId) === String(post.author_id);
        const isAdmin = user.role === "admin";

        if (!isOwner && !isAdmin) {
            throw new HttpError(403, "You cannot update this post");
        }

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new HttpError(400, "Invalid post data");
        }

        const fields = Object.keys(data);

        if (!fields.length || fields.some(field => !["title", "content", "categories", "status", "is_locked"].includes(field))) {
            throw new HttpError(400, "Invalid post fields");
        }

        if (("title" in data || "content" in data) && !isOwner) {
            throw new HttpError(403, "Only the author can edit the post content");
        }

        const changes = {};

        if ("title" in data) changes.title = validText(data.title, "title", 255);
        if ("content" in data) changes.content = validText(data.content, "content", 65535);

        if ("status" in data) {
            if (!["active", "inactive"].includes(data.status)) {
                throw new HttpError(400, "Status must be active or inactive");
            }

            changes.status = data.status;
        }

        if ("is_locked" in data) {
            if (typeof data.is_locked !== "boolean") {
                throw new HttpError(400, "is_locked must be true or false");
            }

            changes.is_locked = data.is_locked;
        }

        let categories = "categories" in data ? validCategories(data.categories) : null;

        if (categories && await PostModel.countCategories(categories) !== categories.length) {
            throw new HttpError(400, "Category does not exist");
        }

        if (categories) {
            const currentCategories = (await PostModel.findCategories(post.id)).map(category => category.id);
            const sameCategories = categories.length === currentCategories.length &&
                categories.every(category => currentCategories.includes(category));

            if (sameCategories) categories = null;
        }

        const hasChanges = Object.entries(changes).some(([field, value]) =>
            field === "is_locked" ? Boolean(post.is_locked) !== value : post[field] !== value
        );

        if (!hasChanges && !categories) return post;

        const emails = await PostModel.findSubscriberEmails(post.id);
        await PostModel.update(post.id, changes, categories);
        const updatedPost = await PostModel.findById(post.id);
        publishPostEvent(post.id);
        await this.notifySubscribers(emails, updatedPost, "post_updated");
        return updatedPost;
    }

    static async delete(id, user) {
        const post = await this.findById(id, user);

        if (String(user.userId) !== String(post.author_id) && user.role !== "admin") {
            throw new HttpError(403, "You cannot delete this post");
        }

        const images = await PostModel.findImages(post.id);
        const emails = await PostModel.findSubscriberEmails(post.id);
        await PostModel.delete(post.id);
        publishPostEvent(post.id);
        await this.notifySubscribers(emails, post, "post_deleted");
        await UserModel.refreshRatings();

        for (const image of images) {
            const filename = path.basename(image.image_path);

            if (filename.startsWith("post-")) {
                await unlink(path.join(postImageDirectory, filename)).catch(() => {});
            }
        }
    }

    static async findComments(id, user) {
        const post = await this.findById(id, user);
        return PostModel.findComments(post.id, user?.role === "admin");
    }

    static async createComment(id, user, content, parentId = null) {
        const post = await this.findById(id, user);

        if (post.status !== "active" && user.role !== "admin") {
            throw new HttpError(403, "Post is inactive");
        }

        if (post.is_locked && user.role !== "admin") {
            throw new HttpError(403, "Post is locked");
        }

        const text = validText(content, "content", 65535);
        if (parentId !== null) {
            const parent = await CommentModel.findById(validId(parentId));
            if (!parent || (parent.status !== "active" && user.role !== "admin")) {
                throw new HttpError(404, "Parent comment does not exist");
            }
            if (String(parent.post_id) !== String(post.id)) {
                throw new HttpError(400, "Parent comment belongs to another post");
            }
            if (parent.is_locked && user.role !== "admin") {
                throw new HttpError(403, "Parent comment is locked");
            }
            parentId = parent.id;
        }
        const emails = await PostModel.findSubscriberEmails(post.id);
        const comment = await PostModel.createComment(post.id, user.userId, text, parentId);
        publishPostEvent(post.id);
        await this.notifySubscribers(emails, post, "new_comment");
        return comment;
    }

    static async findLikes(id, user) {
        const post = await this.findById(id, user);
        return PostModel.findLikes(post.id);
    }

    static async createLike(id, user, type) {
        const post = await this.findById(id, user);

        if (post.status !== "active" && user.role !== "admin") {
            throw new HttpError(403, "Post is inactive");
        }

        if (post.is_locked && user.role !== "admin") {
            throw new HttpError(403, "Post is locked");
        }

        if (!["like", "dislike"].includes(type)) {
            throw new HttpError(400, "Type must be like or dislike");
        }

        try {
            const like = await PostModel.createLike(post.id, user.userId, type);
            if (post.author_id) await UserModel.refreshRatings(post.author_id);
            return like;
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpError(409, "You have already liked or disliked this post");
            }

            throw error;
        }
    }

    static async deleteLike(id, user) {
        const post = await this.findById(id, user);
        const deleted = await PostModel.deleteLike(post.id, user.userId);

        if (!deleted) {
            throw new HttpError(404, "Your like does not exist");
        }

        if (post.author_id) await UserModel.refreshRatings(post.author_id);
    }
}

export default PostService;
