const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const Booth = require("../models/Booth");
const Message = require("../models/Message");
const Session = require("../models/Session");

// @desc    Delete own account & release any reserved booths
// @route   DELETE /api/auth/account
// @access  Private
const deleteMyAccount = async (req, res, next) => {
  try {
    await Booth.updateMany(
      { exhibitor: req.user.id },
      {
        $set: {
          status: "available",
          exhibitor: null,
          showcaseDetails: undefined,
        },
      },
    );
    await User.findByIdAndDelete(req.user.id);
    res
      .status(200)
      .json({ success: true, message: "Account permanently deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Exhibitor or Attendee)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      exhibitorProfile,
      attendeeProfile,
    } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be created via public registration",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "attendee",
      phone,
      exhibitorProfile: role === "exhibitor" ? exhibitorProfile : undefined,
      attendeeProfile: role !== "exhibitor" ? attendeeProfile : undefined,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        exhibitorProfile: user.exhibitorProfile,
        attendeeProfile: user.attendeeProfile,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile, email, avatar & preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      bio,
      avatar,
      exhibitorProfile,
      attendeeProfile,
      settings,
    } = req.body;
    const user = await User.findById(req.user.id);

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: "This email is already in use by another account",
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    if (settings) {
      const currentSettings = user.settings ? user.settings.toObject() : {};
      user.settings = { ...currentSettings, ...settings };
    }

    if (user.role === "exhibitor" && exhibitorProfile) {
      const currentEx = user.exhibitorProfile
        ? user.exhibitorProfile.toObject()
        : {};
      user.exhibitorProfile = {
        ...currentEx,
        ...exhibitorProfile,
      };
    }

    if (user.role === "attendee" && attendeeProfile) {
      const currentAtt = user.attendeeProfile
        ? user.attendeeProfile.toObject()
        : {};
      user.attendeeProfile = {
        ...currentAtt,
        ...attendeeProfile,
      };
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Generate Reset Token
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this email" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change logged-in user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new passwords are required",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite/saved booth for Attendee visit list
// @route   POST /api/auth/saved-booths/:boothId
// @access  Private
const toggleSavedBooth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const boothId = req.params.boothId;
    const exists = user.savedBooths.some((id) => id.toString() === boothId);

    if (exists) {
      user.savedBooths = user.savedBooths.filter(
        (id) => id.toString() !== boothId,
      );
    } else {
      user.savedBooths.push(boothId);
    }

    await user.save();
    res.status(200).json({
      success: true,
      savedBooths: user.savedBooths,
      message: exists
        ? "Removed from visit list"
        : "Saved to your booth visit list!",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export all personal data (GDPR compliance)
// @route   GET /api/auth/export-data
// @access  Private
const exportMyData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "savedBooths",
      "boothNumber tier price",
    );
    const booths = await Booth.find({ exhibitor: req.user.id }).populate(
      "expo",
      "title",
    );
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    }).select("subject content messageType createdAt");
    const sessions = await Session.find({
      registeredAttendees: req.user.id,
    }).select("title startTime hallLocation");

    res.status(200).json({
      exportedAt: new Date().toISOString(),
      profile: user,
      reservedBooths: booths,
      bookmarkedSessions: sessions,
      communications: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Continue with Google (Login or Auto-Register)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { name, email, avatar, role, companyName } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Google email is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const selectedRole = role === "exhibitor" ? "exhibitor" : "attendee";
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: crypto.randomBytes(16).toString("hex"),
        role: selectedRole,
        avatar: avatar || "default-avatar.png",
        isVerified: true,
        ...(selectedRole === "exhibitor" && {
          exhibitorProfile: {
            companyName: companyName || `${name || "Partner"} Enterprises`,
            industryCategory: "Technology & Innovation",
            approvalStatus: "approved",
          },
        }),
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        exhibitorProfile: user.exhibitorProfile,
        attendeeProfile: user.attendeeProfile,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteMyAccount,
  changePassword,
  toggleSavedBooth,
  exportMyData,
  googleAuth,
};
