import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
  imei: String,
  batteryVoltage: Number,
  solarVoltage: Number,
  loadVoltage: Number,
  current: Number,
  efficiency: Number,
  timestamp: { type: Date, default: Date.now },
  rawPayload: Object,
});

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
