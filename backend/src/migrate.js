/* Applies schema.sql against the configured database. Run with `npm run migrate`. */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
  });

  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  console.log("Applying schema to database:", process.env.DB_NAME);
  await connection.query(sql);
  console.log("Schema applied successfully.");

  // --- Repair pass for databases created before this schema version ---
  // `CREATE TABLE IF NOT EXISTS` above does nothing to tables that already
  // exist, so older installs can be stuck with a `role` ENUM that doesn't
  // include 'student' (causing "Data truncated for column 'role'" on
  // registration) or missing columns/tables added later. These statements
  // are safe to re-run every time.
  console.log("Checking for older installs that need repair...");

  await connection.query(
    `ALTER TABLE users MODIFY COLUMN role ENUM('student','alumni','admin') NOT NULL DEFAULT 'alumni'`
  );

  const addColumnIfMissing = async (table, column, definition) => {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, table, column]
    );
    if (rows[0].cnt === 0) {
      console.log(`  Adding missing column ${table}.${column}...`);
      await connection.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    }
  };

  await addColumnIfMissing("users", "deactivated", "deactivated TINYINT(1) NOT NULL DEFAULT 0 AFTER verified");

  const addIndexIfMissing = async (table, indexName, definition) => {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [process.env.DB_NAME, table, indexName]
    );
    if (rows[0].cnt === 0) {
      console.log(`  Adding missing index ${table}.${indexName}...`);
      await connection.query(`ALTER TABLE ${table} ADD ${definition}`);
    }
  };

  await addIndexIfMissing("conversations", "idx_conv_user_b", "INDEX idx_conv_user_b (user_b)");

  console.log("Repair pass complete.");
  await connection.end();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
