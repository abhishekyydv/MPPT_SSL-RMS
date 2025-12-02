import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

/**
 * Device GET Handler
 * Example URL received from Quectel:
 * /api/device-ping/<IMEI>70,01.3,00.02,002.0,01.4,...
 *
 * We decode it like this:
 * - IMEI = first 15 digits
 * - data = rest CSV fields
 */
router.get("/:packet", async (req, res) => {
  try {
    const raw = req.params.packet;

    // IMEI always 15 digits
    const imei = raw.substring(0, 15);

    // Remaining CSV data
    const csv = raw.substring(15);
    const fields = csv.split(",");

    // Map the first few fields (assuming format)
    const battery = parseFloat(fields[1]);
    const solar = parseFloat(fields[3]);
    const load = parseFloat(fields[5]);
    const current = parseFloat(fields[7]);
    const efficiency = parseFloat(fields[9]);

    const device = await Device.findOne({ imei });
    if (!device) {
      return res.status(404).json({ msg: "Device not registered", imei });
    }

    const log = new Telemetry({
      deviceId: device._id,
      imei,
      batteryVoltage: battery,
      solarVoltage: solar,
      loadVoltage: load,
      current,
      efficiency,
      rawPayload: { imei, csv },
    });

    await log.save();

    // Emit to dashboard live
    req.io.emit("telemetry:update", {
      imei,
      battery,
      solar,
      load,
      current,
      efficiency,
      time: new Date().toISOString(),
    });

    return res.json({ msg: "OK", imei, battery, solar, load, current, efficiency });
  } catch (err) {
    console.error("DevicePing error:", err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
