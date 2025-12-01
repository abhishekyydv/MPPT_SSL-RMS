import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    imei: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: false,
      trim: true,
    },

    location: {
      type: String,
      required: false,
      trim: true,
    },

    poleId: {
      type: String,
      required: false,
      trim: true,
    },

    simNumber: {
      type: String,
      required: false,
      trim: true,
    },

    installer: {
      type: String,
      required: false,
      trim: true,
    },

    // Assigned user
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
