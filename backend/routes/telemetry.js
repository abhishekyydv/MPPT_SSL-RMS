import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";

const router = express.Router();

// POST telemetry data (Quectel M65 will call this)
router.post("/", async (req, res) => {
  try {
    const { imei, battery, solar, load, current, eff } = req.body;

    if (!imei) return res.status(400).json({ msg: "IMEI required" });

    const device = await Device.findOne({ imei });
    if (!device) return res.status(404).json({ msg: "Device not registered" });

    const log = new Telemetry({
      deviceId: device._id,
      imei,
      batteryVoltage: battery,
      solarVoltage: solar,
      loadVoltage: load,
      current,
      efficiency: eff,
      rawPayload: req.body,
    });

    await log.save();

    req.io.emit("telemetry:update", {
      imei,
      battery,
      solar,
      load,
      current,
      eff,
      time: new Date().toISOString(),
    });

    res.json({ msg: "Telemetry saved" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
});

// ⭐⭐ NEW: GET latest telemetry for ALL devices
router.get("/latest", async (req, res) => {
  try {
    const logs = await Telemetry.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$imei",
          imei: { $first: "$imei" },

          battery: { $first: "$batteryVoltage" },
          solar: { $first: "$solarVoltage" },
          load: { $first: "$loadVoltage" },
          current: { $first: "$current" },
          efficiency: { $first: "$efficiency" },

          timestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { imei: 1 } },
    ]);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
