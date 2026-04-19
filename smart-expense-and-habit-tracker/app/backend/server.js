const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());                // Allow cross-origin requests from Next.js
app.use(express.json());        // Parse JSON request bodies

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/habits',   require('./routes/habitRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// ─── Health check route ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Smart Expense & Habit Tracker API is running',
    version: '1.0.0',
    endpoints: {
      auth:     '/api/auth',
      expenses: '/api/expenses',
      habits:   '/api/habits',
    },
  });
});

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🟢 Server running on http://localhost:${PORT}`);
  console.log(`   Auth:     http://localhost:${PORT}/api/auth`);
  console.log(`   Expenses: http://localhost:${PORT}/api/expenses`);
  console.log(`   Habits:   http://localhost:${PORT}/api/habits}\n`);
});
