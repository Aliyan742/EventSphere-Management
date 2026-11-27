const Expo = require("../models/Expo");
const Booth = require("../models/Booth");
const Session = require("../models/Session");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Message = require("../models/Message");

// @desc    Get Real-Time Analytics for Admin Dashboard
// @route   GET /api/system/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalExpos,
      totalExhibitors,
      totalAttendees,
      totalBooths,
      bookedBooths,
      sessions,
    ] = await Promise.all([
      Expo.countDocuments(),
      User.countDocuments({ role: "exhibitor" }),
      User.countDocuments({ role: "attendee" }),
      Booth.countDocuments(),
      Booth.countDocuments({ status: "booked" }),
      Session.find().select("title registeredAttendees capacity").lean(),
    ]);

    const popularSessions = sessions
      .map((s) => ({
        id: s._id,
        title: s.title,
        attendees: s.registeredAttendees ? s.registeredAttendees.length : 0,
        capacity: s.capacity,
      }))
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      analytics: {
        totalExpos,
        totalExhibitors,
        totalAttendees,
        boothOccupancy: {
          total: totalBooths,
          booked: bookedBooths,
          available: totalBooths - bookedBooths,
        },
        popularSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Feedback or Bug Report
// @route   POST /api/system/feedback
// @access  Public
const submitFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Feedbacks (Admin)
// @route   GET /api/system/feedback
// @access  Private/Admin
const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "avatar role")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin replies to or resolves feedback
// @route   PUT /api/system/feedback/:id
// @access  Private/Admin
const respondToFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status || "resolved",
        adminReply: req.body.adminReply,
      },
      { new: true },
    );
    if (!feedback)
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ONLY unseen/unreplied notifications for Navbar bell
// @route   GET /api/system/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = [];
    const userId = req.user._id.toString();
    const role = req.user.role;

    // 1. Fetch active threads and filter ONLY unseen incoming activity
    const threads = await Message.find({
      $or: [{ receiver: req.user._id }, { sender: req.user._id }],
      deletedBy: { $ne: req.user._id },
      isRead: false,
    })
      .populate("sender", "name role exhibitorProfile.companyName")
      .populate("receiver", "name role exhibitorProfile.companyName")
      .populate({
        path: "replies.sender",
        select: "name role exhibitorProfile.companyName",
        strictPopulate: false,
      })
      .sort({ updatedAt: -1 })
      .limit(15);

    threads.forEach((m) => {
      const hasReplies = m.replies && m.replies.length > 0;
      const lastReply = hasReplies ? m.replies[m.replies.length - 1] : null;
      const latestSender = hasReplies ? lastReply.sender : m.sender;
      const latestSenderId = (latestSender?._id || latestSender)?.toString();

      // Only notify if the OTHER person sent the latest message/reply
      if (latestSenderId && latestSenderId !== userId) {
        const senderRoleLabel =
          latestSender?.role === "exhibitor"
            ? latestSender?.exhibitorProfile?.companyName || "Exhibitor"
            : latestSender?.role === "admin"
              ? "Organizer"
              : "Attendee";

        const previewText = (
          (hasReplies ? lastReply.content : m.content) || ""
        ).slice(0, 48);

        notifications.push({
          id: m._id,
          type: m.messageType,
          title: hasReplies ? `Reply: ${m.subject}` : m.subject,
          detail: `From ${latestSender?.name || "User"} (${senderRoleLabel}) • "${previewText}${
            previewText.length >= 48 ? "..." : ""
          }"`,
          targetTab: role === "admin" ? "support" : "messages",
          unread: true,
          time: m.updatedAt,
        });
      }
    });

    // 2. Actionable Admin approvals
    if (role === "admin") {
      const pendingBooths = await Booth.find({
        status: "pending_approval",
      })
        .populate("expo", "title")
        .populate("exhibitor", "name exhibitorProfile.companyName");

      pendingBooths.forEach((b) => {
        notifications.unshift({
          id: b._id,
          type: "approval",
          title: `Booth ${b.boothNumber} Awaiting Approval`,
          detail: `${
            b.exhibitor?.exhibitorProfile?.companyName ||
            b.exhibitor?.name ||
            "Exhibitor"
          } • ${b.expo?.title || "Expo Floor Plan"}`,
          targetTab: "booths",
          unread: true,
          time: b.updatedAt,
        });
      });
    }

    res.status(200).json({
      success: true,
      unreadCount: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle approval of a feedback/review for the public Verified Reviews Wall
// @route   PUT /api/system/feedback/:id/approve-public
// @access  Private (Admin)
const togglePublicReviewApproval = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    feedback.isApprovedForPublic = !feedback.isApprovedForPublic;
    await feedback.save();
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Admin-approved reviews for the public website wall
// @route   GET /api/system/public-reviews
// @access  Public
const getPublicVerifiedReviews = async (req, res, next) => {
  try {
    const reviews = await Feedback.find({ isApprovedForPublic: true })
      .populate("user", "avatar role")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics: getAdminAnalytics,
  submitFeedback,
  getAllFeedback: getAllFeedbacks,
  respondFeedback: respondToFeedback,
  getMyNotifications,
  togglePublicReviewApproval,
  getPublicVerifiedReviews,
};
