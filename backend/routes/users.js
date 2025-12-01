import express from "express";
import User from "../models/User.js";
import Device from "../models/Device.js";
import { protect, onlyMaster } from "../middleware/auth.js";

const router = express.Router();

/*
========================================
   CREATE NEW USER  (MASTER ONLY)
========================================
*/
router.post("/", protect, onlyMaster, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ msg: "All fields required" });

    const exists = await User.findOne({ username });

    if (exists) return res.status(400).json({ msg: "Username already exists" });

    const newUser = new User({
      username,
      password,       // bcrypt later
      role,
    });

    await newUser.save();

    res.json({ msg: "User created", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
========================================
        GET ALL USERS (MASTER ONLY)
========================================
*/
router.get("/", protect, onlyMaster, async (req, res) => {
  try {
    const users = await User.find().populate("devices", "imei name");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

/*
========================================
       DELETE USER (MASTER ONLY)
========================================
*/
router.delete("/:id", protect, onlyMaster, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // unassign all devices linked to this user
    await Device.updateMany(
      { assignedTo: user._id },
      { $set: { assignedTo: null } }
    );

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", err });
  }
});

export default router;
