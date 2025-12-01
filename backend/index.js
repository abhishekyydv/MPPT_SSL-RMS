// index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;
const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI; // support both names

// Middlewares
app.use(cors());
app.use(express.json()); // important to parse JSON bodies

// Create HTTP server + Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" }, // change origin in production
});

// Attach io to req so routes can emit: req.io.emit(...)
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Basic health route
app.get("/", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(DB_URI, {
      // recommended options are default in mongoose 6+, but you can add if needed
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// Routes (create these files next)
import authRouter from "./routes/auth.js";
import devicesRouter from "./routes/devices.js";
import telemetryRouter from "./routes/telemetry.js";

app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/telemetry", telemetryRouter);

// Socket events (basic)
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
