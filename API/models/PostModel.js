import pool from "../database/connection.js";

class PostModel {
    static async withCardData(result, user) {
        if (!result.posts.length) {
            return result;
        }

        const postIds = result.posts.map(post => post.id);
        const includeInactive = user?.role === "admin";
        const [categories, likes, commentCounts] = await Promise.all([
            this.findCategoriesForPosts(postIds),
            this.findLikesForPosts(postIds),
            this.countCommentsForPosts(postIds, includeInactive)
        ]);

        const categoriesByPost = this.groupByPost(categories);
        const likesByPost = this.groupByPost(likes);
        const countsByPost = new Map();

        for (const row of commentCounts) {
            countsByPost.set(String(row.post_id), Number(row.total));
        }

        const posts = [];

        for (const post of result.posts) {
            const postId = String(post.id);

            posts.push({
                ...post,
                categories: categoriesByPost.get(postId) || [],
                likes: likesByPost.get(postId) || [],
                commentsCount: countsByPost.get(postId) || 0
            });
        }

        return {...result, posts};
    }

    static async findCategoriesForPosts(postIds) {
        if (!postIds.length) {
            return [];
        }

        const placeholders = postIds.map(() => "?").join(", ");
        const [categories] = await pool.execute(
            `SELECT pc.post_id, c.id, c.title, c.description
             FROM DbPostCategory pc
             JOIN DbCategory c ON c.id = pc.category_id
             WHERE pc.post_id IN (${placeholders})
             ORDER BY c.id`,
            postIds
        );

        return categories;
    }

    static async findLikesForPosts(postIds) {
        if (!postIds.length) {
            return [];
        }

        const placeholders = postIds.map(() => "?").join(", ");
        const [likes] = await pool.execute(
            `SELECT id, post_id, author_id, type
             FROM DbLike
             WHERE post_id IN (${placeholders})
             ORDER BY id`,
            postIds
        );

        return likes;
    }

    static async countCommentsForPosts(postIds, includeInactive = false) {
        if (!postIds.length) {
            return [];
        }

        const placeholders = postIds.map(() => "?").join(", ");
        const statusFilter = includeInactive ? "" : "AND status = 'active'";
        const [counts] = await pool.execute(
            `SELECT post_id, COUNT(*) AS total
             FROM DbComment
             WHERE post_id IN (${placeholders}) ${statusFilter}
             GROUP BY post_id`,
            postIds
        );

        return counts;
    }

    static groupByPost(rows) {
        const grouped = new Map();

        for (const row of rows) {
            const postId = String(row.post_id);

            if (!grouped.has(postId)) {
                grouped.set(postId, []);
            }

            grouped.get(postId).push(row);
        }

        return grouped;
    }

    static async findMembership(postId, userId) {
        const [rows] = await pool.execute(`SELECT
            EXISTS(SELECT 1 FROM DbFavorite WHERE post_id = ? AND user_id = ?) AS favorite,
            EXISTS(SELECT 1 FROM DbPostSubscription WHERE post_id = ? AND user_id = ?) AS subscribed`,
        [postId, userId, postId, userId]);
        return {favorite: Boolean(rows[0].favorite), subscribed: Boolean(rows[0].subscribed)};
    }

    static async findSubscriberEmails(postId) {
        const [rows] = await pool.execute(
            `SELECT u.email
             FROM DbPostSubscription s
             JOIN DbUser u ON u.id = s.user_id
             WHERE s.post_id = ? AND u.email_verified = TRUE`,
            [postId]
        );

        return rows.map(row => row.email);
    }

