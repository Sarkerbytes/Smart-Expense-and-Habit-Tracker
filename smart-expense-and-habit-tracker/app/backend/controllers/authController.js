const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── @route  POST /api/auth/register ────────────────────────────────────────
// ─── @access Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user (password is hashed via pre-save hook in model)
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @route  POST /api/auth/login ───────────────────────────────────────────
// ─── @access Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user and explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @route  GET /api/auth/me ────────────────────────────────────────────────
// ─── @access Private
const getMe = async (req, res) => {
  try {
    const user = req.user; // attached by auth middleware
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  PUT /api/auth/me ────────────────────────────────────────────────
// ─── @access Private
const updateMe = async (req, res) => {
  try {
    const { name, email, monthlyBudget, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Update basic fields
    if (name)          user.name          = name;
    if (email)         user.email         = email.toLowerCase();
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }
      user.password = newPassword; // will be hashed by pre-save hook
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('UpdateMe Error:', error.message);
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already taken.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateMe };
