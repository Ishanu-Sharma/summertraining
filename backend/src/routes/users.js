const express = require("express");
const pool = require("../db");
const { newId, serializeUser, serializeUserSummary, serializeUserProfile, DEFAULT_AVATAR, parseJsonSafe } = require("../utils");
const { authRequired, adminRequired } = require("../middleware/auth");
const { uploadAvatar, validateImageBuffer } = require("../middleware/upload");
const storage = require("../utils/storage");

const router = express.Router();

/**
 * GET /api/users — cross-app lookup list (used to resolve names/avatars next
 * to posts, jobs, events, and messages). Admins get full records for the
 * admin console; everyone else gets a privacy-safe summary with NO email,
 * bio, links, skills, or notification settings — see serializeUserSummary.
 * This does not apply directory/visibility filtering; use GET /directory
 * for the alumni directory browse page.
 */
router.get("/", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  const users = req.userRole === "admin" ? rows.map(serializeUser) : rows.map(serializeUserSummary);
  res.json({ users });
});

/**
 * GET /api/users/directory — the alumni directory browse/search page.
 * Server-enforces both the per-user "show me in directory" privacy toggle
 * AND the admin-configured "allow students to browse the directory" setting,
 * neither of which were previously enforced anywhere but the client.
 */
router.get("/directory", authRequired, async (req, res) => {
  if (req.userRole === "student") {
    const [settingsRows] = await pool.query("SELECT allow_student_directory_view FROM settings WHERE id = 1");
    if (settingsRows[0] && !settingsRows[0].allow_student_directory_view) {
      return res.status(403).json({ error: "The Alumni Office currently restricts directory browsing to alumni accounts." });
    }
  }
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE role = 'alumni' AND deactivated = 0 ORDER BY created_at DESC"
  );
  const alumni = rows
    .map(serializeUserSummary)
    .filter(u => u.showInDirectory);
  res.json({ users: alumni });
});

router.get("/:id", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  const row = rows[0];
  const isSelfOrAdmin = req.userRole === "admin" || req.userId === req.params.id;
  if (!row || (row.deactivated && !isSelfOrAdmin)) {
    return res.status(404).json({ error: "User not found." });
  }
  const user = serializeUserProfile(row, { viewerId: req.userId, viewerIsAdmin: req.userRole === "admin" });

  const [exp] = await pool.query("SELECT * FROM experiences WHERE user_id = ? ORDER BY sort_order ASC", [req.params.id]);
  const [edu] = await pool.query("SELECT * FROM education WHERE user_id = ? ORDER BY sort_order ASC", [req.params.id]);
  user.experience = exp.map(x => ({ id: x.id, title: x.title, company: x.company, period: x.period, location: x.location, desc: x.description }));
  user.education = edu.map(x => ({ id: x.id, degree: x.degree, school: x.school, period: x.period }));

  res.json({ user });
});

router.patch("/:id", authRequired, async (req, res) => {
  if (req.userId !== req.params.id && req.userRole !== "admin") {
    return res.status(403).json({ error: "You can only edit your own profile." });
  }
  const allowed = [
    "fullName", "headline", "location", "bio", "gradYear", "department", "company",
    "jobTitle", "industry", "linkedin", "website", "avatar", "skills", "privacy",
    "notifications", "verified", "deactivated"
  ];
  const colMap = {
    fullName: "full_name", headline: "headline", location: "location", bio: "bio",
    gradYear: "grad_year", department: "department", company: "company", jobTitle: "job_title",
    industry: "industry", linkedin: "linkedin", website: "website", avatar: "avatar",
    skills: "skills", privacy: "privacy", notifications: "notifications",
    verified: "verified", deactivated: "deactivated"
  };
  // Only admins may change `verified`
  if ("verified" in req.body && req.userRole !== "admin") delete req.body.verified;

  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (key in req.body) {
      let val = req.body[key];
      if (["skills", "privacy", "notifications"].includes(key)) val = JSON.stringify(val);
      if (typeof val === "boolean") val = val ? 1 : 0;
      sets.push(`${colMap[key]} = ?`);
      values.push(val);
    }
  }
  if (!sets.length) return res.status(400).json({ error: "Nothing to update." });

  values.push(req.params.id);
  await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, values);

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  const user = serializeUser(rows[0]);

  const io = req.app.get("io");
  io.to("admins").emit("admin:user-updated", user);
  if (req.body.verified) io.to(`user:${req.params.id}`).emit("account:verified", user);

  res.json({ user });
});

