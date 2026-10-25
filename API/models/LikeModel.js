import pool from "../database/connection.js";

class LikeModel {
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT id, author_id, publish_date, post_id, comment_id, type
             FROM DbLike ORDER BY publish_date DESC, id DESC`
        );

        return rows;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            `DELETE FROM DbLike WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default LikeModel;
