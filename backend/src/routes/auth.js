const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { newId, randomAvatar, serializeUser } = require("../utils");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, gradYear, department, role } = req.body;
    if (!fullName || !email || !password || !gradYear || !department) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const cleanRole = role === "student" ? "student" : "alumni"; // only these two are self-selectable at signup
    const cleanEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: "An account with this email already exists." });

    const [settingsRows] = await pool.query("SELECT require_university_email FROM settings WHERE id = 1");
    const requireUnivEmail = settingsRows[0] && settingsRows[0].require_university_email;

    const id = newId("u");
    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = randomAvatar();
    const privacy = JSON.stringify({ showEmail: true, showInDirectory: true, allowStudentMessages: false });
    const notifications = JSON.stringify({ messages: true, events: true, jobs: true });
    // Alumni go through Alumni Office verification; students have nothing to verify, so they're active immediately.
    const verified = cleanRole === "student" ? 1 : 0;

    await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, role, verified, grad_year, department, avatar, skills, privacy, notifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, JSON_ARRAY(), ?, ?)`,
      [id, fullName.trim(), cleanEmail, passwordHash, cleanRole, verified, gradYear, department, avatar, privacy, notifications]
    );

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    const user = serializeUser(rows[0]);
    const token = signToken(user);

    req.app.get("io").to("admins").emit("admin:new-signup", user);

    res.status(201).json({ user, token, requireUniversityEmailNote: !!requireUnivEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const cleanEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [cleanEmail]);
    const row = rows[0];
    if (!row) return res.status(401).json({ error: "That email and password don't match our records." });

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ error: "That email and password don't match our records." });

    const user = serializeUser(row);
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (!rows[0]) return res.status(404).json({ error: "User not found." });
  res.json({ user: serializeUser(rows[0]) });
});

module.exports = router;
