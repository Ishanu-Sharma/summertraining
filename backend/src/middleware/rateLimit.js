const rateLimit = require("express-rate-limit");

/** Login: generous enough for typos, tight enough to blunt brute-force/credential-stuffing. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." }
});

/** Registration: prevents scripted mass account creation. */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many accounts created from this connection. Please try again later." }
});

/** Password reset requests: prevents email-bombing a target address. */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many password reset requests. Please try again later." }
});

/** Public contact form: no auth, so this is the only thing stopping spam floods. */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." }
});

module.exports = { loginLimiter, registerLimiter, passwordResetLimiter, contactLimiter };
