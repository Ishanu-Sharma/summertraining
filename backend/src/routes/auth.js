const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { newId, randomAvatar, serializeUser } = require("../utils");
const { authRequired } = require("../middleware/auth");
const { loginLimiter, registerLimiter, passwordResetLimiter } = require("../middleware/rateLimit");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

router.post("/register", registerLimiter, async (req, res) => {
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

router.post("/login", loginLimiter, async (req, res) => {
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

/* ---- Forgot / reset password ---- */

router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || "").trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ error: "Email is required." });

    const [rows] = await pool.query("SELECT id, full_name FROM users WHERE email = ?", [cleanEmail]);
    // Always return the same response whether or not the account exists,
    // so this endpoint can't be used to check which emails are registered.
    if (rows[0]) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await pool.query(
        "UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?",
        [tokenHash, expires, rows[0].id]
      );

      const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
      const resetUrl = `${clientOrigin}/reset-password?token=${rawToken}&id=${rows[0].id}`;
      await sendEmail({
        to: cleanEmail,
        subject: "Reset your password — The Quad",
        text: `Hi ${rows[0].full_name},\n\nUse the link below to reset your password. It expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`
      });
    }

    res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { id, token, password } = req.body;
    if (!id || !token || !password) return res.status(400).json({ error: "Missing required fields." });
    if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const [rows] = await pool.query(
      "SELECT id, reset_token_hash, reset_token_expires FROM users WHERE id = ?", [id]
    );
    const row = rows[0];
    const tokenHash = hashToken(token);
    const valid = row && row.reset_token_hash && row.reset_token_expires &&
      row.reset_token_hash === tokenHash && new Date(row.reset_token_expires).getTime() > Date.now();

    if (!valid) {
      return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?",
      [passwordHash, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
