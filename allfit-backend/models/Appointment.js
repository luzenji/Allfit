const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  type: {
    type: String,
    enum: ['consultation', 'training', 'follow-up', 'assessment'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  consultationResults: {
    bodyMeasurements: {
      weight: Number,
      height: Number,
      bodyFat: Number,
      muscleMass: Number,
      bmi: Number
    },
    assessment: String,
    recommendations: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
appointmentSchema.index({ clientId: 1, appointmentDate: 1 });
appointmentSchema.index({ coachId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
