const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Logged-in ya guest user dono bhej sakein
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["suggestion", "bug_report", "event_feedback", "other"],
      default: "suggestion",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      maxlength: [1500, "Feedback cannot exceed 1500 characters"],
    },
    status: {
      type: String,
      enum: ["open", "reviewed", "resolved"],
      default: "open",
    },
    adminReply: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    userRole: {
      type: String,
      default: "Attendee / Exhibitor",
    },
    isApprovedForPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