/* ---- Admin: delete a user account ---- */
router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  if (req.userId === req.params.id) {
    return res.status(400).json({ error: "You can't delete your own admin account." });
  }
  const [rows] = await pool.query("SELECT id, avatar FROM users WHERE id = ?", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "User not found." });

  await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);

  await storage.deleteAvatar(rows[0].avatar);

  req.app.get("io").to("admins").emit("admin:user-deleted", { id: req.params.id });
  res.json({ ok: true });
});

/* ---- Avatar upload ---- */
router.post("/:id/avatar", authRequired, (req, res, next) => {
  if (req.userId !== req.params.id) return res.status(403).json({ error: "You can only update your own photo." });
  next();
}, (req, res) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed." });
    validateImageBuffer(req, res, async () => {
      try {
        const [rows] = await pool.query("SELECT avatar FROM users WHERE id = ?", [req.params.id]);
        const previous = rows[0] && rows[0].avatar;

        const filename = `${req.userId}_${newId()}${req.file.detectedExt}`;
        const publicPath = await storage.saveAvatar(req.file.buffer, filename, req.file.detectedMimetype);
        await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [publicPath, req.params.id]);

        // Best-effort cleanup of the previous avatar (local or object storage).
        await storage.deleteAvatar(previous);

        const [updatedRows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
        const user = serializeUser(updatedRows[0]);
        req.app.get("io").to("admins").emit("admin:user-updated", user);
        res.json({ user });
      } catch (err2) {
        console.error(err2);
        res.status(500).json({ error: "Upload failed. Please try again." });
      }
    });
  });
});

router.delete("/:id/avatar", authRequired, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ error: "Forbidden." });
  const [rows] = await pool.query("SELECT avatar FROM users WHERE id = ?", [req.params.id]);
  const previous = rows[0] && rows[0].avatar;
  const fallback = DEFAULT_AVATAR;
  await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [fallback, req.params.id]);
  await storage.deleteAvatar(previous);
  const [updatedRows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  res.json({ user: serializeUser(updatedRows[0]) });
});

/* ---- Experience ---- */
router.put("/:id/experience", authRequired, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ error: "Forbidden." });
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM experiences WHERE user_id = ?", [req.params.id]);
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      await conn.query(
        "INSERT INTO experiences (id, user_id, title, company, period, location, description, sort_order) VALUES (?,?,?,?,?,?,?,?)",
        [newId("exp"), req.params.id, x.title || "", x.company || "", x.period || "", x.location || "", x.desc || "", i]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to save experience." });
  } finally {
    conn.release();
  }
});

router.put("/:id/education", authRequired, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ error: "Forbidden." });
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM education WHERE user_id = ?", [req.params.id]);
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      await conn.query(
        "INSERT INTO education (id, user_id, degree, school, period, sort_order) VALUES (?,?,?,?,?,?)",
        [newId("edu"), req.params.id, x.degree || "", x.school || "", x.period || "", i]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to save education." });
  } finally {
    conn.release();
  }
});

/* ---- Connections ---- */
router.get("/:id/connections", authRequired, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_a, user_b FROM connections WHERE user_a = ? OR user_b = ?",
    [req.params.id, req.params.id]
  );
  const ids = rows.map(r => (r.user_a === req.params.id ? r.user_b : r.user_a));
  res.json({ ids });
});

router.post("/:id/connect", authRequired, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ error: "Forbidden." });
  const { targetId } = req.body;
  if (!targetId || targetId === req.params.id) return res.status(400).json({ error: "Invalid target user." });

  if (req.userRole === "student") {
    const [targetRows] = await pool.query("SELECT privacy, role FROM users WHERE id = ?", [targetId]);
    const target = targetRows[0];
    if (!target || target.role !== "alumni" || !parseJsonSafe(target.privacy, {}).allowStudentMessages) {
      return res.status(403).json({ error: "This alum hasn't opted in to messages from current students." });
    }
  }

  const [a, b] = [req.params.id, targetId].sort();
  await pool.query(
    "INSERT IGNORE INTO connections (id, user_a, user_b) VALUES (?, ?, ?)",
    [newId("conn"), a, b]
  );
  req.app.get("io").to(`user:${targetId}`).emit("connection:new", { fromUserId: req.params.id });
  res.json({ ok: true });
});

module.exports = router;
