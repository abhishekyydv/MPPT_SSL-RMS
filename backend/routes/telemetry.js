import express from "express";
import Device from "../models/Device.js";
import Telemetry from "../models/TelemetryLog.js";
import { protect, onlyMaster } from "../middleware/auth.js";
import ExcelJS from "exceljs";

const router = express.Router();

/*
=====================================
   RECEIVE TELEMETRY (PUBLIC)
   (Quectel M65 module sends data)
=====================================
*/
router.post("/", async (req, res) => {
  try {
    const { imei, battery, solar, load, current, eff } = req.body;

    if (!imei)
      return res.status(400).json({ msg: "IMEI required" });

    const device = await Device.findOne({ imei });
    if (!device)
      return res.status(404).json({ msg: "Device not registered" });

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

    // push live data to dashboard
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
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
=====================================
   GET LATEST DATA OF ALL DEVICES
=====================================
*/
router.get("/latest", protect, async (req, res) => {
  try {
    let deviceFilter = {};

    // USER: only devices assigned to him
    if (req.user.role === "user") {
      deviceFilter = { assignedTo: req.user.id };
    }

    // Find IMEIs of allowed devices
    const allowedDevices = await Device.find(deviceFilter).select("imei -_id");

    const imeis = allowedDevices.map((d) => d.imei);

    const logs = await Telemetry.aggregate([
      { $match: { imei: { $in: imeis } } },
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
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
=====================================
    GET ALL LOGS OF ONE DEVICE
=====================================
*/
router.get("/logs/:imei", protect, async (req, res) => {
  try {
    const { imei } = req.params;

    // check permissions
    const device = await Device.findOne({ imei });

    if (!device) return res.status(404).json({ msg: "Device not found" });

    if (req.user.role === "user" && device.assignedTo != req.user.id)
      return res.status(403).json({ msg: "Not your device" });

    const logs = await Telemetry.find({ imei }).sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
=====================================
   DOWNLOAD LOGS AS EXCEL (MASTER ONLY)
=====================================
*/
router.get("/download/:imei", protect, onlyMaster, async (req, res) => {
  try {
    const { imei } = req.params;

    const logs = await Telemetry.find({ imei }).sort({ timestamp: 1 });

    if (logs.length === 0)
      return res.status(404).json({ msg: "No logs found" });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Telemetry Logs");

    sheet.columns = [
      { header: "Timestamp", key: "timestamp", width: 25 },
      { header: "Battery Voltage", key: "batteryVoltage", width: 20 },
      { header: "Solar Voltage", key: "solarVoltage", width: 20 },
      { header: "Load Voltage", key: "loadVoltage", width: 20 },
      { header: "Current", key: "current", width: 15 },
      { header: "Efficiency", key: "efficiency", width: 15 },
      { header: "IMEI", key: "imei", width: 20 },
    ];

    logs.forEach((log) => {
      sheet.addRow({
        timestamp: log.timestamp,
        batteryVoltage: log.batteryVoltage,
        solarVoltage: log.solarVoltage,
        loadVoltage: log.loadVoltage,
        current: log.current,
        efficiency: log.efficiency,
        imei: log.imei,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=telemetry_${imei}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
