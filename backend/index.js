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
import devicePingRouter from "./routes/devicePing.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const DB_URI = process.env.MONGODB_URI;

const allowedOrigins = [
  "http://localhost:5173",
  "https://mppt-ssl-rms-frontend.netlify.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

// attach socket to every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Test route
app.get("/", (_req, res) => res.json({ ok: true }));

// Connect DB
mongoose.connect(DB_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.error(err));

// 🔥 ONLY THIS ROUTE WILL HANDLE QUECTEL HTTP PACKETS
app.use("/p", devicePingRouter);          // short URL version
app.use("/api/device-ping", devicePingRouter); // long URL version

// Other API routes
app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/telemetry", telemetryRouter);
app.use("/api/users", usersRouter);

// Socket events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
