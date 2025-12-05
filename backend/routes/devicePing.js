import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

// ======================================================
// 🔥 Quectel Response Fields
// ======================================================
const FW_VERSION = "1007";
const FW_CHECKSUM = "08";
const UPDATE_RATE = "010";
const UPDATE_CHECKSUM = "01";

// Safe number parser
function safeNum(v) {
  if (v === undefined || v === null) return null;
  const n = parseFloat(String(v).trim());
  return isNaN(n) ? null : n;
}

// ======================================================
// Main handler for /p/:d and /api/device-ping/:d
// ======================================================
async function handlePacket(req, res) {
  try {
    const raw = req.params.d?.trim();
    if (!raw) return res.send("ERR0");

    const parts = raw.split(",").map((x) => x.trim());
    if (parts.length < 10) return res.send("ERR1");

    // ----------- IMEI -----------
    const imei = parts[0];
    if (!imei || imei.length < 10) return res.send("ERR2");

    // ----------- Device Exists? -----------
    const device = await Device.findOne({ imei });
    if (!device) return res.send("ERR3");

    // ======================================================
    // FIELD MAPPING BASED ON HTTP_Create_String() (Exact)
    // ======================================================
    const battPercent = safeNum(parts[1]);
    const battVoltage = safeNum(parts[2]);
    const battCurrent = safeNum(parts[3]);
    const battPower = safeNum(parts[4]);

    const solarVoltage = safeNum(parts[5]);
    const solarCurrent = safeNum(parts[6]);
    const solarPower = safeNum(parts[7]);

    const loadVoltage = safeNum(parts[8]);
    const loadCurrent = safeNum(parts[9]);
    const loadPower = safeNum(parts[10]);

    const statusByte = parts[11] ?? null;
    const changeFlag = parts[12] ?? null;

    const packetType = safeNum(parts[13]);
    const fullMin = safeNum(parts[14]);
    const dimMin = safeNum(parts[15]);
    const totalHours = safeNum(parts[16]);

    const kwh = parts[17];
    const tkwh = parts[18];
    const projectId = safeNum(parts[19]);

    // ======================================================
    // SAVE FULL TELEMETRY LOG
    // ======================================================
    await Telemetry.create({
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

    // ======================================================
    // UPDATE DEVICE STATUS + LAST TELEMETRY
    // ======================================================
    device.isOnline = true;
    device.lastPingAt = new Date();

    // Auto store projectId if newly received
    if (projectId && !device.projectId) device.projectId = projectId;

    device.lastTelemetry = {
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
      updatedAt: new Date(),
    };

    await device.save();

    // ======================================================
    // SEND LIVE SOCKET UPDATE TO DASHBOARD
    // ======================================================
    req.io.emit("telemetry:update", {
      imei,
      battPercent,
      battVoltage,
      solarVoltage,
      loadVoltage,
      loadCurrent,
      solarCurrent,
      battCurrent,
      time: new Date().toISOString(),
    });

    // ======================================================
    // SEND ACK THAT QUECTEL EXPECTS (VERY IMPORTANT)
    // ======================================================
    return res.send(
      `PACK,${FW_VERSION},${FW_CHECKSUM},${UPDATE_RATE},${UPDATE_CHECKSUM}`
    );

  } catch (err) {
    console.error("DEVICE-PING ERROR:", err);
    return res.send("ERRX");
  }
}

// ======================================================
// Short URL Handler (for Quectel 50-char URL limit)
// ======================================================
router.get("/:d", handlePacket);

export default router;
