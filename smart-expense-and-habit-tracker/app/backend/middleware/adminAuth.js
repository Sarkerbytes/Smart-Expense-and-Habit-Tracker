// ─── Admin Auth Middleware ───────────────────────────────────────────────────
// Verifies the x-admin-secret header against ADMIN_SECRET in .env
// This protects all /api/admin/* routes from regular users

const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];

  if (!secret) {
    return res.status(401).json({
      success: false,
      message: 'Admin authorization required. No secret provided.',
    });
  }

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin secret. Access denied.',
    });
  }

  next();
};

module.exports = { adminAuth };
