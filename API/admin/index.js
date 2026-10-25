import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";
import jwt from "jsonwebtoken";
import {appConfig} from "../config/app.js";
import {User, Post, Category, Comment, Like} from "./models.js";
import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import UserModel from "../models/UserModel.js";
import PostService from "../services/PostService.js";
import CategoryService from "../services/CategoryService.js";
import CommentService from "../services/CommentService.js";
import LikeService from "../services/LikeService.js";
import bcrypt from "bcrypt";

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database
});

function fields(data, names) {
    return Object.fromEntries(names.filter(name => data[name] !== undefined).map(name => [name, data[name]]));
}

function categories(value) {
    return String(value ?? "").split(",").map(id => Number(id.trim()));
}

function actor(currentAdmin) {
    return {userId: currentAdmin.id, role: "admin"};
}

function failed(error, record, currentAdmin) {
    return {
        record: record.toJSON(currentAdmin),
        notice: {message: error.message, type: "error"}
    };
}

function newAction(create, layout) {
    return {
        ...(layout ? {layout} : {}),
        handler: async (request, response, context) => {
            try {
                const data = await create(request.payload ?? {}, context.currentAdmin);
                const record = await context.resource.findOne(data.id);

                return {
                    record: record.toJSON(context.currentAdmin),
                    redirectUrl: context.h.resourceUrl({resourceId: context.resource.id()}),
                    notice: {message: "Successfully created", type: "success"}
                };
            } catch (error) {
                return failed(error, await context.resource.build(request.payload ?? {}), context.currentAdmin);
            }
        }
    };
}

function editAction(update, layout) {
    return {
        ...(layout ? {layout} : {}),
        handler: async (request, response, context) => {
            if (request.method === "get") {
                return {record: context.record.toJSON(context.currentAdmin)};
            }

            try {
                await update(request.params.recordId, request.payload ?? {}, context.currentAdmin);
                const record = await context.resource.findOne(request.params.recordId);

                return {
                    record: record.toJSON(context.currentAdmin),
                    redirectUrl: context.h.resourceUrl({resourceId: context.resource.id()}),
                    notice: {message: "Successfully updated", type: "success"}
                };
            } catch (error) {
                return failed(error, context.record, context.currentAdmin);
            }
        }
    };
}

function deleteAction(remove) {
    return {
        handler: async (request, response, context) => {
            if (request.method === "get") {
                return {record: context.record.toJSON(context.currentAdmin)};
            }

            try {
                await remove(request.params.recordId, context.currentAdmin);

                return {
                    record: context.record.toJSON(context.currentAdmin),
                    redirectUrl: context.h.resourceUrl({resourceId: context.resource.id()}),
                    notice: {message: "Successfully deleted", type: "success"}
                };
            } catch (error) {
                return failed(error, context.record, context.currentAdmin);
            }
        }
    };
}

