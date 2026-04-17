const express = require('express');
const { body } = require('express-validator');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All expense routes are protected
router.use(protect);

// GET /api/expenses
router.get('/', getExpenses);

// POST /api/expenses
router.post(
  '/',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category')
      .isIn(['food', 'transport', 'education', 'shopping', 'entertainment', 'others'])
      .withMessage('Invalid category'),
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
  ],
  createExpense
);

// PUT /api/expenses/:id
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);

module.exports = router;
