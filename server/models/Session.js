const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Session topic/category is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    speaker: {
      name: { type: String, required: [true, 'Speaker name is required'], trim: true },
      designation: { type: String, trim: true },
      bio: { type: String, maxlength: [500, 'Bio too long'] },
    },
    hallLocation: {
      type: String,
      required: [true, 'Hall or room location is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Session start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Session end time is required'],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    capacity: {
      type: Number,
      default: 100,
    },
    // Jin attendees ne session register ya bookmark kiya hai (Popularity analytics ke liye)
    registeredAttendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: Session popularity track karne ke liye
sessionSchema.virtual('popularityCount').get(function () {
  return this.registeredAttendees ? this.registeredAttendees.length : 0;
});

sessionSchema.index({ expo: 1, startTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);