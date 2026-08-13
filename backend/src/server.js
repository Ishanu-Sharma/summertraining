require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const jobRoutes = require("./routes/jobs");
const postRoutes = require("./routes/posts");
const conversationRoutes = require("./routes/conversations");
const settingsRoutes = require("./routes/settings");
const contactRoutes = require("./routes/contact");
const initSockets = require("./sockets");

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || "*";
const io = new Server(server, {
  cors: { origin: clientOrigin, credentials: true }
});
app.set("io", io);

// This is a JSON API (not an HTML-rendering server) whose only static assets are
// avatar images served to a *different* origin (the frontend). Helmet's default
// Content-Security-Policy is meant for HTML documents and its default
// Cross-Origin-Resource-Policy ("same-origin") would silently block the frontend
// from loading /uploads/avatars/* images, so both are adjusted accordingly.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "the-quad-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

initSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`The Quad API listening on port ${PORT}`);
});
