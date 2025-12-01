import jwt from "jsonwebtoken";

// -----------------------------------
// VERIFY TOKEN
// -----------------------------------
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// -----------------------------------
// ONLY MASTER CAN ACCESS
// -----------------------------------
export const onlyMaster = (req, res, next) => {
  if (req.user.role !== "master") {
    return res.status(403).json({ msg: "Access denied: Master only" });
  }
  next();
};
