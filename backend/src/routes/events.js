const express = require("express");
const pool = require("../db");
const { newId, serializeEvent } = require("../utils");
const { authRequired, adminRequired } = require("../middleware/auth");
const { paginationParams, paginatedResponse } = require("../utils/pagination");

const router = express.Router();

async function attachExtras(event) {
  const [agenda] = await pool.query("SELECT * FROM event_agenda WHERE event_id = ? ORDER BY sort_order ASC", [event.id]);
  const [hosts] = await pool.query("SELECT * FROM event_hosts WHERE event_id = ?", [event.id]);
  const [rsvps] = await pool.query("SELECT user_id FROM event_rsvps WHERE event_id = ? AND status = 'going'", [event.id]);
  const [comments] = await pool.query(
    "SELECT * FROM event_comments WHERE event_id = ? ORDER BY created_at ASC", [event.id]
  );
  event.agenda = agenda.map(a => ({ time: a.time, title: a.title, note: a.note }));
  event.hosts = hosts.map(h => ({ userId: h.user_id, label: h.label }));
  event.attendeeIds = rsvps.map(r => r.user_id);
  event.comments = comments.map(c => ({ id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at }));
  return event;
}

/**
 * Batched version of attachExtras for a whole page of events at once —
 * 4 queries total instead of 4 queries PER event (previously N+1: a
 * 20-event page fired 80+ round trips to the database).
 */
async function attachExtrasBatch(events) {
  if (!events.length) return events;
  const ids = events.map(e => e.id);
  const placeholders = ids.map(() => "?").join(",");

  const [agendaRows] = await pool.query(
    `SELECT * FROM event_agenda WHERE event_id IN (${placeholders}) ORDER BY sort_order ASC`, ids
  );
  const [hostRows] = await pool.query(`SELECT * FROM event_hosts WHERE event_id IN (${placeholders})`, ids);
  const [rsvpRows] = await pool.query(
    `SELECT event_id, user_id FROM event_rsvps WHERE event_id IN (${placeholders}) AND status = 'going'`, ids
  );
  const [commentRows] = await pool.query(
    `SELECT * FROM event_comments WHERE event_id IN (${placeholders}) ORDER BY created_at ASC`, ids
  );

  const by = (rows, key) => rows.reduce((acc, r) => { (acc[r[key]] ||= []).push(r); return acc; }, {});
  const agendaByEvent = by(agendaRows, "event_id");
  const hostsByEvent = by(hostRows, "event_id");
  const rsvpsByEvent = by(rsvpRows, "event_id");
  const commentsByEvent = by(commentRows, "event_id");

  for (const event of events) {
    event.agenda = (agendaByEvent[event.id] || []).map(a => ({ time: a.time, title: a.title, note: a.note }));
    event.hosts = (hostsByEvent[event.id] || []).map(h => ({ userId: h.user_id, label: h.label }));
    event.attendeeIds = (rsvpsByEvent[event.id] || []).map(r => r.user_id);
    event.comments = (commentsByEvent[event.id] || []).map(c => ({ id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at }));
  }
  return events;
}

router.get("/", authRequired, async (req, res) => {
  // Same reasoning as jobs.js: the frontend currently splits one fetched
  // list into Upcoming/Past/My RSVPs tabs client-side, so this defaults
  // generously rather than tightly paginating. Events realistically grow
  // far slower than posts/jobs, so this ceiling is unlikely to bind.
  const { limit, offset, page } = paginationParams(req.query, { defaultLimit: 100, maxLimit: 200 });
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM events");
  const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC LIMIT ? OFFSET ?", [limit, offset]);
  const events = await attachExtrasBatch(rows.map(serializeEvent));
  res.json(paginatedResponse("events", events, { total, page, limit }));
});

router.get("/:id", authRequired, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Event not found." });
  const event = await attachExtras(serializeEvent(rows[0]));
  res.json({ event });
});

router.post("/", authRequired, adminRequired, async (req, res) => {
  const { title, description, date, time, location, type, cohort, featured, agenda, hosts } = req.body;
  if (!title || !date) return res.status(400).json({ error: "Title and date are required." });
  const id = newId("e");
  await pool.query(
    `INSERT INTO events (id, title, description, date, time, location, type, cohort, featured, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, title, description || "", date, time || "", location || "", type || "in-person", cohort || "", featured ? 1 : 0, req.userId]
  );
  if (Array.isArray(agenda)) {
    for (let i = 0; i < agenda.length; i++) {
      await pool.query("INSERT INTO event_agenda (id, event_id, time, title, note, sort_order) VALUES (?,?,?,?,?,?)",
        [newId("ag"), id, agenda[i].time || "", agenda[i].title || "", agenda[i].note || "", i]);
    }
  }
  if (Array.isArray(hosts)) {
    for (const h of hosts) {
      await pool.query("INSERT INTO event_hosts (id, event_id, user_id, label) VALUES (?,?,?,?)",
        [newId("host"), id, h.userId, h.label || ""]);
    }
  }
  const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);
  const event = await attachExtras(serializeEvent(rows[0]));
  req.app.get("io").emit("event:new", event);
  res.status(201).json({ event });
});

router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
  req.app.get("io").emit("event:deleted", { id: req.params.id });
  res.json({ ok: true });
});

/* ---- RSVP ---- */
router.get("/:id/rsvp/me", authRequired, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT status FROM event_rsvps WHERE event_id = ? AND user_id = ?",
    [req.params.id, req.userId]
  );
  res.json({ status: rows[0] ? rows[0].status : null });
});

router.post("/:id/rsvp", authRequired, async (req, res) => {
  const { status } = req.body;
  if (!["going", "interested", "not-going"].includes(status)) {
    return res.status(400).json({ error: "Invalid RSVP status." });
  }
  await pool.query(
    `INSERT INTO event_rsvps (id, event_id, user_id, status) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
    [newId("rsvp"), req.params.id, req.userId, status]
  );
  const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
  const event = await attachExtras(serializeEvent(rows[0]));
  req.app.get("io").emit("event:rsvp-updated", { eventId: req.params.id, attendeeIds: event.attendeeIds });
  res.json({ event });
});

/* ---- Comments ---- */
router.post("/:id/comments", authRequired, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Comment can't be empty." });
  const id = newId("cm");
  await pool.query(
    "INSERT INTO event_comments (id, event_id, user_id, text) VALUES (?,?,?,?)",
    [id, req.params.id, req.userId, text.trim()]
  );
  const [rows] = await pool.query("SELECT * FROM event_comments WHERE id = ?", [id]);
  const comment = { id: rows[0].id, userId: rows[0].user_id, text: rows[0].text, createdAt: rows[0].created_at };
  req.app.get("io").emit("event:comment-new", { eventId: req.params.id, comment });
  res.status(201).json({ comment });
});

module.exports = router;
