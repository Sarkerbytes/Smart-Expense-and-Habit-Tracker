const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');

// ─── @route  GET /api/expenses ───────────────────────────────────────────────
// ─── @access Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('GetExpenses Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  POST /api/expenses ──────────────────────────────────────────────
// ─── @access Private
const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { amount, category, description, date } = req.body;

  try {
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      description: description || '',
      date,
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      expense,
    });
  } catch (error) {
    console.error('CreateExpense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  PUT /api/expenses/:id ──────────────────────────────────────────
// ─── @access Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    // Ensure user owns this expense
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this expense.' });
    }

    const { amount, category, description, date } = req.body;

    if (amount    !== undefined) expense.amount      = amount;
    if (category  !== undefined) expense.category    = category;
    if (description !== undefined) expense.description = description;
    if (date      !== undefined) expense.date        = date;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully!',
      expense,
    });
  } catch (error) {
    console.error('UpdateExpense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  DELETE /api/expenses/:id ───────────────────────────────────────
// ─── @access Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    // Ensure user owns this expense
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this expense.' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully!',
    });
  } catch (error) {
    console.error('DeleteExpense Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