const readOnly = {isVisible: {list: true, show: true, edit: false, filter: true}};
const resources = [
    {
        resource: User,
        options: {
            listProperties: ["id", "login", "email", "role", "rating", "email_verified"],
            properties: {
                password: {type: "password", isVisible: {list: false, show: false, edit: true, filter: false}},
                passwordConfirmation: {type: "password", isVisible: {list: false, show: false, edit: true, filter: false}},
                role: {description: "New users start as users. Change the role after creation."},
                rating: readOnly,
                profile_picture: readOnly,
                created_at: readOnly,
                updated_at: readOnly,
                email_verified: readOnly
            },
            actions: {
                new: newAction(async data => {
                    const user = await UserService.createUser(fields(data, ["login", "email", "password", "passwordConfirmation"]));
                    if (data.full_name) await UserService.update(user.id, {userId: user.id, role: "admin"}, {full_name: data.full_name});
                    return user;
                }),
                edit: editAction(async (id, data) => {
                    if (data.password && (data.password.length < 8 || data.password.length > 255 ||
                        data.password !== data.passwordConfirmation)) {
                        throw new Error("Password must have 8 to 255 characters and match confirmation");
                    }

                    const changes = fields(data, ["login", "full_name", "email"]);
                    if (Object.keys(changes).length) await UserService.update(id, {userId: id, role: "admin"}, changes);
                    if (data.role !== undefined) await UserService.updateRole(id, data.role);
                    if (data.password) {
                        await UserModel.resetPassword(id, await bcrypt.hash(data.password, 10));
                    }
                }),
                delete: deleteAction(id => UserService.delete(id)),
                bulkDelete: {isAccessible: false}
            }
        }
    },
    {
        resource: Post,
        options: {
            listProperties: ["id", "title", "author_id", "status", "is_locked", "publish_date"],
            properties: {
                author_id: readOnly,
                publish_date: readOnly,
                categories: {type: "string", isVisible: {list: false, show: false, edit: true, filter: false}},
                is_locked: {type: "boolean"}
            },
            actions: {
                new: newAction(async (data, currentAdmin) => {
                    const post = await PostService.create(currentAdmin.id, {
                        title: data.title,
                        content: data.content,
                        categories: categories(data.categories)
                    });
                    const extra = fields(data, ["status"]);
                    if (Object.keys(extra).length) await PostService.update(post.id, actor(currentAdmin), extra);
                    return post;
                }, ["title", "content", "categories", "status"]),
                edit: editAction((id, data, admin) => PostService.update(
                    id, actor(admin), fields(data, ["status"])
                ), ["status"]),
                delete: deleteAction((id, admin) => PostService.delete(id, actor(admin))),
                bulkDelete: {isAccessible: false}
            }
        }
    },
    {
        resource: Category,
        options: {
            actions: {
                new: newAction(data => CategoryService.create(fields(data, ["title", "description"]))),
                edit: editAction((id, data) => CategoryService.update(id, fields(data, ["title", "description"]))),
                delete: deleteAction(id => CategoryService.delete(id)),
                bulkDelete: {isAccessible: false}
            }
        }
    },
    {
        resource: Comment,
        options: {
            listProperties: ["id", "post_id", "author_id", "content", "status", "is_locked"],
            properties: {
                author_id: readOnly,
                publish_date: readOnly,
                is_locked: {type: "boolean"}
            },
            actions: {
                new: newAction(async (data, currentAdmin) => {
                    const comment = await PostService.createComment(data.post_id, actor(currentAdmin), data.content, data.parent_id || null);
                    const extra = fields(data, ["status"]);
                    if (Object.keys(extra).length) await CommentService.update(comment.id, actor(currentAdmin), extra);
                    return comment;
                }, ["post_id", "parent_id", "content", "status"]),
                edit: editAction((id, data, admin) => CommentService.update(
                    id, actor(admin), fields(data, ["status"])
                ), ["status"]),
                delete: deleteAction((id, admin) => CommentService.delete(id, actor(admin))),
                bulkDelete: {isAccessible: false}
            }
        }
    },
    {
        resource: Like,
        options: {
            listProperties: ["id", "author_id", "post_id", "comment_id", "type", "publish_date"],
            properties: {
                author_id: readOnly,
                publish_date: readOnly
            },
            actions: {
                new: newAction((data, admin) => {
                    if (data.post_id && !data.comment_id) return PostService.createLike(data.post_id, actor(admin), data.type);
                    if (data.comment_id && !data.post_id) return CommentService.createLike(data.comment_id, actor(admin), data.type);
                    throw new Error("Enter a post ID or a comment ID");
                }),
                edit: {isAccessible: false},
                delete: deleteAction(id => LikeService.delete(id)),
                bulkDelete: {isAccessible: false}
            }
        }
    }
];

const admin = new AdminJS({rootPath: "/admin", resources});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
        try {
            const account = await UserModel.findByEmail(email.trim());
            if (!account) return null;
            const token = await AuthService.login({login: account.login, password});
            const payload = jwt.verify(token, appConfig.jwtSecret);
            if (payload.role !== "admin") return null;

            const user = await UserModel.findById(payload.userId);
            return user?.role === "admin" ? {id: user.id, email: user.email, login: user.login} : null;
        } catch {
            return null;
        }
    },
    cookieName: "adminjs",
    cookiePassword: appConfig.jwtSecret
}, null, {
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production"}
});

export default adminRouter;
