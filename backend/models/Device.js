import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    // ---------- BASIC IDENTIFIERS ----------
    imei: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // super fast lookups
    },

    name: { type: String, trim: true },
    location: { type: String, trim: true },
    poleId: { type: String, trim: true },
    simNumber: { type: String, trim: true },
    installer: { type: String, trim: true },

    // ---------- USER ASSIGNMENT ----------
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ---------- PROJECT ID (Matches Quectel vProjectID) ----------
    projectId: {
      type: Number,
      default: null,
      index: true,
    },

    // ---------- DEVICE STATUS ----------
    isOnline: {
      type: Boolean,
      default: false, // updated every ping
    },

    lastPingAt: {
      type: Date,
      default: null, // updated every /p/ hit
      index: true,
    },

    // ---------- QUICK CACHE OF LAST TELEMETRY ----------
    lastTelemetry: {
      battVoltage: Number,
      solarVoltage: Number,
      loadVoltage: Number,
      battPercent: Number,
      solarCurrent: Number,
      loadCurrent: Number,
      batteryPower: Number,
      solarPower: Number,
      loadPower: Number,
      updatedAt: Date,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
