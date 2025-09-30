import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

console.log("DEBUG - Database config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "***SET***" : "***NOT SET***",
  database: process.env.DB_NAME,
});

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "project",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Gagal konek ke database:", err.message);
    console.error("DEBUG - Error details:", err);
    return;
  }
  console.log("✅ Terhubung ke database MySQL!");
});

export default db;
