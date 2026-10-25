import pool from "../database/connection.js";

class CategoryModel {
    static async findAll() {
        const [rows] = await pool.execute(
            `SELECT id, title, description FROM DbCategory ORDER BY id`
        );

        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT id, title, description FROM DbCategory WHERE id = ?`,
            [id]
        );

        return rows[0] ?? null;
    }

    static async create(title, description) {
        const [result] = await pool.execute(
            `INSERT INTO DbCategory (title, description) VALUES (?, ?)`,
            [title, description]
        );

        return result.insertId;
    }

    static async update(id, changes) {
        const fields = Object.keys(changes);
        const assignments = fields.map(field => `${field} = ?`).join(", ");

        const [result] = await pool.execute(
            `UPDATE DbCategory SET ${assignments} WHERE id = ?`,
            [...fields.map(field => changes[field]), id]
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            `DELETE FROM DbCategory WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}

export default CategoryModel;
