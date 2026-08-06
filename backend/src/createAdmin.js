/*
  Promotes an existing (already-registered) user to the 'admin' role.
  Usage: node src/createAdmin.js someone@adtu.in
*/
require("dotenv").config();
const pool = require("./db");

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node src/createAdmin.js <email>");
    process.exit(1);
  }
  const [rows] = await pool.query("SELECT id, full_name FROM users WHERE email = ?", [email.trim().toLowerCase()]);
  if (!rows[0]) {
    console.error("No user found with that email. Register the account first, then run this script.");
    process.exit(1);
  }
  await pool.query("UPDATE users SET role = 'admin', verified = 1 WHERE id = ?", [rows[0].id]);
  console.log(`${rows[0].full_name} (${email}) is now an admin.`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
