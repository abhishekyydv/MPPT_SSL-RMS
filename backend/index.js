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

import Telemetry from "./models/TelemetryLog.js";
import Device from "./models/Device.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const DB_URI = process.env.MONGODB_URI;

// Allowed frontend URLs
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

// Create HTTP + Socket.io
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

// attach socket.io to req
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Health route
app.get("/", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// ⭐ CONNECT TO MONGODB
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

// ⭐ ORIGINAL ROUTES
app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/telemetry", telemetryRouter);
app.use("/api/users", usersRouter);
app.use("/api/device-ping", devicePingRouter);

// ⭐⭐⭐ SUPER-SHORT URL ENDPOINT FOR QUECTEL (NO CODE CHANGE REQUIRED)
app.get("/p/:payload", async (req, res) => {
  try {
    const p = req.params.payload.trim();

    const parts = p.split(",");

    const imei = parts[0];

    if (!imei) return res.send("NO IMEI");

    // find device in DB
    const device = await Device.findOne({ imei });
    if (!device) return res.send("DEVICE NOT REGISTERED");

    // parse sensor values (these indexes match your Quectel packet)
    const battery = Number(parts[2]) || 0;
    const solar = Number(parts[3]) || 0;
    const load = Number(parts[4]) || 0;
    const current = Number(parts[5]) || 0;
    const efficiency = Number(parts[6]) || 0;

    // save telemetry
    await Telemetry.create({
      deviceId: device._id,
      imei,
      batteryVoltage: battery,
      solarVoltage: solar,
      loadVoltage: load,
      current,
      efficiency,
      rawPayload: parts,
    });

    // real-time update emit
    req.io.emit("telemetry:update", {
      imei,
      battery,
      solar,
      load,
      current,
      efficiency,
      time: new Date().toISOString(),
    });

    res.send("OK");
  } catch (err) {
    console.error("SHORT-URL ERROR:", err);
    res.send("ERR");
  }
});

// Socket events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
