import AuthService from "../services/AuthService.js";
import { sendErrorResponse } from "../utils/HttpError.js";

class AuthController {
    
    static async register(req, res) {
        try {
            const userData = req.body;

            const user = await AuthService.register(userData);

            return res.status(201).json(user);
        } catch (error) {
            if (!error.statusCode) {
                console.error("Registration failed", {
                    code: error.code,
                    command: error.command,
                    responseCode: error.responseCode,
                    message: error.message
                });
            }
            return sendErrorResponse(res, error);
        }
    }

    static async verify(req, res) {
        try {
            const {token} = req.params;

            await AuthService.verify(token);

            return res.status(200).json({
                message: "Email verified successfully"
            });
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async login(req, res) {
        try {
            const userData = req.body;

            const token = await AuthService.login(userData);

            return res.status(200).json({
                token
            });
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async logout(req, res) {
        return res.status(200).json({
            message: "Logged out successfully"
        });
    }

    static async requestPasswordReset(req, res) {
        try {
            const {email} = req.body ?? {};

            const emailSent = await AuthService.resetRequest(email);

            return res.status(200).json({
                message: emailSent === false
                    ? "Email service is unavailable. The password reset link was logged in the backend console. Contact the administrator."
                    : "If an account with this email exists, password reset instructions have been sent."
            });
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async resetPassword(req, res) {
        try {
            const {confirm_token} = req.params;
            const newPasswords = req.body;

            await AuthService.resetPassword(confirm_token, newPasswords);

            return res.status(200).json({
                message: "Password reset successfully!"
            });
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default AuthController;
