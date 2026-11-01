import {createHash, randomBytes} from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {appConfig} from "../config/app.js";
import InvitationModel from "../models/InvitationModel.js";
import UserModel from "../models/UserModel.js";
import EmailService from "./EmailService.js";
import HttpError from "../utils/HttpError.js";

function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

class InvitationService {
    static async invite(data = {}) {
        const email = typeof data?.email === "string" ? data.email.trim() : "";

        const role = data?.role;
        if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new HttpError(400, "Invalid email");
        }

        if (!["user", "admin"].includes(role)) {
            throw new HttpError(400, "Role must be user or admin");
        }

        if (await UserModel.findByEmail(email)) {
            throw new HttpError(409, "Email already exists");
        }

        const token = randomBytes(32).toString("hex");
        const hash = hashToken(token);
        await InvitationModel.create(hash, email, role);
        const emailSent = await EmailService.sendInvitation(email, token);

        return {
            emailSent,
            message: emailSent
                ? "Invitation sent. The link is valid for 24 hours."
                : "Email service is unavailable. The invitation link was logged in the backend console. It is valid for 24 hours."
        };
    }

    static async accept(data = {}) {
        const {token, login, password, passwordConfirmation} = data || {};

        if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
            throw new HttpError(400, "Invalid invitation token");
        }

        if (typeof login !== "string" || !/^[a-zA-Z0-9_]{3,255}$/.test(login)) {
            throw new HttpError(400, "Login must have 3 to 255 letters, numbers or underscores");
        }

        if (typeof password !== "string" || password.length < 3 || password.length > 155 || typeof passwordConfirmation !== "string") {
            throw new HttpError(400, "Password must have 3 to 155 characters and be confirmed");
        }

        if (password !== passwordConfirmation) {
            throw new HttpError(400, "Passwords do not match");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = await InvitationModel.accept(hashToken(token), login, hashedPassword);
        const user = await UserModel.findById(id);
        const accessToken = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                purpose: "access"
            },
            appConfig.jwtSecret,
            {
                expiresIn: appConfig.jwtExpiresIn
            }
        );

        return {token: accessToken, user};
    }
}

export default InvitationService;
