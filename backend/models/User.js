import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["master", "user"],
      required: true,
    },

    // Devices assigned to this user
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
