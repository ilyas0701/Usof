import CategoryService from "../services/CategoryService.js";
import { sendErrorResponse } from "../utils/HttpError.js";

class CategoryController {
    static async findAll(req, res) {
        try {
            const categories = await CategoryService.findAll();
            return res.status(200).json(categories);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findById(req, res) {
        try {
            const category = await CategoryService.findById(req.params.id);
            return res.status(200).json(category);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findPosts(req, res) {
        try {
            const posts = await CategoryService.findPosts(req.params.id, req.query, req.user);
            return res.status(200).json(posts);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async create(req, res) {
        try {
            const category = await CategoryService.create(req.body);
            return res.status(201).json(category);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async update(req, res) {
        try {
            const category = await CategoryService.update(req.params.id, req.body);
            return res.status(200).json(category);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async delete(req, res) {
        try {
            await CategoryService.delete(req.params.id);
            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default CategoryController;
