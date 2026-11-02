import pool from "../database/connection.js";

export const ratingExpression = `CAST(COALESCE((
    SELECT SUM(CASE WHEN l.type = 'like' THEN 1 ELSE -1 END)
    FROM DbLike l
    LEFT JOIN DbPost p ON p.id = l.post_id
    LEFT JOIN DbComment c ON c.id = l.comment_id
    WHERE p.author_id = u.id OR (c.author_id = u.id AND c.deleted_by IS NULL)
), 0) AS SIGNED)`;

const ratingQuery = `${ratingExpression} AS rating`;

class UserModel {

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.login, u.full_name, u.email, u.profile_picture,
                ${ratingQuery}, u.role, u.email_verified
            FROM DbUser u WHERE u.id = ?`,
            [id]
        );

        return rows[0] ?? null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.login, u.full_name, u.email, u.profile_picture,
                ${ratingQuery}, u.role, u.email_verified
            FROM DbUser u WHERE u.email = ?`,
            [email]
        );

        return rows[0] ?? null;
    }

    static async findByLogin(login) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.login, u.full_name, u.email, u.profile_picture,
                ${ratingQuery}, u.role, u.email_verified
            FROM DbUser u WHERE u.login = ?`,
            [login]
        );

        return rows[0] ?? null;
    }

    static async findForAuthByLogin(login) {
        const [rows] = await pool.execute(
            `SELECT id, login, password, role, email_verified
            FROM DbUser
            WHERE login = ?`,
            [login]
        );

        return rows[0] ?? null;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT u.id, u.login, u.full_name, u.email, u.profile_picture,
                ${ratingQuery}, u.role, u.email_verified
             FROM DbUser u`
        );

        return rows;
    }

    static async refreshRatings(userId = null) {
        await pool.execute(
            `UPDATE DbUser u SET u.rating = ${ratingExpression}${userId ? " WHERE u.id = ?" : ""}`,
            userId ? [userId] : []
        );
    }

    static async create({login, email, password}) {
        const [res] = await pool.execute(
            `INSERT INTO DbUser (login, email, password)
            VALUES (?, ?, ?)`,
            [login, email, password]
        );

        return {
            id: res.insertId,
            login,
            email,
        };
    }

    static async setVerificationToken(userId, email, tokenHash) {
        await pool.execute(
            `UPDATE DbUser SET verification_token_hash = ? WHERE id = ? AND email = ? AND email_verified = FALSE`,
            [tokenHash, userId, email]
        );
    }

    static async verifyEmail(userId, email, tokenHash) {
        const [result] = await pool.execute(
            `UPDATE DbUser
            SET email_verified = TRUE, verification_token_hash = NULL
            WHERE id = ? AND email = ? AND email_verified = FALSE AND verification_token_hash = ?`,
            [userId, email, tokenHash]
        );

        return result;
    }

    static async resetPassword(userId, newPassword) {
        const [result] = await pool.execute(
            `UPDATE DbUser
            SET password = ?
            WHERE id = ?`,
            [newPassword, userId]
        );

        return result;
    }

    static async updateAvatar(userId, avatarPath) {
        const [result] = await pool.execute(
            `UPDATE DbUser
            SET profile_picture = ?
            WHERE id = ?`,
            [avatarPath, userId]
        );

        return result;
    }

    static async update(id, changes) {
        const columns = {
            login: "login",
            full_name: "full_name",
            email: "email",
            email_verified: "email_verified"
        };
        const fields = Object.keys(changes);
        const assignments = fields.map(field => `${columns[field]} = ?`).join(", ");
        const invalidateVerification = "email" in changes || "email_verified" in changes;
        const values = fields.map(field => changes[field]);

        const [result] = await pool.execute(
            `UPDATE DbUser SET ${assignments}${invalidateVerification ? ", verification_token_hash = NULL" : ""} WHERE id = ?`,
            [...values, id]
        );

        return result;
    }

    static async updateRole(id, role) {
        const [result] = await pool.execute(
            `UPDATE DbUser SET role = ? WHERE id = ?`,
            [role, id]
        );

        return result;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            `DELETE FROM DbUser WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default UserModel;
