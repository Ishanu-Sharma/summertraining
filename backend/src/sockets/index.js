const jwt = require("jsonwebtoken");

function initSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Not authenticated"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.userRole === "admin") socket.join("admins");

    socket.on("disconnect", () => {
      // no-op; room membership cleans up automatically
    });
  });
}

module.exports = initSockets;
