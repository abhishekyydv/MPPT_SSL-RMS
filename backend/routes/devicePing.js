import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

// ---- Server Response Values (required by Quectel) ----
const FW_VERSION = "1007";       // your firmware version
const FW_CHECKSUM = "08";        // sum of digits in version
const UPDATE_RATE = "010";       // minutes/seconds as needed
const UPDATE_CHECKSUM = "01";    // sum of digits in update rate

// ---- Safe number parser ----
function safeNum(v) {
  if (v === undefined || v === null) return null;
  const n = parseFloat(String(v).trim());
  return isNaN(n) ? null : n;
}

// ------------------------------------------------------------------
// 🔥 Ultra-short data capture route for Quectel
// Example:
//    /p/861268072771174,00,012.3,000.4,001.2,013.4,001.2,020.2, ...
// ------------------------------------------------------------------
router.get("/:d", async (req, res) => {
  try {
    const raw = req.params.d;
    const parts = raw.split(",").map(x => x.trim());

    if (parts.length < 5) return res.send("ERR1");

    // IMEI
    const imei = parts[0];
    if (!imei || imei.length < 10) return res.send("ERR2");

    // Device registered check
    const device = await Device.findOne({ imei });
    if (!device) return res.send("ERR3");

    // ----------- Quectel FIELD MAPPING -------------------
    // Index reference based on your Quectel HTTP_Create_String()

    const battPercent     = safeNum(parts[1]);
    const battVoltage     = safeNum(parts[2]);
    const battCurrent     = safeNum(parts[3]);
    const battPower       = safeNum(parts[4]);

    const solarVoltage    = safeNum(parts[5]);
    const solarCurrent    = safeNum(parts[6]);
    const solarPower      = safeNum(parts[7]);

    const loadVoltage     = safeNum(parts[8]);
    const loadCurrent     = safeNum(parts[9]);
    const loadPower       = safeNum(parts[10]);

    const statusByte      = parts[11] ?? null;
    const changeFlag      = parts[12] ?? null;

    const packetType      = safeNum(parts[13]);
    const fullMin         = safeNum(parts[14]);
    const dimMin          = safeNum(parts[15]);
    const totalHours      = safeNum(parts[16]);

    const kwh             = parts[17];
    const tkwh            = parts[18];
    const projectId       = safeNum(parts[19]);
    // parts[20] = trailing "0" (ignored)

    // -----------------------------------------------------

    // Save telemetry
    const log = new Telemetry({
      imei,
      deviceId: device._id,

      battPercent,
      battVoltage,
      battCurrent,
      battPower,

      solarVoltage,
      solarCurrent,
      solarPower,

      loadVoltage,
      loadCurrent,
      loadPower,

      statusByte,
      changeFlag,

      packetType,
      fullMin,
      dimMin,
      totalHours,

      kwh,
      tkwh,
      projectId,

      rawPayload: parts,
    });

    await log.save();

    // Emit live data
    req.io.emit("telemetry:update", {
      imei,
      battPercent,
      battVoltage,
      battCurrent,
      battPower,

      solarVoltage,
      solarCurrent,
      solarPower,

      loadVoltage,
      loadCurrent,
      loadPower,

      time: new Date().toISOString(),
    });

    // ⭐ RETURN ACK EXACT FORMAT (VERIFIED BY QUECTEL CODE)
    return res.send(
      `PACK,${FW_VERSION},${FW_CHECKSUM},${UPDATE_RATE},${UPDATE_CHECKSUM}`
    );

  } catch (err) {
    console.error("Ping Error:", err);
    return res.send("ERRX");
  }
});

export default router;
