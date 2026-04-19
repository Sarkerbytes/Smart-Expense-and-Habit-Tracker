const User    = require('../models/User');
const Expense = require('../models/Expense');
const Habit   = require('../models/Habit');

// ─── @route  GET /api/admin/stats ───────────────────────────────────────────
// ─── @access Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalExpenses, totalHabits, spendingAgg] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Habit.countDocuments(),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalSpending = spendingAgg[0]?.total || 0;

    // Category breakdown across all users
    const categoryBreakdown = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly spending trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    const monthlyTrend = await Expense.aggregate([
      { $match: { date: { $gte: sixMonthsAgoStr } } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // New users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExpenses,
        totalHabits,
        totalSpending,
        newUsersThisMonth,
        categoryBreakdown,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error('AdminGetStats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  GET /api/admin/users ───────────────────────────────────────────
// ─── @access Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();

    // Fetch expense & habit counts + spending per user in bulk
    const userIds = users.map((u) => u._id);

    const [expenseAgg, habitAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            totalSpending: { $sum: '$amount' },
          },
        },
      ]),
      Habit.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);

    // Build lookup maps
    const expenseMap = {};
    expenseAgg.forEach((e) => {
      expenseMap[e._id.toString()] = { count: e.count, totalSpending: e.totalSpending };
    });

    const habitMap = {};
    habitAgg.forEach((h) => {
      habitMap[h._id.toString()] = h.count;
    });

    const enrichedUsers = users.map((u) => {
      const uid = u._id.toString();
      return {
        _id:           u._id,
        name:          u.name,
        email:         u.email,
        monthlyBudget: u.monthlyBudget,
        createdAt:     u.createdAt,
        updatedAt:     u.updatedAt,
        expenseCount:  expenseMap[uid]?.count || 0,
        totalSpending: expenseMap[uid]?.totalSpending || 0,
        habitCount:    habitMap[uid] || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('AdminGetAllUsers Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  GET /api/admin/users/:id ───────────────────────────────────────
// ─── @access Admin
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [expenses, habits] = await Promise.all([
      Expense.find({ userId: user._id }).sort({ date: -1, createdAt: -1 }).lean(),
      Habit.find({ userId: user._id }).sort({ date: -1 }).lean(),
    ]);

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown for this user
    const catMap = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const categoryBreakdown = Object.entries(catMap).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
    })).sort((a, b) => b.amount - a.amount);

    res.status(200).json({
      success: true,
      user: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        monthlyBudget: user.monthlyBudget,
        createdAt:     user.createdAt,
        updatedAt:     user.updatedAt,
      },
      expenses,
      habits,
      summary: {
        expenseCount:      expenses.length,
        habitCount:        habits.length,
        totalSpending,
        categoryBreakdown,
        budgetUsed: user.monthlyBudget > 0
          ? Math.round((totalSpending / user.monthlyBudget) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('AdminGetUserDetail Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  PUT /api/admin/users/:id ───────────────────────────────────────
// ─── @access Admin
const updateUser = async (req, res) => {
  try {
    const { name, monthlyBudget } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name          !== undefined) user.name          = name;
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('AdminUpdateUser Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route  DELETE /api/admin/users/:id ────────────────────────────────────
// ─── @access Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete all related data first
    await Promise.all([
      Expense.deleteMany({ userId: user._id }),
      Habit.deleteMany({ userId: user._id }),
    ]);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User "${user.name}" and all their data have been deleted.`,
    });
  } catch (error) {
    console.error('AdminDeleteUser Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats, getAllUsers, getUserDetail, updateUser, deleteUser };
