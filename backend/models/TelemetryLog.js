import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
  imei: { type: String, required: true },

  // -------- Battery Metrics --------
  battPercent: Number,
  battVoltage: Number,
  battCurrent: Number,
  battPower: Number,

  // -------- Solar Metrics --------
  solarVoltage: Number,
  solarCurrent: Number,
  solarPower: Number,

  // -------- Load Metrics --------
  loadVoltage: Number,
  loadCurrent: Number,
  loadPower: Number,

  // -------- Flags & Status --------
  statusByte: String,
  changeFlag: String,
  packetType: Number,

  // -------- Runtime Metrics --------
  fullMin: Number,
  dimMin: Number,
  totalHours: Number,

  // -------- Energy Metrics --------
  kwh: String,
  tkwh: String,

  // -------- Project --------
  projectId: Number,

  // Raw packet for debugging
  rawPayload: Object,

  timestamp: { type: Date, default: Date.now },
});

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
