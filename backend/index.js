import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

// ---- Server Response Values (Required by Quectel) ----
const FW_VERSION = "1007";
const FW_CHECKSUM = "08";
const UPDATE_RATE = "010";     // seconds or minutes – as per your system
const UPDATE_CHECKSUM = "01";

// ---- Safe number parser ----
function safeNum(v) {
  if (!v) return null;
  const n = parseFloat(v.trim());
  return isNaN(n) ? null : n;
}

// ---- ULTRA SHORT ROUTE ----
//  Example packet:
//  /p/861268072771174,00,00.0,00.00,000.0,00.0,00.00,000.0
router.get("/:d", async (req, res) => {
  try {
    const raw = req.params.d;  // complete CSV string

    const parts = raw.split(",").map(p => p.trim());
    if (parts.length < 3) return res.send("ERR1");  // not enough parts

    const imei = parts[0];
    if (!imei || imei.length < 10) return res.send("ERR2");

    const device = await Device.findOne({ imei });
    if (!device) return res.send("ERR3");

    // Map the data based on fixed Quectel order
    const batteryVoltage = safeNum(parts[2]);
    const solarVoltage   = safeNum(parts[3]);
    const loadVoltage    = safeNum(parts[4]);
    const current        = safeNum(parts[5]);
    const efficiency     = safeNum(parts[6]);

    const temperature = safeNum(parts[17]);
    const humidity    = safeNum(parts[18]);
    const lux         = safeNum(parts[19]);

    const log = new Telemetry({
      deviceId: device._id,
      imei,
      batteryVoltage,
      solarVoltage,
      loadVoltage,
      current,
      efficiency,
      temperature,
      humidity,
      lux,
      rawPayload: parts
    });

    await log.save();

    // Emit live socket update for dashboard
    req.io.emit("telemetry:update", {
      imei,
      batteryVoltage,
      solarVoltage,
      loadVoltage,
      current,
      efficiency,
      temperature,
      humidity,
      lux,
      time: new Date().toISOString()
    });

    // ⭐ MUST SEND TEXT RESPONSE THAT QUECTEL EXPECTS
    return res.send(`PACK,${FW_VERSION},${FW_CHECKSUM},${UPDATE_RATE},${UPDATE_CHECKSUM}`);

  } catch (err) {
    console.error("Ping error:", err);
    return res.send("ERRX");
  }
});

export default router;
