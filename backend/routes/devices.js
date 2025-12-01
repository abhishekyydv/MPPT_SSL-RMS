import express from "express";
import Device from "../models/Device.js";
import User from "../models/User.js";
import { protect, onlyMaster } from "../middleware/auth.js";

const router = express.Router();

/*
===================================
   ADD NEW DEVICE  (MASTER ONLY)
===================================
*/
router.post("/", protect, onlyMaster, async (req, res) => {
  try {
    const { imei, name, location, poleId, simNumber, installer } = req.body;

    if (!imei) return res.status(400).json({ msg: "IMEI required" });

    const exists = await Device.findOne({ imei });
    if (exists) return res.status(400).json({ msg: "IMEI already exists" });

    const device = new Device({
      imei,
      name,
      location,
      poleId,
      simNumber,
      installer,
    });

    await device.save();

    res.json({ msg: "Device Added", device });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
===================================
   GET ALL DEVICES (MASTER OR USER)
===================================
*/
router.get("/", protect, async (req, res) => {
  try {
    let devices;

    // MASTER sees all devices
    if (req.user.role === "master") {
      devices = await Device.find().sort({ createdAt: -1 });
    } else {
      // USER only sees assigned devices
      devices = await Device.find({ assignedTo: req.user.id });
    }

    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
===================================
   GET SINGLE DEVICE DETAILS
===================================
*/
router.get("/:id", protect, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) return res.status(404).json({ msg: "Device not found" });

    res.json(device);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
=============================================
   DELETE DEVICE (MASTER ONLY)
=============================================
*/
router.delete("/:id", protect, onlyMaster, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) return res.status(404).json({ msg: "Device not found" });

    res.json({ msg: "Device deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
=============================================
   ASSIGN DEVICE TO USER (MASTER ONLY)
=============================================
*/
router.post("/assign", protect, onlyMaster, async (req, res) => {
  try {
    const { deviceId, userId } = req.body;

    const device = await Device.findById(deviceId);
    const user = await User.findById(userId);

    if (!device) return res.status(404).json({ msg: "Device not found" });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Assign device
    device.assignedTo = userId;
    await device.save();

    // Assign device to user
    if (!user.devices.includes(deviceId)) {
      user.devices.push(deviceId);
      await user.save();
    }

    res.json({ msg: "Device assigned successfully", device, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
