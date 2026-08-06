const express = require("express");
const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

function serializeSettings(row) {
  return {
    platformName: row.platform_name,
    supportEmail: row.support_email,
    requireUniversityEmail: !!row.require_university_email,
    autoApproveJobs: !!row.auto_approve_jobs,
    allowStudentDirectoryView: !!row.allow_student_directory_view
  };
}

router.get("/", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
  res.json({ settings: serializeSettings(rows[0]) });
});

router.patch("/", authRequired, adminRequired, async (req, res) => {
  const { platformName, supportEmail, requireUniversityEmail, autoApproveJobs, allowStudentDirectoryView } = req.body;
  await pool.query(
    `UPDATE settings SET
       platform_name = COALESCE(?, platform_name),
       support_email = COALESCE(?, support_email),
       require_university_email = COALESCE(?, require_university_email),
       auto_approve_jobs = COALESCE(?, auto_approve_jobs),
       allow_student_directory_view = COALESCE(?, allow_student_directory_view)
     WHERE id = 1`,
    [
      platformName ?? null, supportEmail ?? null,
      requireUniversityEmail == null ? null : (requireUniversityEmail ? 1 : 0),
      autoApproveJobs == null ? null : (autoApproveJobs ? 1 : 0),
      allowStudentDirectoryView == null ? null : (allowStudentDirectoryView ? 1 : 0)
    ]
  );
  const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
  const settings = serializeSettings(rows[0]);
  req.app.get("io").emit("settings:updated", settings);
  res.json({ settings });
});

module.exports = router;
