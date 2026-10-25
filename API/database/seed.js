import { dbConfig } from '../config/db.js';
import fs from 'fs/promises';
import mysql from "mysql2/promise";
import {ratingExpression} from "../models/UserModel.js";

async function seedData() {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const files = await fs.readdir(
            new URL("./seeds/", import.meta.url)
        );

        const seedFiles = files
            .filter(file => file.endsWith(".sql"))
            .sort();

        for (const file of seedFiles) {
            const sql = await fs.readFile(
                new URL(`./seeds/${file}`, import.meta.url),
                "utf8"
            );

            await connection.query(sql);

            console.log(`Seed ${file} done!`);
        }

        await connection.query(`UPDATE DbUser u SET u.rating = ${ratingExpression}`);

        console.log("Seeding completed successfully!");
    }
    finally {
        await connection.end();
    }
}

seedData().catch(error => {
    console.error("Seed failed:", error);
    process.exit(1);
});
