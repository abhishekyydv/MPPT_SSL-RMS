// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const MASTER = { username: "master", password: "master123", role: "master" };
  const USER = { username: "user", password: "user123", role: "user" };

  let found = null;
  if (username === MASTER.username && password === MASTER.password)
    found = MASTER;
  if (username === USER.username && password === USER.password) found = USER;

  if (!found) return res.status(401).json({ msg: "Invalid Credentials" });

  const token = jwt.sign(
    { username: found.username, role: found.role },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );

  res.json({ token, role: found.role });
});

export default router; // <-- 100% IMPORTANT
