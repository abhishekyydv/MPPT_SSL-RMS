import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", index: true },

    imei: { type: String, required: true, index: true },

    // -------- Battery Metrics --------
    battPercent: { type: Number, default: null },
    battVoltage: { type: Number, default: null },
    battCurrent: { type: Number, default: null },
    battPower: { type: Number, default: null },

    // -------- Solar Metrics --------
    solarVoltage: { type: Number, default: null },
    solarCurrent: { type: Number, default: null },
    solarPower: { type: Number, default: null },

    // -------- Load Metrics --------
    loadVoltage: { type: Number, default: null },
    loadCurrent: { type: Number, default: null },
    loadPower: { type: Number, default: null },

    // -------- Flags & Status --------
    statusByte: { type: String, default: null },
    changeFlag: { type: String, default: null },
    packetType: { type: Number, default: null },

    // -------- Runtime Metrics --------
    fullMin: { type: Number, default: null },
    dimMin: { type: Number, default: null },
    totalHours: { type: Number, default: null },

    // -------- Energy Metrics --------
    kwh: { type: String, default: null },
    tkwh: { type: String, default: null },

    // -------- Project --------
    projectId: { type: Number, default: null },

    // Original packet for debugging / future analytics
    rawPayload: { type: Array, default: [] },

    timestamp: { type: Date, default: Date.now, index: true }
  },

  // Mongoose options
  {
    versionKey: false
  }
);

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
