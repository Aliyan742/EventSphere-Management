const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["inquiry", "appointment", "collaboration", "support"],
      default: "inquiry",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    // Agar message appointment booking ke liye hai
    appointmentDetails: {
      requestedDate: { type: Date },
      preferredDate: { type: Date },
      timeSlot: { type: String },
      status: {
        type: String,
        enum: ["pending", "requested", "confirmed", "declined"],
        default: "pending",
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [2000, "Reply cannot exceed 2000 characters"],
        },
        deletedBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
