const mongoose = require('mongoose');

const bodyMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: {
    type: Number, // kg
    required: true
  },
  bodyFat: {
    type: Number // percentage
  },
  muscleMass: {
    type: Number // kg
  },
  bmi: {
    type: Number
  },
  measurements: {
    chest: Number, // cm
    waist: Number, // cm
    hips: Number, // cm
    arms: Number, // cm
    thighs: Number, // cm
    calves: Number // cm
  },
  photos: [{
    type: String // URLs to progress photos
  }],
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
bodyMetricsSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BodyMetrics', bodyMetricsSchema);
