import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    articleId: {
      type: String,
      required: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      enum: [
        "view",
        "click",
        "read",
        "like",
        "save",
        "share",
        "ai_summary",
        "ai_chat",
      ],
    },

    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Interaction = mongoose.model(
  "Interaction",
  interactionSchema
);

export default Interaction;