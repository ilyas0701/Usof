import UserModel from "../models/UserModel.js";
import HttpError from "../utils/HttpError.js";
import AuthService from "./AuthService.js";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import imageExtension from "../utils/imageExtension.js";

const avatarDirectory = path.resolve("uploads/avatars");

class UserService {

    static async findById(id) {
        const userId = Number(id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            throw new HttpError(400, "Invalid user id");
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            throw new HttpError(404, "User does not exist");
        }

        return user;
    }

    static async findAll() {
        return UserModel.findAll();
    }

    static async createUser(userData) {
        return AuthService.register(userData);
    }

    static async uploadAvatar(userId, file) {
        if (!file) {
            throw new HttpError(400, "Avatar file is required");
        }

        const extension = imageExtension(file.buffer);

        if (!extension) {
            throw new HttpError(400, "Avatar must be a JPEG, PNG, WebP or GIF image");
        }

        const user = await this.findById(userId);

        const filename = `${randomUUID()}.${extension}`;
        const filePath = path.join(avatarDirectory, filename);
        const avatarPath = `/uploads/avatars/${filename}`;

        await mkdir(avatarDirectory, { recursive: true });
        await writeFile(filePath, file.buffer);

        try {
            await UserModel.updateAvatar(userId, avatarPath);
        } catch (error) {
            await unlink(filePath).catch(() => {});
            throw error;
        }

        if (user.profile_picture?.startsWith("/uploads/avatars/")) {
            await unlink(path.join(avatarDirectory, path.basename(user.profile_picture))).catch(() => {});
        }

        return this.findById(userId);
    }

    static async update(id, actor, userData = {}) {
        if (String(actor.userId) !== String(id) && actor.role !== "admin") {
            throw new HttpError(403, "You cannot update this user");
        }

        if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
            throw new HttpError(400, "Invalid user data");
        }

        const fields = Object.keys(userData);

        if (!fields.length || fields.some(field => !["login", "full_name", "email"].includes(field))) {
            throw new HttpError(400, "Only login, full_name and email can be updated");
        }

        const user = await this.findById(id);
        const changes = {};

        if ("login" in userData) {
            const login = userData.login;

            if (typeof login !== "string" || !/^[a-zA-Z0-9_]{3,255}$/.test(login)) {
                throw new HttpError(400, "Invalid login");
            }

            if (login !== user.login) {
                const existingUser = await UserModel.findByLogin(login);

                if (existingUser && String(existingUser.id) !== String(id)) {
                    throw new HttpError(409, "Login already exists");
                }

                changes.login = login;
            }
        }

        if ("full_name" in userData) {
            const fullName = userData.full_name;

            if (fullName !== null && (typeof fullName !== "string" || fullName.length > 255)) {
                throw new HttpError(400, "Invalid full_name");
            }

            if (fullName !== user.full_name) {
                changes.full_name = fullName;
            }
        }

        if ("email" in userData) {
            const email = userData.email;

            if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
                throw new HttpError(400, "Invalid email");
            }

            if (email !== user.email) {
                const existingUser = await UserModel.findByEmail(email);

                if (existingUser && String(existingUser.id) !== String(id)) {
                    throw new HttpError(409, "Email already exists");
                }

                changes.email = email;
                changes.email_verified = false;
            }
        }

        if (Object.keys(changes).length) {
            try {
                await UserModel.update(id, changes);
            } catch (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    throw new HttpError(409, "Login or email already exists");
                }

                throw error;
            }
        }

        if (changes.email) {
            await AuthService.sendVerificationEmail(id, changes.email);
        }

        return this.findById(id);
    }

    static async updateRole(id, role) {
        if (role !== "user" && role !== "admin") {
            throw new HttpError(400, "Role must be user or admin");
        }

        await this.findById(id);
        await UserModel.updateRole(id, role);

        return this.findById(id);
    }

    static async delete(id) {
        const user = await this.findById(id);
        const deleted = await UserModel.delete(id);

        if (!deleted) {
            throw new HttpError(404, "User does not exist");
        }

        await UserModel.refreshRatings();

        if (user.profile_picture?.startsWith("/uploads/avatars/")) {
            const filename = path.basename(user.profile_picture);
            await unlink(path.join(avatarDirectory, filename)).catch(() => {});
        }
    }
}

export default UserService;
