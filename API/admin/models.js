import {DataTypes, Sequelize} from "sequelize";
import {dbConfig} from "../config/db.js";

const database = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    logging: false
});

const id = () => ({type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true});
const text = () => ({type: DataTypes.TEXT});
const date = () => ({type: DataTypes.DATE});

const User = database.define("User", {
    id: id(),
    login: {type: DataTypes.STRING(255)},
    full_name: {type: DataTypes.STRING(255)},
    email: {type: DataTypes.STRING(255)},
    profile_picture: {type: DataTypes.STRING(512)},
    rating: {type: DataTypes.INTEGER},
    role: {type: DataTypes.ENUM("user", "admin")},
    email_verified: {type: DataTypes.BOOLEAN},
    created_at: date(),
    updated_at: date()
}, {tableName: "DbUser", timestamps: false});

const Post = database.define("Post", {
    id: id(),
    author_id: {type: DataTypes.BIGINT},
    title: {type: DataTypes.STRING(255)},
    publish_date: date(),
    status: {type: DataTypes.ENUM("active", "inactive")},
    is_locked: {type: DataTypes.BOOLEAN},
    content: text()
}, {tableName: "DbPost", timestamps: false});

const Category = database.define("Category", {
    id: id(),
    title: {type: DataTypes.STRING(255)},
    description: text()
}, {tableName: "DbCategory", timestamps: false});

const Comment = database.define("Comment", {
    id: id(),
    post_id: {type: DataTypes.BIGINT},
    parent_id: {type: DataTypes.BIGINT},
    author_id: {type: DataTypes.BIGINT},
    publish_date: date(),
    content: text(),
    status: {type: DataTypes.ENUM("active", "inactive")},
    is_locked: {type: DataTypes.BOOLEAN}
}, {tableName: "DbComment", timestamps: false});

const Like = database.define("Like", {
    id: id(),
    author_id: {type: DataTypes.BIGINT},
    publish_date: date(),
    post_id: {type: DataTypes.BIGINT},
    comment_id: {type: DataTypes.BIGINT},
    type: {type: DataTypes.ENUM("like", "dislike")}
}, {tableName: "DbLike", timestamps: false});

export {database, User, Post, Category, Comment, Like};
