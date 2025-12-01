import express from "express";
import Device from "../models/Device.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { imei, name, location } = req.body;

    if (!imei) return res.status(400).json({ msg: "IMEI required" });

    const exists = await Device.findOne({ imei });
    if (exists) return res.status(400).json({ msg: "IMEI already exists" });

    const device = new Device({ imei, name, location });
    await device.save();

    res.json({ msg: "Device Added", device });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
});

router.get("/", async (req, res) => {
  const devices = await Device.find().sort({ createdAt: -1 });
  res.json(devices);
});

export default router;
