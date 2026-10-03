const express = require("express");
const pool = require("../db");
const { newId, serializeStory, slugify } = require("../utils");
const { authRequired, authOptional, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * Alumni stories. Written by the Alumni Relations Office in the admin panel,
 * never seeded: the public list is empty until a real story is published, which
 * is deliberate. Drafts are visible to admins only.
 *
 * The list and detail routes use authOptional because they serve the public
 * marketing site, and the only thing the token changes is whether drafts are
 * included.
 */

const FIELDS = [
  "title", "subjectName", "subjectRole", "subjectUserId",
  "gradYear", "department", "summary", "body", "outcome"
];

const COLUMN = {
  title: "title",
  subjectName: "subject_name",
  subjectRole: "subject_role",
  subjectUserId: "subject_user_id",
  gradYear: "grad_year",
  department: "department",
  summary: "summary",
  body: "body",
  outcome: "outcome"
};

router.get("/", authOptional, async (req, res) => {
  const wantsDrafts = req.query.drafts === "1" && req.userRole === "admin";
  const [rows] = await pool.query(
    wantsDrafts
      ? "SELECT * FROM stories ORDER BY published DESC, COALESCE(published_at, created_at) DESC"
      : "SELECT * FROM stories WHERE published = 1 ORDER BY published_at DESC"
  );
  res.json({ stories: rows.map(serializeStory) });
});

router.get("/:slug", authOptional, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM stories WHERE slug = ?", [req.params.slug]);
  const story = rows[0];
  if (!story || (!story.published && req.userRole !== "admin")) {
    return res.status(404).json({ error: "Story not found." });
  }
  res.json({ story: serializeStory(story) });
});

router.post("/", authRequired, adminRequired, async (req, res) => {
  const { title, subjectName, summary, body } = req.body;
  if (!title || !subjectName || !summary || !body) {
    return res.status(400).json({ error: "Title, name, summary, and story body are all required." });
  }

  const id = newId("st");
  let slug = slugify(title, id.slice(3, 11));
  // Two stories about the same person in the same year would otherwise collide
  // on the UNIQUE index and return a 500.
  const [clash] = await pool.query("SELECT id FROM stories WHERE slug = ?", [slug]);
  if (clash.length) slug = `${slug}-${id.slice(3, 9)}`;

  const published = req.body.published ? 1 : 0;
  await pool.query(
    `INSERT INTO stories
       (id, slug, title, subject_name, subject_role, subject_user_id, grad_year,
        department, summary, body, outcome, published, published_at, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, slug, title, subjectName, req.body.subjectRole || null,
      req.body.subjectUserId || null, req.body.gradYear || null,
      req.body.department || null, summary, body, req.body.outcome || null,
      published, published ? new Date() : null, req.userId
    ]
  );
  const [rows] = await pool.query("SELECT * FROM stories WHERE id = ?", [id]);
  res.status(201).json({ story: serializeStory(rows[0]) });
});

router.patch("/:id", authRequired, adminRequired, async (req, res) => {
  const [existing] = await pool.query("SELECT * FROM stories WHERE id = ?", [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: "Story not found." });

  const sets = [];
  const values = [];
  for (const field of FIELDS) {
    if (field in req.body) {
      sets.push(`${COLUMN[field]} = ?`);
      values.push(req.body[field] === "" ? null : req.body[field]);
    }
  }

  // published_at is stamped the first time a story goes live and kept after
  // that, so an edit does not shuffle the story back to the top of the list.
  if ("published" in req.body) {
    const published = req.body.published ? 1 : 0;
    sets.push("published = ?");
    values.push(published);
    if (published && !existing[0].published_at) {
      sets.push("published_at = ?");
      values.push(new Date());
    }
  }

  if (!sets.length) return res.json({ story: serializeStory(existing[0]) });

  values.push(req.params.id);
  await pool.query(`UPDATE stories SET ${sets.join(", ")} WHERE id = ?`, values);
  const [rows] = await pool.query("SELECT * FROM stories WHERE id = ?", [req.params.id]);
  res.json({ story: serializeStory(rows[0]) });
});

router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  await pool.query("DELETE FROM stories WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
