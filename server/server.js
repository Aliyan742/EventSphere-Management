const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

// Live Online Presence Tracking (userId -> Set of socketIds)
const onlineUsers = new Map();
const broadcastOnlineUsers = () => {
  io.emit("online_users", Array.from(onlineUsers.keys()));
};

io.on("connection", (socket) => {
  socket.on("join_user_room", (userId) => {
    if (!userId) return;
    const uid = String(userId);
    socket.userId = uid;
    socket.join(uid);

    if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
    onlineUsers.get(uid).add(socket.id);
    broadcastOnlineUsers();
  });

  socket.on("disconnect", () => {
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const sockets = onlineUsers.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId);
      }
      broadcastOnlineUsers();
    }
  });
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventSphere API Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expos", require("./routes/expoRoutes"));
app.use("/api/booths", require("./routes/boothRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/system", require("./routes/systemRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server + Socket.io running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
