const express = require("express");
const pool = require("../db");
const { newId, parseJsonSafe } = require("../utils");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

async function serializeConversation(row, userId) {
  const [messages] = await pool.query(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", [row.id]
  );
  const [reads] = await pool.query(
    "SELECT user_id, last_read_at FROM conversation_reads WHERE conversation_id = ?", [row.id]
  );
  const lastReadAt = {};
  reads.forEach(r => { lastReadAt[r.user_id] = new Date(r.last_read_at).getTime(); });
  return {
    id: row.id,
    participantIds: [row.user_a, row.user_b],
    messages: messages.map(m => ({ id: m.id, senderId: m.sender_id, text: m.text, createdAt: m.created_at })),
    lastReadAt
  };
}

router.get("/", authRequired, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM conversations WHERE user_a = ? OR user_b = ?", [req.userId, req.userId]
  );
  const conversations = await Promise.all(rows.map(r => serializeConversation(r, req.userId)));
  conversations.sort((a, b) => {
    const at = a.messages.length ? new Date(a.messages[a.messages.length - 1].createdAt) : 0;
    const bt = b.messages.length ? new Date(b.messages[b.messages.length - 1].createdAt) : 0;
    return bt - at;
  });
  res.json({ conversations });
});

router.post("/with/:otherUserId", authRequired, async (req, res) => {
  const otherUserId = req.params.otherUserId;
  if (otherUserId === req.userId) return res.status(400).json({ error: "Can't message yourself." });

  if (req.userRole === "student") {
    const [targetRows] = await pool.query("SELECT privacy, role FROM users WHERE id = ?", [otherUserId]);
    const target = targetRows[0];
    if (!target || target.role !== "alumni" || !parseJsonSafe(target.privacy, {}).allowStudentMessages) {
      return res.status(403).json({ error: "This alum hasn't opted in to messages from current students." });
    }
  }

  const [a, b] = [req.userId, otherUserId].sort();

  let [rows] = await pool.query("SELECT * FROM conversations WHERE user_a = ? AND user_b = ?", [a, b]);
  if (!rows.length) {
    const id = newId("c");
    await pool.query("INSERT INTO conversations (id, user_a, user_b) VALUES (?,?,?)", [id, a, b]);
    [rows] = await pool.query("SELECT * FROM conversations WHERE id = ?", [id]);
  }
  const conversation = await serializeConversation(rows[0], req.userId);
  res.json({ conversation });
});

router.post("/:id/messages", authRequired, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Message can't be empty." });

  const [convRows] = await pool.query("SELECT * FROM conversations WHERE id = ?", [req.params.id]);
  const conv = convRows[0];
  if (!conv || (conv.user_a !== req.userId && conv.user_b !== req.userId)) {
    return res.status(403).json({ error: "Forbidden." });
  }

  const id = newId("msg");
  await pool.query("INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?,?,?,?)", [id, req.params.id, req.userId, text.trim()]);
  await pool.query(
    `INSERT INTO conversation_reads (conversation_id, user_id, last_read_at) VALUES (?,?,CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE last_read_at = CURRENT_TIMESTAMP`,
    [req.params.id, req.userId]
  );

  const [rows] = await pool.query("SELECT * FROM messages WHERE id = ?", [id]);
  const message = { id: rows[0].id, senderId: rows[0].sender_id, text: rows[0].text, createdAt: rows[0].created_at, conversationId: req.params.id };

  const otherId = conv.user_a === req.userId ? conv.user_b : conv.user_a;
  req.app.get("io").to(`user:${otherId}`).to(`user:${req.userId}`).emit("message:new", message);

  res.status(201).json({ message });
});

router.post("/:id/read", authRequired, async (req, res) => {
  const [convRows] = await pool.query("SELECT * FROM conversations WHERE id = ?", [req.params.id]);
  const conv = convRows[0];
  if (!conv || (conv.user_a !== req.userId && conv.user_b !== req.userId)) {
    return res.status(403).json({ error: "Forbidden." });
  }
  await pool.query(
    `INSERT INTO conversation_reads (conversation_id, user_id, last_read_at) VALUES (?,?,CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE last_read_at = CURRENT_TIMESTAMP`,
    [req.params.id, req.userId]
  );
  req.app.get("io").to(`user:${req.userId}`).emit("conversation:read", { conversationId: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

router.get("/unread-count", authRequired, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM conversations WHERE user_a = ? OR user_b = ?", [req.userId, req.userId]
  );
  let count = 0;
  for (const conv of rows) {
    const [readRows] = await pool.query(
      "SELECT last_read_at FROM conversation_reads WHERE conversation_id = ? AND user_id = ?", [conv.id, req.userId]
    );
    const lastRead = readRows[0] ? new Date(readRows[0].last_read_at).getTime() : 0;
    const [msgRows] = await pool.query(
      "SELECT COUNT(*) AS c FROM messages WHERE conversation_id = ? AND sender_id <> ? AND created_at > FROM_UNIXTIME(?)",
      [conv.id, req.userId, lastRead / 1000]
    );
    count += msgRows[0].c;
  }
  res.json({ count });
});

module.exports = router;
