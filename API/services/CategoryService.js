import CategoryModel from "../models/CategoryModel.js";
import PostService from "./PostService.js";
import HttpError from "../utils/HttpError.js";

function validId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, "Invalid category id");
    }

    return id;
}

class CategoryService {
    static async findAll() {
        return CategoryModel.findAll();
    }

    static async findById(id) {
        const category = await CategoryModel.findById(validId(id));

        if (!category) {
            throw new HttpError(404, "Category does not exist");
        }

        return category;
    }

    static async findPosts(id, query, user) {
        const category = await this.findById(id);
        return PostService.findAll({...query, category: category.id}, user);
    }

    static async create(data = {}) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new HttpError(400, "Invalid category data");
        }

        const fields = Object.keys(data);

        if (fields.some(field => !["title", "description"].includes(field))) {
            throw new HttpError(400, "Invalid category fields");
        }

        const title = data.title;

        if (typeof title !== "string" || !title.trim() || title.length > 255) {
            throw new HttpError(400, "Invalid title");
        }

        const description = data.description ?? null;

        if (description !== null && typeof description !== "string") {
            throw new HttpError(400, "Invalid description");
        }

        const id = await CategoryModel.create(title.trim(), description);
        return CategoryModel.findById(id);
    }

    static async update(id, data = {}) {
        const category = await this.findById(id);

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new HttpError(400, "Invalid category data");
        }

        const fields = Object.keys(data);

        if (!fields.length || fields.some(field => !["title", "description"].includes(field))) {
            throw new HttpError(400, "Only title and description can be updated");
        }

        const changes = {};

        if ("title" in data) {
            if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 255) {
                throw new HttpError(400, "Invalid title");
            }

            changes.title = data.title.trim();
        }

        if ("description" in data) {
            if (data.description !== null && typeof data.description !== "string") {
                throw new HttpError(400, "Invalid description");
            }

            changes.description = data.description;
        }

        await CategoryModel.update(category.id, changes);
        return CategoryModel.findById(category.id);
    }

    static async delete(id) {
        const category = await this.findById(id);
        await CategoryModel.delete(category.id);
    }
}

export default CategoryService;
