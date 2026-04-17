const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');

// ─── @route  GET /api/habits ─────────────────────────────────────────────────
// ─── @access Private
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    console.error('GetHabits Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  POST /api/habits ────────────────────────────────────────────────
// ─── @access Private
const createHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { study, sleep, exercise, date } = req.body;

  try {
    // Check if habit already logged for this date
    const existing = await Habit.findOne({ userId: req.user._id, date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You've already logged habits for this date. Use edit to update.",
      });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      study,
      sleep,
      exercise,
      date,
    });

    res.status(201).json({
      success: true,
      message: 'Habits logged successfully!',
      habit,
    });
  } catch (error) {
    console.error('CreateHabit Error:', error.message);
    // Duplicate key error (userId + date unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You've already logged habits for this date.",
      });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  PUT /api/habits/:id ─────────────────────────────────────────────
// ─── @access Private
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit record not found.' });
    }

    // Ensure user owns this record
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this record.' });
    }

    const { study, sleep, exercise, date } = req.body;

    if (study    !== undefined) habit.study    = study;
    if (sleep    !== undefined) habit.sleep    = sleep;
    if (exercise !== undefined) habit.exercise = exercise;
    if (date     !== undefined) habit.date     = date;

    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit record updated successfully!',
      habit,
    });
  } catch (error) {
    console.error('UpdateHabit Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  DELETE /api/habits/:id ──────────────────────────────────────────
// ─── @access Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit record not found.' });
    }

    // Ensure user owns this record
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record.' });
    }

    await habit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Habit record deleted successfully!',
    });
  } catch (error) {
    console.error('DeleteHabit Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit };
