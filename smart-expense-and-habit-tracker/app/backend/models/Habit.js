const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    study: {
      type: Number,
      required: [true, 'Study hours are required'],
      min: [0, 'Study hours cannot be negative'],
      max: [24, 'Study hours cannot exceed 24'],
    },
    sleep: {
      type: Number,
      required: [true, 'Sleep duration is required'],
      min: [0, 'Sleep duration cannot be negative'],
      max: [24, 'Sleep duration cannot exceed 24'],
    },
    exercise: {
      type: Number,
      required: [true, 'Exercise time is required'],
      min: [0, 'Exercise time cannot be negative'],
      max: [1440, 'Exercise time cannot exceed 1440 minutes'],
    },
    date: {
      type: String, // stored as YYYY-MM-DD string
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
  },
  { timestamps: true }
);

// One habit log per user per day
HabitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Habit', HabitSchema);
