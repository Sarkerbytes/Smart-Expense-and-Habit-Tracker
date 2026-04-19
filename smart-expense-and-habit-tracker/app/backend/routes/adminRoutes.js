const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const {
  getStats,
  getAllUsers,
  getUserDetail,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin secret header: x-admin-secret
router.use(adminAuth);

// GET  /api/admin/stats          → platform-wide statistics
router.get('/stats', getStats);

// GET  /api/admin/users          → list all users (enriched)
router.get('/users', getAllUsers);

// GET  /api/admin/users/:id      → single user full detail
router.get('/users/:id', getUserDetail);

// PUT  /api/admin/users/:id      → update user (name / budget)
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id   → delete user + all data
router.delete('/users/:id', deleteUser);

module.exports = router;
