import UserService from "../services/UserService.js";
import { sendErrorResponse } from "../utils/HttpError.js";

class UserController {

    static async findById(req, res) {
        try {
            const user = await UserService.findById(req.params.id);

            return res.status(200).json(user);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async findAll(req, res) {
        try {
            const users = await UserService.findAll();

            return res.status(200).json(users);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async createUser(req, res) {
        try {
            const user = await UserService.createUser(req.body);

            return res.status(201).json(user);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async uploadAvatar(req, res) {
        try {
            const user = await UserService.uploadAvatar(req.user.userId, req.file);

            return res.status(200).json(user);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async update(req, res) {
        try {
            const user = await UserService.update(req.params.id, req.user, req.body);

            return res.status(200).json(user);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async updateRole(req, res) {
        try {
            const user = await UserService.updateRole(req.params.id, req.body?.role);

            return res.status(200).json(user);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async delete(req, res) {
        try {
            await UserService.delete(req.params.id);

            return res.status(204).send();
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default UserController;
