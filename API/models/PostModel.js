import pool from "../database/connection.js";

class PostModel {
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

    static async findAll({page, pageSize, sort, categoryId, dateFrom, dateTo, status, search, user}) {
        const conditions = [];
        const values = [];

        if (user?.role !== "admin") {
            if (status === "inactive" && user) {
                conditions.push("p.status = 'inactive' AND p.author_id = ?");
                values.push(user.userId);
            } else {
                conditions.push("p.status = 'active'");
            }
        } else if (status) {
            conditions.push("p.status = ?");
            values.push(status);
        }

        if (categoryId) {
            conditions.push("EXISTS (SELECT 1 FROM DbPostCategory pc WHERE pc.post_id = p.id AND pc.category_id = ?)");
            values.push(categoryId);
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
            : sort === "date" ? "p.publish_date DESC, p.id DESC" : "like_count DESC, p.id DESC";
        const orderValues = sort === "relevance" ? [search, search] : [];
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) AS total FROM DbPost p ${where}`,
            values
        );
        const [rows] = await pool.execute(
            `SELECT p.id, p.author_id, COALESCE(u.login, 'removed') AS author_login, u.profile_picture AS author_avatar,
                p.title, p.publish_date, p.status, p.is_locked, p.content,
                (SELECT COUNT(*) FROM DbLike l WHERE l.post_id = p.id AND l.type = 'like') AS like_count
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

    static async create(authorId, title, content, categories) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO DbPost (author_id, title, content) VALUES (?, ?, ?)`,
                [authorId, title, content]
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
            `SELECT id, post_id, parent_id, author_id, publish_date, content, status, is_locked
             FROM DbComment WHERE post_id = ? ${includeInactive ? "" : "AND status = 'active'"}
             ORDER BY publish_date ASC, id ASC`,
            [id]
        );

        return rows;
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

