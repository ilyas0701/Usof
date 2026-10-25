import pool from "../database/connection.js";

class CommentModel {
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT id, post_id, parent_id, author_id, publish_date, content, status, is_locked
             FROM DbComment ORDER BY publish_date DESC, id DESC`
        );

        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT id, post_id, parent_id, author_id, publish_date, content, status, is_locked
             FROM DbComment WHERE id = ?`,
            [id]
        );

        return rows[0] ?? null;
    }

    static async update(id, changes) {
        const fields = Object.keys(changes);
        const assignments = fields.map(field => `${field} = ?`).join(", ");
        const [result] = await pool.execute(
            `UPDATE DbComment SET ${assignments} WHERE id = ?`,
            [...fields.map(field => changes[field]), id]
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            `DELETE FROM DbComment WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }

    static async findLikes(id) {
        const [rows] = await pool.execute(
            `SELECT id, author_id, publish_date, comment_id, type
             FROM DbLike WHERE comment_id = ? ORDER BY id`,
            [id]
        );

        return rows;
    }

    static async createLike(commentId, authorId, type) {
        const [result] = await pool.execute(
            `INSERT INTO DbLike (comment_id, author_id, type) VALUES (?, ?, ?)`,
            [commentId, authorId, type]
        );

        const [rows] = await pool.execute(
            `SELECT id, author_id, publish_date, comment_id, type
             FROM DbLike WHERE id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    static async deleteLike(commentId, authorId) {
        const [result] = await pool.execute(
            `DELETE FROM DbLike WHERE comment_id = ? AND author_id = ?`,
            [commentId, authorId]
        );

        return result.affectedRows > 0;
    }
}

export default CommentModel;
