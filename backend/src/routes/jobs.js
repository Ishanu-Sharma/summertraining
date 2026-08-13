const express = require("express");
const pool = require("../db");
const { newId, serializeJob } = require("../utils");
const { authRequired, adminRequired } = require("../middleware/auth");
const { paginationParams, paginatedResponse } = require("../utils/pagination");

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  // The frontend's All/Saved/Applied tabs currently filter one fetched list
  // client-side, so the default page is generous (rather than a tight 20)
  // to avoid silently hiding a user's saved/applied jobs that fall outside
  // page 1. True infinite-scroll pagination (like the feed) is a natural
  // next step if the jobs board grows past a few hundred open listings —
  // the ?page/?limit params below already support it.
  const { limit, offset, page } = paginationParams(req.query, { defaultLimit: 100, maxLimit: 200 });
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM jobs");
  const [rows] = await pool.query("SELECT * FROM jobs ORDER BY posted_at DESC LIMIT ? OFFSET ?", [limit, offset]);
  res.json(paginatedResponse("jobs", rows.map(serializeJob), { total, page, limit }));
});

router.get("/:id", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Job not found." });
  res.json({ job: serializeJob(rows[0]) });
});

router.post("/", authRequired, async (req, res) => {
  if (req.userRole === "student") {
    return res.status(403).json({ error: "Only alumni and admins can post jobs." });
  }
  const { title, company, location, type, experience, salary, description, applyLink, referralNote } = req.body;
  if (!title || !company || !location || !type || !description || !applyLink) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  const [settingsRows] = await pool.query("SELECT auto_approve_jobs FROM settings WHERE id = 1");
  const autoApprove = settingsRows[0] && settingsRows[0].auto_approve_jobs;
  const status = autoApprove ? "approved" : "pending";

  const id = newId("j");
  await pool.query(
    `INSERT INTO jobs (id, title, company, location, type, experience, salary, description, apply_link, referral_note, posted_by, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, title, company, location, type, experience || "", salary || "", description, applyLink, referralNote || "", req.userId, status]
  );
  const [rows] = await pool.query("SELECT * FROM jobs WHERE id = ?", [id]);
  const job = serializeJob(rows[0]);

  const io = req.app.get("io");
  if (status === "approved") io.emit("job:new", job);
  io.to("admins").emit("admin:job-posted", job);

  res.status(201).json({ job });
});

router.patch("/:id/status", authRequired, adminRequired, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  await pool.query("UPDATE jobs SET status = ? WHERE id = ?", [status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
  const job = serializeJob(rows[0]);
  const io = req.app.get("io");
  if (status === "approved") io.emit("job:new", job);
  io.to(`user:${job.postedBy}`).emit("job:status-changed", job);
  res.json({ job });
});

router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  await pool.query("DELETE FROM jobs WHERE id = ?", [req.params.id]);
  req.app.get("io").emit("job:deleted", { id: req.params.id });
  res.json({ ok: true });
});

/* ---- Saved / Applied (per current user) ---- */
router.get("/me/saved", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT job_id FROM saved_jobs WHERE user_id = ?", [req.userId]);
  res.json({ jobIds: rows.map(r => r.job_id) });
});

router.post("/:id/save", authRequired, async (req, res) => {
  const [existing] = await pool.query("SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?", [req.userId, req.params.id]);
  if (existing.length) {
    await pool.query("DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?", [req.userId, req.params.id]);
    return res.json({ saved: false });
  }
  await pool.query("INSERT INTO saved_jobs (id, user_id, job_id) VALUES (?,?,?)", [newId("sv"), req.userId, req.params.id]);
  res.json({ saved: true });
});

router.get("/me/applied", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT job_id FROM applied_jobs WHERE user_id = ?", [req.userId]);
  res.json({ jobIds: rows.map(r => r.job_id) });
});

router.post("/:id/apply", authRequired, async (req, res) => {
  await pool.query("INSERT IGNORE INTO applied_jobs (id, user_id, job_id) VALUES (?,?,?)", [newId("ap"), req.userId, req.params.id]);
  const [jobRows] = await pool.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
  if (jobRows[0]) {
    req.app.get("io").to(`user:${jobRows[0].posted_by}`).emit("job:new-applicant", { jobId: req.params.id, applicantId: req.userId });
  }
  res.json({ ok: true });
});

module.exports = router;
