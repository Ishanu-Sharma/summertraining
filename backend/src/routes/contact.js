const express = require("express");
const { contactLimiter } = require("../middleware/rateLimit");
const router = express.Router();

/** No auth required — public contact form. Logged server-side; wire up email later if desired. */
router.post("/", contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  // `source` carries the campaign attribution the client captured from the
  // landing URL's utm_* params. Truncated and treated as untrusted free text:
  // it comes straight off a query string, and it only ever reaches a log line.
  const source = typeof req.body.source === "string" ? req.body.source.slice(0, 300) : null;
  console.log("[Contact form submission]", {
    name, email, subject, message, source, at: new Date().toISOString()
  });
  res.status(201).json({ ok: true });
});

module.exports = router;
