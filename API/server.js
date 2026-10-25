import pool from "./database/connection.js";
import { appConfig } from "./config/app.js";
import app from "./app.js";
import {migrate} from "./database/migrate.js";
import UserModel from "./models/UserModel.js";

async function startServer() {
    try {
        await migrate();
        await UserModel.refreshRatings();
        await pool.query("SELECT 1");

        console.log("Database connection fine!");

        app.listen(appConfig.port, () => {
            console.log(`Server is running on ${appConfig.appUrl}`);
        });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
}

startServer();
