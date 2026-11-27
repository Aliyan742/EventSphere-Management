const Expo = require("../models/Expo");
const Booth = require("../models/Booth");
const User = require("../models/User");

// Helper: Validate realistic Expo dates (Today up to +2 Years)
const validateExpoDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Valid start and end dates are required.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxAllowed = new Date();
  maxAllowed.setFullYear(maxAllowed.getFullYear() + 2);
  maxAllowed.setHours(23, 59, 59, 999);

  if (start < today) {
    return "Start date cannot be in the past.";
  }
  if (start > maxAllowed || end > maxAllowed) {
    return `Expo dates cannot exceed ${maxAllowed.getFullYear()} (max 2 years ahead).`;
  }
  if (end < start) {
    return "End date cannot be earlier than start date.";
  }
  return null;
};

// @desc    Create new Expo & automatically generate Floor Plan Booths
// @route   POST /api/expos
// @access  Private/Admin
const createExpo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      theme,
      bannerImage,
      startDate,
      endDate,
      location,
      floorPlan,
      maxAttendees,
    } = req.body;

    const dateError = validateExpoDates(startDate, endDate);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    const rows = floorPlan?.dimensions?.rows || 3;
    const columns = floorPlan?.dimensions?.columns || 4;
    const totalBooths = rows * columns;

    const expo = await Expo.create({
      title,
      description,
      theme,
      bannerImage,
      startDate,
      endDate,
      location,
      floorPlan: {
        totalBooths,
        layoutImage: floorPlan?.layoutImage,
        dimensions: { rows, columns },
      },
      maxAttendees,
      createdBy: req.user.id,
    });

    const boothsToCreate = [];
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let r = 0; r < rows; r++) {
      const rowChar = rowLetters[r] || `R${r + 1}`;
      for (let c = 0; c < columns; c++) {
        const colNum = String(c + 1).padStart(2, "0");
        boothsToCreate.push({
          expo: expo._id,
          boothNumber: `${rowChar}-${colNum}`,
          tier: r === 0 ? "vip" : r === 1 ? "premium" : "standard",
          price: r === 0 ? 500 : r === 1 ? 300 : 150,
          coordinates: { row: r + 1, column: c + 1 },
          status: "available",
        });
      }
    }

    await Booth.insertMany(boothsToCreate);

    res.status(201).json({
      success: true,
      message: `Expo created with ${totalBooths} floor plan booths`,
      expo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Expos (with search & city/theme filters)
// @route   GET /api/expos
// @access  Public
const getAllExpos = async (req, res, next) => {
  try {
    const { search, city, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { theme: { $regex: search, $options: "i" } },
      ];
    }
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (status) query.status = status;

    const expos = await Expo.find(query)
      .populate("createdBy", "name email")
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, count: expos.length, expos });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Expo details + its Floor Plan Booths
// @route   GET /api/expos/:id
// @access  Public
const getExpoById = async (req, res, next) => {
  try {
    const expo = await Expo.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!expo) {
      return res
        .status(404)
        .json({ success: false, message: "Expo not found" });
    }

    const booths = await Booth.find({ expo: expo._id }).populate(
      "exhibitor",
      "name email exhibitorProfile",
    );

    res.status(200).json({ success: true, expo, booths });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Expo
// @route   PUT /api/expos/:id
// @access  Private/Admin
const updateExpo = async (req, res, next) => {
  try {
    if (req.body.startDate || req.body.endDate) {
      const existing = await Expo.findById(req.params.id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Expo not found" });
      }
      const dateError = validateExpoDates(
        req.body.startDate || existing.startDate,
        req.body.endDate || existing.endDate,
      );
      if (dateError) {
        return res.status(400).json({ success: false, message: dateError });
      }
    }

    const expo = await Expo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expo) {
      return res
        .status(404)
        .json({ success: false, message: "Expo not found" });
    }
    res.status(200).json({ success: true, expo });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Expo & its associated Booths
// @route   DELETE /api/expos/:id
// @access  Private/Admin
const deleteExpo = async (req, res, next) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) {
      return res
        .status(404)
        .json({ success: false, message: "Expo not found" });
    }

    await Booth.deleteMany({ expo: expo._id });
    await expo.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Expo and its booths deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Attendee registers for an Expo
// @route   POST /api/expos/:id/register
// @access  Private/Attendee
const registerAttendeeForExpo = async (req, res, next) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) {
      return res
        .status(404)
        .json({ success: false, message: "Expo not found" });
    }

    if (expo.registeredAttendees.includes(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Already registered for this expo" });
    }

    expo.registeredAttendees.push(req.user.id);
    await expo.save();

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { "attendeeProfile.registeredExpos": expo._id },
    });

    res
      .status(200)
      .json({ success: true, message: "Successfully registered for the expo" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  registerAttendeeForExpo,
};
