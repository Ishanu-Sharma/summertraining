const express = require("express");
const pool = require("../db");
const { newId, serializePost } = require("../utils");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

async function attachExtras(post) {
  const [likes] = await pool.query("SELECT user_id FROM post_likes WHERE post_id = ?", [post.id]);
  const [replies] = await pool.query("SELECT * FROM post_replies WHERE post_id = ? ORDER BY created_at ASC", [post.id]);
  post.likedBy = likes.map(l => l.user_id);
  post.replies = replies.map(r => ({ id: r.id, userId: r.user_id, text: r.text, createdAt: r.created_at }));
  return post;
}

router.get("/", authRequired, async (req, res) => {
  const authorId = req.query.authorId;
  const [rows] = authorId
    ? await pool.query("SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC", [authorId])
    : await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
  const posts = await Promise.all(rows.map(r => attachExtras(serializePost(r))));
  res.json({ posts });
});

router.post("/", authRequired, async (req, res) => {
  const { text, tag } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Write something before posting." });
  const id = newId("p");
  await pool.query("INSERT INTO posts (id, author_id, text, tag) VALUES (?,?,?,?)", [id, req.userId, text.trim(), tag || ""]);
  const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);
  const post = await attachExtras(serializePost(rows[0]));
  req.app.get("io").emit("post:new", post);
  res.status(201).json({ post });
});

router.post("/:id/like", authRequired, async (req, res) => {
  const [existing] = await pool.query("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?", [req.params.id, req.userId]);
  let liked;
  if (existing.length) {
    await pool.query("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", [req.params.id, req.userId]);
    liked = false;
  } else {
    await pool.query("INSERT INTO post_likes (id, post_id, user_id) VALUES (?,?,?)", [newId("lk"), req.params.id, req.userId]);
    liked = true;
  }
  const [countRows] = await pool.query("SELECT COUNT(*) AS c FROM post_likes WHERE post_id = ?", [req.params.id]);
  const count = countRows[0].c;
  req.app.get("io").emit("post:like", { postId: req.params.id, userId: req.userId, liked, count });
  res.json({ liked, count });
});

router.post("/:id/replies", authRequired, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Reply can't be empty." });
  const id = newId("rp");
  await pool.query("INSERT INTO post_replies (id, post_id, user_id, text) VALUES (?,?,?,?)", [id, req.params.id, req.userId, text.trim()]);
  const [rows] = await pool.query("SELECT * FROM post_replies WHERE id = ?", [id]);
  const reply = { id: rows[0].id, userId: rows[0].user_id, text: rows[0].text, createdAt: rows[0].created_at };
  req.app.get("io").emit("post:reply", { postId: req.params.id, reply });
  res.status(201).json({ reply });
});

module.exports = router;
