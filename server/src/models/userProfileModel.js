import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    preferenceVector: {
      type: [Number],
      default: [],
    },

    vectorUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model(
  "UserProfile",
  userProfileSchema
);

export default UserProfile;