const express = require('express');
const { body } = require('express-validator');
const { getHabits, createHabit, updateHabit, deleteHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All habit routes are protected
router.use(protect);

// GET /api/habits
router.get('/', getHabits);

// POST /api/habits
router.post(
  '/',
  [
    body('study').isFloat({ min: 0, max: 24 }).withMessage('Study hours must be between 0 and 24'),
    body('sleep').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('exercise').isFloat({ min: 0, max: 1440 }).withMessage('Exercise must be between 0 and 1440 minutes'),
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
  ],
  createHabit
);

// PUT /api/habits/:id
router.put('/:id', updateHabit);

// DELETE /api/habits/:id
router.delete('/:id', deleteHabit);

module.exports = router;
