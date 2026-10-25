import mysql from "mysql2/promise";
import fs from "fs/promises";
import { dbConfig } from "../config/db.js";
import path from "node:path";
import {fileURLToPath} from "node:url";

export async function migrate() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    });

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
        );

        await connection.query(
            `USE \`${dbConfig.database}\``
        );

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS migrations (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const files = await fs.readdir(
            new URL("./migrations/", import.meta.url)
        );

        const migrationFiles = files
            .filter(file => file.endsWith(".sql"))
            .sort();

        for (const file of migrationFiles) {
            const [rows] = await connection.execute(
                "SELECT id FROM migrations WHERE name = ?",
                [file]
            );

            if (rows.length > 0) continue;

            const sql = await fs.readFile(
                new URL(`./migrations/${file}`, import.meta.url),
                "utf8"
            );

            await connection.query(sql);

            await connection.execute(
                "INSERT INTO migrations (name) VALUES (?)",
                [file]
            );

            console.log(`Migration ${file} done!`);
        }

        console.log("Migrations completed successfully!");
    } finally {
        await connection.end();
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    migrate().catch(error => {
        console.error("Migration failed:", error);
        process.exit(1);
    });
}
