// index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import devicesRouter from "./routes/devices.js";
import telemetryRouter from "./routes/telemetry.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const DB_URI = process.env.MONGODB_URI;

// ⭐ WHITELIST ALLOWED FRONTEND ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "https://mppt-ssl-rms-frontend.netlify.app"
];

// ⭐ GLOBAL CORS MIDDLEWARE
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ⭐ JSON BODY PARSER
app.use(express.json());

// ⭐ CREATE HTTP SERVER + SOCKET.IO
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// ⭐ Attach io to req for routes
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ⭐ Basic health route
app.get("/", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// ⭐ Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// ⭐ API ROUTES
app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/telemetry", telemetryRouter);
app.use("/api/users", usersRouter);

// ⭐ Socket Events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ⭐ Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
