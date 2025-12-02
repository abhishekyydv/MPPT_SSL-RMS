import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

function safeNum(v) {
  if (v === undefined || v === null) return null;
  const n = parseFloat(String(v).trim());
  return isNaN(n) ? null : n;
}

router.get("/:payload", async (req, res) => {
  try {
    const raw = req.params.payload;

    // Split CSV properly
    const parts = raw.split(",").map(p => p.trim());

    // First part is IMEI
    const imei = parts[0];

    if (!imei || imei.length < 10) {
      return res.status(400).json({ msg: "Invalid IMEI", imei });
    }

    // Ensure device exists
    const device = await Device.findOne({ imei });
    if (!device) {
      return res.status(404).json({ msg: "Device not registered", imei });
    }

    // Extract known telemetry fields
    const battery     = safeNum(parts[2]);  // Battery voltage
    const solar       = safeNum(parts[3]);  // Solar voltage
    const load        = safeNum(parts[4]);  // Load voltage
    const current     = safeNum(parts[5]);  // Current
    const efficiency  = safeNum(parts[6]);  // Efficiency
    const temperature = safeNum(parts[17]); // temperature (maybe)
    const humidity    = safeNum(parts[18]); // humidity (maybe)
    const lux         = safeNum(parts[19]); // lux/raw adc

    // Save to database
    const log = new Telemetry({
      deviceId: device._id,
      imei,
      batteryVoltage: battery,
      solarVoltage: solar,
      loadVoltage: load,
      current,
      efficiency,
      temperature,
      humidity,
      lux,
      rawPayload: parts,
    });

    await log.save();

    // Emit live update
    req.io.emit("telemetry:update", {
      imei,
      battery,
      solar,
      load,
      current,
      efficiency,
      temperature,
      humidity,
      lux,
      time: new Date().toISOString()
    });

    return res.json({
      msg: "OK",
      imei,
      battery,
      solar,
      load,
      current,
      efficiency,
      temperature,
      humidity,
      lux
    });

  } catch (err) {
    console.error("Telem parse error:", err);
    return res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
