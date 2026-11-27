const Session = require("../models/Session");
const Expo = require("../models/Expo");
const User = require("../models/User");

// @desc    Create a new Session/Workshop (Admin)
// @route   POST /api/sessions
// @access  Private/Admin
const createSession = async (req, res, next) => {
  try {
    const { expo: expoId, startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const maxAllowed = new Date();
    maxAllowed.setFullYear(maxAllowed.getFullYear() + 2);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid session start and end times are required.",
        });
    }
    if (start < now) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Session start time cannot be in the past.",
        });
    }
    if (start > maxAllowed || end > maxAllowed) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Session year cannot exceed ${maxAllowed.getFullYear()}.`,
        });
    }
    if (end <= start) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Session end time must be after start time.",
        });
    }

    const parentExpo = await Expo.findById(expoId);
    if (!parentExpo) {
      return res
        .status(404)
        .json({ success: false, message: "Selected Expo not found." });
    }

    const expoStart = new Date(parentExpo.startDate);
    expoStart.setHours(0, 0, 0, 0);
    const expoEnd = new Date(parentExpo.endDate);
    expoEnd.setHours(23, 59, 59, 999);

    if (start < expoStart || end > expoEnd) {
      return res.status(400).json({
        success: false,
        message: `Session must fall within Expo dates (${expoStart.toLocaleDateString()} - ${expoEnd.toLocaleDateString()}).`,
      });
    }

    const session = await Session.create(req.body);
    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sessions for an Expo
// @route   GET /api/sessions/expo/:expoId
// @access  Public
const getExpoSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ expo: req.params.expoId }).sort({
      startTime: 1,
    });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or Delete a Session (Admin)
// @route   PUT /api/sessions/:id
// @access  Private/Admin
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Attendee bookmarks/registers for a Session
// @route   POST /api/sessions/:id/bookmark
// @access  Private/Attendee
const toggleBookmarkSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    const isBookmarked = session.registeredAttendees.includes(req.user.id);

    if (isBookmarked) {
      session.registeredAttendees.pull(req.user.id);
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { "attendeeProfile.bookmarkedSessions": session._id },
      });
    } else {
      session.registeredAttendees.push(req.user.id);
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { "attendeeProfile.bookmarkedSessions": session._id },
      });
    }

    await session.save();
    res.status(200).json({
      success: true,
      message: isBookmarked
        ? "Session removed from bookmarks"
        : "Session bookmarked",
      bookmarked: !isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getExpoSessions,
  updateSession,
  deleteSession,
  toggleBookmarkSession,
};
