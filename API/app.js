import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminRouter from "./admin/index.js";
import { apiReference } from "@scalar/express-api-reference";
import openapi from "./docs/openapi.js";
import path from "node:path";

const app = express();

app.use("/admin", adminRouter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads/avatars", express.static(path.resolve("uploads/avatars")));
app.get("/api/openapi.json", (req, res) => res.json(openapi));
app.use("/api/docs", apiReference({url: "/api/openapi.json"}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
    return res.status(404).json({message: "Route does not exist"});
});

app.use((error, req, res, _next) => {
    const statusCode = error.statusCode ?? error.status ?? 500;
    const message = statusCode === 500 ? "Internal server error" : error.message;

    return res.status(statusCode).json({message});
});

export default app;
