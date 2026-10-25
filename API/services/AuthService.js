import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.js";
import { appConfig } from "../config/app.js";
import EmailService from "./EmailService.js";
import jwt from "jsonwebtoken";
import { resetConfig } from "../config/reset.js";
import HttpError from "../utils/HttpError.js";

class AuthService {
    static async register(userData = {}) {
        if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
            throw new HttpError(400, "Invalid user data");
        }

        const { login, password, passwordConfirmation, email} = userData;

        if (typeof login !== "string" || !/^[a-zA-Z0-9_]{3,255}$/.test(login)) {
            throw new HttpError(400, "Login must have 3 to 255 letters, numbers or underscores");
        }

        if (typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new HttpError(400, "Invalid email");
        }

        if (typeof password !== "string" || password.length < 3 || password.length > 155 ||
            typeof passwordConfirmation !== "string") {
            throw new HttpError(400, "Password must have 3 to 155 characters and be confirmed");
        }

        const userByEmail = await UserModel.findByEmail(email);

        if (userByEmail) {
            throw new HttpError(409, "Email already exists");
        }

        const userByLogin = await UserModel.findByLogin(login);

        if (userByLogin) {
            throw new HttpError(409, "Login already exists");
        }

        if (password !== passwordConfirmation) {
            throw new HttpError(400, "Passwords do not match");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            login,
            password: hashedPassword,
            email
        });

        await this.sendVerificationEmail(user.id, user.email);

        return user;
    }

    static async sendVerificationEmail(userId, email) {
        const verificationToken = jwt.sign(
            {
                userId,
                email,
                purpose: "emailVerification"
            },
            appConfig.jwtSecret,
            {
                expiresIn: appConfig.jwtExpiresIn
            }
        );

        await EmailService.sendVerificationEmail(
            email,
            verificationToken
        );
    }

    static async verify(token) {
        let payload;

        try {
            payload = jwt.verify(token, appConfig.jwtSecret);
        } catch {
            throw new HttpError(400, "Invalid or expired verification token");
        }

        if (payload.purpose !== "emailVerification") {
            throw new HttpError(400, "Invalid verification token");
        }

        const user = await UserModel.findById(payload.userId);

        if (!user || user.email !== payload.email) {
            throw new HttpError(400, "Invalid verification token");
        }

        await UserModel.verifyEmail(payload.userId);
    }

    static async login(userData = {}) {
        if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
            throw new HttpError(400, "Invalid login data");
        }

        const {login, password} = userData;

        if (typeof login !== "string" || !login || typeof password !== "string" || !password) {
            throw new HttpError(400, "Login and password are required");
        }

        const user = await UserModel.findForAuthByLogin(login);

        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new HttpError(401, "Invalid login or password");
        }

        if (!user.email_verified) {
            throw new HttpError(403, "Verify your email");
        }

        const token = jwt.sign(
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

        return token;
    }

    static async resetRequest(email) {
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new HttpError(400, "Invalid email");
        }

        const user = await UserModel.findByEmail(email);

        if (!user) return;

        const token = jwt.sign(
            {
                email: email,
                purpose: "resetPassword"
            },
            resetConfig.resetSecret,
            {
                expiresIn: resetConfig.resetExpiresIn
            }
        );

        await EmailService.sendResetToken(email, token);
    }

    static async resetPassword(token, passwords = {}) {
        let payload;

        try {
            payload = jwt.verify(token, resetConfig.resetSecret);
        } catch {
            throw new HttpError(400, "Invalid or expired password reset token");
        }

        if (payload.purpose !== "resetPassword") {
            throw new HttpError(400, "Invalid password reset token");
        }

        const user = await UserModel.findByEmail(payload.email);

        if (!user) {
            throw new HttpError(400, "Invalid password reset token");
        }

        if (!passwords || typeof passwords !== "object" || Array.isArray(passwords)) {
            throw new HttpError(400, "Invalid password data");
        }

        const {newPassword, newPasswordConfirmation} = passwords;

        if (typeof newPassword !== "string" || newPassword.length < 3 || newPassword.length > 155 ||
            typeof newPasswordConfirmation !== "string") {
            throw new HttpError(400, "Password must have 3 to 155 characters and be confirmed");
        }

        if (newPassword !== newPasswordConfirmation) {
            throw new HttpError(400, "Passwords do not match");
        }

        await UserModel.resetPassword(user.id, await bcrypt.hash(newPassword, 10));
    }
}

export default AuthService;
