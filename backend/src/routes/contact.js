const express = require("express");
const router = express.Router();

/** No auth required — public contact form. Logged server-side; wire up email later if desired. */
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  console.log("[Contact form submission]", { name, email, subject, message, at: new Date().toISOString() });
  res.status(201).json({ ok: true });
});

module.exports = router;
