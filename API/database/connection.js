import mysql from "mysql2/promise";
import { dbConfig } from '../config/db.js';

const pool = mysql.createPool(dbConfig);

export default pool;