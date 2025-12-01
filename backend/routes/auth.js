import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();


// ---------------------------
// LOGIN API
// ---------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });

    if (!user)
      return res.status(401).json({ msg: "Invalid username or password" });

    // Check password (plain text for now, bcrypt can be added later)
    const isMatch = password === user.password;

    if (!isMatch)
      return res.status(401).json({ msg: "Invalid username or password" });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", err });
  }
});


// ---------------------------
// MASTER CREATES NEW USER
// ---------------------------

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Only master login will be able to access this route (middleware later)
    if (!username || !password || !role)
      return res.status(400).json({ msg: "All fields required" });

    const exists = await User.findOne({ username });

    if (exists)
      return res.status(400).json({ msg: "Username already exists" });

    const newUser = new User({
      username,
      password, // bcrypt later
      role,
    });

    await newUser.save();

    res.json({ msg: "User created", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", err });
  }
});


export default router;
