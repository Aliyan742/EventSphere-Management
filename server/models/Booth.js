const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    boothNumber: {
      type: String,
      required: [true, 'Booth number is required (e.g., A-01)'],
      trim: true,
      uppercase: true,
    },
    tier: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    size: {
      type: String,
      default: '10x10 ft',
    },
    price: {
      type: Number,
      default: 0,
    },
    // Floor plan grid par exact location dikhane ke liye
    coordinates: {
      row: { type: Number, required: true },
      column: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['available', 'pending_approval', 'booked', 'maintenance'],
      default: 'available',
    },
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Exhibitor apne stall par kya showcase karega
    showcaseDetails: {
      productsOrServices: [{ type: String, trim: true }],
      boothDescription: { type: String, maxlength: [500, 'Description too long'] },
      staffMembers: [
        {
          name: { type: String, trim: true },
          role: { type: String, trim: true },
        },
      ],
    },
    // Analytics: Kitne attendees ne is booth ko view ya visit kiya
    trafficCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ek hi expo mein duplicate booth number nahi ban sakta (Compound Unique Index)
boothSchema.index({ expo: 1, boothNumber: 1 }, { unique: true });
boothSchema.index({ expo: 1, status: 1 });

module.exports = mongoose.model('Booth', boothSchema);