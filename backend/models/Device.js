import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  imei: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Device = mongoose.model("Device", deviceSchema);

export default Device;
