import jwt from "jsonwebtoken";
import { appConfig } from "../config/app.js";
import UserModel from "../models/UserModel.js";
import { sendErrorResponse } from "../utils/HttpError.js";

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token required"
        });
    }

    let payload;

    try {
        payload = jwt.verify(
            token,
            appConfig.jwtSecret
        );
    } catch (error) {
        console.log(error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    if (payload.purpose !== "access") {
        return res.status(401).json({
            message: "Invalid access token"
        });
    }

    try {
        const user = await UserModel.findById(payload.userId);

        if (!user) {
            return res.status(401).json({
                message: "User does not exist"
            });
        }

        req.user = { ...payload, role: user.role };

        next();
    } catch (error) {
        return sendErrorResponse(res, error);
    }
}

export default authMiddleware;
