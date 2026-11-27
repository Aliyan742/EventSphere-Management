const mongoose = require('mongoose');

const expoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expo title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Expo description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    theme: {
      type: String,
      required: [true, 'Expo theme or industry category is required'],
      trim: true,
    },
    bannerImage: {
      type: String,
      default: 'default-expo-banner.jpg',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: 'End date must be equal to or after the start date',
      },
    },
    location: {
      venueName: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Venue address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
    },
    floorPlan: {
      totalBooths: {
        type: Number,
        required: [true, 'Total number of booths is required'],
        min: [1, 'At least 1 booth is required'],
      },
      layoutImage: {
        type: String, // Floor plan map image URL
      },
      dimensions: {
        rows: { type: Number, default: 5 },
        columns: { type: Number, default: 6 },
      },
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    maxAttendees: {
      type: Number,
      default: 500,
    },
    registeredAttendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: Total registered attendees count automatically calculate karne ke liye
expoSchema.virtual('attendeeCount').get(function () {
  return this.registeredAttendees ? this.registeredAttendees.length : 0;
});

// Search aur filtering ko fast banane ke liye indexing
expoSchema.index({ title: 'text', theme: 'text', 'location.city': 1, status: 1 });

module.exports = mongoose.model('Expo', expoSchema);