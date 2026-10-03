const express = require("express");
const pool = require("../db");
const { serializeUserSummary } = require("../utils");
const { authOptional } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/search?q= — the one endpoint behind the site-wide search box.
 *
 * Deliberately tiered rather than one flat index, because the two callers are
 * not equally trusted:
 *
 *   anonymous visitor -> public pages + published alumni stories only
 *   signed-in member  -> the above, plus alumni / events / jobs
 *
 * The alumni tier reuses the same guards as GET /users/directory (the
 * per-user "show me in directory" toggle, the deactivated flag, and the
 * admin-configured student restriction), so search cannot be used as a side
 * door into the directory. Jobs are filtered to approved listings for the
 * same reason the jobs board is.
 *
 * LIKE with a leading wildcard will not scale to a large table, but at this
 * size it is the honest trade: a FULLTEXT index per table buys nothing until
 * the tables are much bigger, and it would not match mid-word.
 */

// Static destinations. Kept here rather than on the client so one list feeds
// both the search box and any future sitemap generation.
const PAGES = [
  { title: "Home", path: "/", blurb: "The Quad, the alumni network of Assam down town University.", public: true },
  { title: "Alumni Directory", path: "/directory", blurb: "Search graduates by batch, department, city, or company." },
  { title: "Events", path: "/events", blurb: "Reunions, department meetups, and city chapter dinners." },
  { title: "Jobs Board", path: "/jobs", blurb: "Roles posted by alumni who are hiring." },
  { title: "Alumni Stories", path: "/stories", blurb: "What graduates did next, in their own words.", public: true },
  { title: "About and Contact", path: "/contact", blurb: "Reach the Alumni Relations Office.", public: true },
  { title: "Frequently Asked Questions", path: "/faq", blurb: "Accounts, verification, privacy, and the jobs board.", public: true },
  { title: "Privacy Policy", path: "/privacy", blurb: "What data The Quad collects and why.", public: true },
  { title: "Terms and Conditions", path: "/terms", blurb: "The rules for using The Quad.", public: true },
  { title: "Dashboard", path: "/dashboard", blurb: "Your feed, your messages, and what is coming up." },
  { title: "Your Profile", path: "/profile", blurb: "How the rest of the network sees you." },
  { title: "Settings", path: "/settings", blurb: "Edit your profile, privacy, and notifications." }
];

router.get("/", authOptional, async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ query: q, results: [] });

  const like = `%${q}%`;
  const lower = q.toLowerCase();
  const signedIn = !!req.userId;
  const results = [];

  for (const page of PAGES) {
    if (!page.public && !signedIn) continue;
    if (
      page.title.toLowerCase().includes(lower) ||
      page.blurb.toLowerCase().includes(lower)
    ) {
      results.push({ kind: "page", title: page.title, subtitle: page.blurb, path: page.path });
    }
  }

  const [stories] = await pool.query(
    `SELECT slug, title, summary, subject_name FROM stories
     WHERE published = 1 AND (title LIKE ? OR summary LIKE ? OR body LIKE ? OR subject_name LIKE ?)
     ORDER BY published_at DESC LIMIT 6`,
    [like, like, like, like]
  );
  for (const s of stories) {
    results.push({
      kind: "story",
      title: s.title,
      subtitle: s.subject_name ? `${s.subject_name}. ${s.summary}` : s.summary,
      path: `/stories/${s.slug}`
    });
  }

  if (signedIn) {
    let studentsBlocked = false;
    if (req.userRole === "student") {
      const [settingsRows] = await pool.query("SELECT allow_student_directory_view FROM settings WHERE id = 1");
      studentsBlocked = !!(settingsRows[0] && !settingsRows[0].allow_student_directory_view);
    }

    if (!studentsBlocked) {
      const [people] = await pool.query(
        `SELECT * FROM users
         WHERE role = 'alumni' AND deactivated = 0
           AND (full_name LIKE ? OR company LIKE ? OR job_title LIKE ?
                OR department LIKE ? OR location LIKE ? OR headline LIKE ?)
         LIMIT 20`,
        [like, like, like, like, like, like]
      );
      for (const row of people) {
        const u = serializeUserSummary(row);
        if (!u.showInDirectory) continue;
        results.push({
          kind: "person",
          title: u.fullName,
          subtitle: [u.jobTitle, u.company && `at ${u.company}`, u.gradYear && `Class of ${u.gradYear}`]
            .filter(Boolean).join(" "),
          path: `/profile/${u.id}`
        });
        if (results.filter(r => r.kind === "person").length >= 6) break;
      }
    }

    const [events] = await pool.query(
      `SELECT id, title, location, date FROM events
       WHERE title LIKE ? OR description LIKE ? OR location LIKE ? OR cohort LIKE ?
       ORDER BY date DESC LIMIT 5`,
      [like, like, like, like]
    );
    for (const e of events) {
      results.push({
        kind: "event",
        title: e.title,
        subtitle: [e.date, e.location].filter(Boolean).join(" · "),
        path: `/events/${e.id}`
      });
    }

    const [jobs] = await pool.query(
      `SELECT id, title, company, location FROM jobs
       WHERE status = 'approved'
         AND (title LIKE ? OR company LIKE ? OR location LIKE ? OR description LIKE ?)
       ORDER BY posted_at DESC LIMIT 5`,
      [like, like, like, like]
    );
    for (const j of jobs) {
      results.push({
        kind: "job",
        title: j.title,
        subtitle: [j.company, j.location].filter(Boolean).join(" · "),
        path: "/jobs"
      });
    }
  }

  res.json({ query: q, results: results.slice(0, 24) });
});

module.exports = router;
