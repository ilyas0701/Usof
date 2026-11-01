import pool from "../database/connection.js";
import HttpError from "../utils/HttpError.js";

class InvitationModel {
    static async create(hash, email, role) {
        await pool.execute(
            `INSERT INTO DbUserInvitation (token_hash, email, role, expires_at)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
            [hash, email, role]
        );
    }

    static async remove(hash) {
        await pool.execute(
            `DELETE FROM DbUserInvitation WHERE token_hash = ?`,
            [hash]
        );
    }

    static async accept(hash, login, password) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.execute(
                `SELECT email, role FROM DbUserInvitation
                WHERE token_hash = ? AND expires_at > NOW() FOR UPDATE`,
                [hash]
            );
            if (!rows.length) {
                throw new HttpError(400, "Invitation is invalid, expired or already used");
            }

            const {email, role} = rows[0];
            const [result] = await connection.execute(
                `INSERT INTO DbUser (login, password, email, role, email_verified)
                VALUES (?, ?, ?, ?, TRUE)`,
                [login, password, email, role]
            );
            await connection.execute(
                `DELETE FROM DbUserInvitation WHERE email = ?`,
                [email]
            );
            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            if (error.code === "ER_DUP_ENTRY") {
                throw new HttpError(409, "Login or email already exists");
            }

            throw error;
        } finally {
            connection.release();
        }
    }
}

export default InvitationModel;
