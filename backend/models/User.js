import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["master", "user"] },
});

const User = mongoose.model("User", userSchema);

export default User;