    static async findSubscriptions({userId, role, page, pageSize}) {
        const values = [userId, userId, role];
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM DbPostSubscription s
             JOIN DbPost p ON p.id = s.post_id
             WHERE s.user_id = ? AND (p.status = 'active' OR p.author_id = ? OR ? = 'admin')`,
            values
        );
        const [rows] = await pool.execute(
            `SELECT p.id, p.author_id, COALESCE(u.login, 'removed') AS author_login, u.profile_picture AS author_avatar,
                p.title, p.publish_date, p.status, p.is_locked, p.content,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'like') AS like_count
             FROM DbPostSubscription s
             JOIN DbPost p ON p.id = s.post_id
             LEFT JOIN DbUser u ON u.id = p.author_id
             WHERE s.user_id = ? AND (p.status = 'active' OR p.author_id = ? OR ? = 'admin')
             ORDER BY s.subscribed_at DESC, s.post_id DESC
             LIMIT ? OFFSET ?`,
            [...values, pageSize, (page - 1) * pageSize]
        );

        return {posts: rows, total: countRows[0].total, page, pageSize};
    }

    static async addSubscription(postId, userId) {
        await pool.execute(
            `INSERT INTO DbPostSubscription (user_id, post_id) VALUES (?, ?)`,
            [userId, postId]
        );
    }

    static async deleteSubscription(postId, userId) {
        const [result] = await pool.execute(
            `DELETE FROM DbPostSubscription WHERE user_id = ? AND post_id = ?`,
            [userId, postId]
        );

        return result.affectedRows > 0;
    }

    static async findFavorites({userId, role, page, pageSize}) {
        const values = [userId, userId, role];
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM DbFavorite f
             JOIN DbPost p ON p.id = f.post_id
             WHERE f.user_id = ? AND (p.status = 'active' OR p.author_id = ? OR ? = 'admin')`,
            values
        );
        const [rows] = await pool.execute(
            `SELECT p.id, p.author_id, COALESCE(u.login, 'removed') AS author_login, u.profile_picture AS author_avatar,
                p.title, p.publish_date, p.status, p.is_locked, p.content,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'like') AS like_count
             FROM DbFavorite f
             JOIN DbPost p ON p.id = f.post_id
             LEFT JOIN DbUser u ON u.id = p.author_id
             WHERE f.user_id = ? AND (p.status = 'active' OR p.author_id = ? OR ? = 'admin')
             ORDER BY f.saved_at DESC, f.post_id DESC
             LIMIT ? OFFSET ?`,
            [...values, pageSize, (page - 1) * pageSize]
        );

        return {posts: rows, total: countRows[0].total, page, pageSize};
    }

    static async addFavorite(postId, userId) {
        await pool.execute(
            `INSERT INTO DbFavorite (user_id, post_id) VALUES (?, ?)`,
            [userId, postId]
        );
    }

    static async deleteFavorite(postId, userId) {
        const [result] = await pool.execute(
            `DELETE FROM DbFavorite WHERE user_id = ? AND post_id = ?`,
            [userId, postId]
        );

        return result.affectedRows > 0;
    }

    static async findAll({page, pageSize, sort, categoryId, categoryIds = [], authorId, dateFrom, dateTo, status, search, user}) {
        const conditions = [];
        const values = [];

        if (user?.role !== "admin") {
            if (status === "inactive" && user) {
                conditions.push("p.status = 'inactive' AND p.author_id = ?");
                values.push(user.userId);
            } else if (!status && user && String(authorId) === String(user.userId)) {
                // both active and inactive
            } else {
                conditions.push("p.status = 'active'");
            }
        } else if (status) {
            conditions.push("p.status = ?");
            values.push(status);
        }

        if (authorId) {
            conditions.push("p.author_id = ?");
            values.push(authorId);
        }

        if (categoryId) {
            conditions.push("EXISTS (SELECT 1 FROM DbPostCategory pc WHERE pc.post_id = p.id AND pc.category_id = ?)");
            values.push(categoryId);
        }
        if (categoryIds.length) {
            conditions.push(`EXISTS (SELECT 1 FROM DbPostCategory pc WHERE pc.post_id = p.id AND pc.category_id IN (${categoryIds.map(() => '?').join(', ')}))`);
            values.push(...categoryIds);
        }

        if (dateFrom) {
            conditions.push("p.publish_date >= ?");
            values.push(dateFrom);
        }

        if (dateTo) {
            conditions.push("p.publish_date <= ?");
            values.push(dateTo);
        }

        if (search) {
            conditions.push("(INSTR(LOWER(p.title), LOWER(?)) > 0 OR INSTR(LOWER(p.content), LOWER(?)) > 0)");
            values.push(search, search);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const order = sort === "relevance"
            ? "CASE WHEN LOWER(p.title) = LOWER(?) THEN 0 WHEN INSTR(LOWER(p.title), LOWER(?)) > 0 THEN 1 ELSE 2 END, like_count DESC, p.id DESC"
            : sort === "date" ? "p.publish_date DESC, p.id DESC"
                : sort === "dislikes" ? "dislike_count DESC, p.publish_date DESC, p.id DESC" : "like_count DESC, p.id DESC";
        const orderValues = sort === "relevance" ? [search, search] : [];
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total FROM DbPost p ${where}`,
            values
        );
        const [rows] = await pool.execute(
            `SELECT p.id, p.author_id, COALESCE(u.login, 'removed') AS author_login, u.profile_picture AS author_avatar,
                p.title, p.publish_date, p.status, p.is_locked, p.content,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'like') AS like_count,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'dislike') AS dislike_count
             FROM DbPost p
             LEFT JOIN DbUser u ON u.id = p.author_id
             ${where}
             ORDER BY ${order}
             LIMIT ? OFFSET ?`,
            [...values, ...orderValues, pageSize, (page - 1) * pageSize]
        );

        return {posts: rows, total: countRows[0].total, page, pageSize};
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT p.id, p.author_id, COALESCE(u.login, 'removed') AS author_login, u.profile_picture AS author_avatar,
                p.title, p.publish_date, p.status, p.is_locked, p.content,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'like') AS like_count
             FROM DbPost p
             LEFT JOIN DbUser u ON u.id = p.author_id
             WHERE p.id = ?`,
            [id]
        );

        return rows[0] ?? null;
    }

    static async findCategories(id) {
        const [rows] = await pool.execute(
            `SELECT c.id, c.title, c.description
             FROM DbCategory c
             JOIN DbPostCategory pc ON pc.category_id = c.id
             WHERE pc.post_id = ?
             ORDER BY c.id`,
            [id]
        );

        return rows;
    }

    static async findImages(id) {
        const [rows] = await pool.execute(
            `SELECT id, post_id, image_path FROM DbPostImage WHERE post_id = ? ORDER BY id`,
            [id]
        );

        return rows;
    }

    static async findImage(postId, imageId) {
        const [rows] = await pool.execute(
            `SELECT id, post_id, image_path FROM DbPostImage WHERE post_id = ? AND id = ?`,
            [postId, imageId]
        );

        return rows[0] ?? null;
    }

    static async deleteImage(postId, imageId) {
        const [result] = await pool.execute(
            `DELETE FROM DbPostImage WHERE post_id = ? AND id = ?`,
            [postId, imageId]
        );
        return result.affectedRows > 0;
    }

    static async addImages(postId, paths) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const imagePath of paths) {
                await connection.execute(
                    `INSERT INTO DbPostImage (post_id, image_path) VALUES (?, ?)`,
                    [postId, imagePath]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return this.findImages(postId);
    }

    static async countCategories(ids) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS total FROM DbCategory WHERE id IN (${ids.map(() => "?").join(", ")})`,
            ids
        );

        return rows[0].total;
    }

    static async create(authorId, title, content, categories, status = 'active') {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO DbPost (author_id, title, content, status) VALUES (?, ?, ?, ?)`,
                [authorId, title, content, status]
            );

            for (const categoryId of categories) {
                await connection.execute(
                    `INSERT INTO DbPostCategory (post_id, category_id) VALUES (?, ?)`,
                    [result.insertId, categoryId]
                );
            }

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, changes, categories) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const fields = Object.keys(changes);

            if (fields.length) {
                const assignments = fields.map(field => `${field} = ?`).join(", ");
                await connection.execute(
                    `UPDATE DbPost SET ${assignments} WHERE id = ?`,
                    [...fields.map(field => changes[field]), id]
                );
            }

            if (categories) {
                await connection.execute(`DELETE FROM DbPostCategory WHERE post_id = ?`, [id]);

                for (const categoryId of categories) {
                    await connection.execute(
                        `INSERT INTO DbPostCategory (post_id, category_id) VALUES (?, ?)`,
                        [id, categoryId]
                    );
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const [result] = await pool.execute(`DELETE FROM DbPost WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    static async findComments(id, includeInactive = false) {
        const [rows] = await pool.execute(
            `SELECT c.id, c.post_id, c.parent_id, c.author_id, c.publish_date, c.content, c.status, c.is_locked,
                u.login AS author_login
             FROM DbComment c LEFT JOIN DbUser u ON u.id = c.author_id
             WHERE c.post_id = ? ${includeInactive ? "" : "AND c.status = 'active'"}
             ORDER BY c.publish_date ASC, c.id ASC`,
            [id]
        );

        if (!rows.length) return rows;

        const ids = rows.map(row => row.id);
        const [likes] = await pool.execute(`SELECT id, comment_id, author_id, type FROM DbLike
            WHERE comment_id IN (${ids.map(() => '?').join(', ')}) ORDER BY id`, ids);
        const grouped = new Map();
        for (const like of likes) {
            const key = String(like.comment_id);
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(like);
        }
        return rows.map(row => ({...row, likes: grouped.get(String(row.id)) || []}));
    }

    static async createComment(postId, authorId, content, parentId = null) {
        const [result] = await pool.execute(
            `INSERT INTO DbComment (post_id, author_id, content, parent_id, status)
             VALUES (?, ?, ?, ?, 'active')`,
            [postId, authorId, content, parentId]
        );

        const [rows] = await pool.execute(
            `SELECT id, post_id, parent_id, author_id, publish_date, content, status, is_locked
             FROM DbComment WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    static async findLikes(id) {
        const [rows] = await pool.execute(
            `SELECT id, author_id, publish_date, post_id, type
             FROM DbLike WHERE post_id = ? ORDER BY id`,
            [id]
        );

        return rows;
    }

    static async createLike(postId, authorId, type) {
        const [result] = await pool.execute(
            `INSERT INTO DbLike (post_id, author_id, type) VALUES (?, ?, ?)`,
            [postId, authorId, type]
        );

        const [rows] = await pool.execute(
            `SELECT id, author_id, publish_date, post_id, type
             FROM DbLike WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    static async deleteLike(postId, authorId) {
        const [result] = await pool.execute(
            `DELETE FROM DbLike WHERE post_id = ? AND author_id = ?`,
            [postId, authorId]
        );

        return result.affectedRows > 0;
    }
}

export default PostModel;

