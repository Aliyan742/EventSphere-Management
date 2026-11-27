const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "exhibitor", "attendee"],
      default: "attendee",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [400, "Bio cannot exceed 400 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Exhibitor-Specific Profile Details
    exhibitorProfile: {
      companyName: { type: String, trim: true },
      companyLogo: { type: String },
      industryCategory: { type: String, trim: true },
      description: { type: String, maxlength: [1000, "Description too long"] },
      website: { type: String, trim: true },
      documents: [{ type: String }],
      approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },

    // Attendee-Specific Profile Details
    attendeeProfile: {
      interests: [{ type: String }],
      bookmarkedSessions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Session",
        },
      ],
      registeredExpos: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Expo",
        },
      ],
    },

    savedBooths: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booth",
      },
    ],
    settings: {
      emailNotifications: { type: Boolean, default: true },
      appointmentAlerts: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      fontFamily: {
        type: String,
        enum: ["sans", "jakarta", "mono"],
        default: "sans",
      },
      fontSize: {
        type: String,
        enum: ["sm", "md", "lg"],
        default: "md",
      },
      compactMode: { type: Boolean, default: false },
      profileVisibility: {
        type: String,
        enum: ["public", "attendees", "private"],
        default: "public",
      },
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1, role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
