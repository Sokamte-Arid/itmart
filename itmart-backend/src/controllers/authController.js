const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendPasswordResetEmail } = require('../utils/mailer');

const signToken = (admin) =>
  jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new ApiError(401, 'Invalid email or password.');

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  const token = signToken(admin);

  res.json({
    success: true,
    data: {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { id, name, email, role } = req.admin;
  res.json({ success: true, data: { id, name, email, role } });
});

// POST /api/auth/admins  (SUPER_ADMIN only — create additional admin accounts)
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required.');
  }
  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
  if (role && !validRoles.includes(role)) {
    throw new ApiError(400, `role must be one of: ${validRoles.join(', ')}`);
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { name, email, passwordHash, role: role || 'ADMIN' },
  });

  res.status(201).json({
    success: true,
    data: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// GET /api/auth/admins  (SUPER_ADMIN only — list all admin accounts)
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: admins });
});

// DELETE /api/auth/admins/:id  (SUPER_ADMIN only — remove an admin account)
const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.admin.id) {
    throw new ApiError(400, 'You cannot delete your own account while logged in as it.');
  }
  await prisma.admin.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Admin removed.' });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required.');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long.');
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  res.json({ success: true, message: 'Password updated successfully.' });
});

// POST /api/auth/forgot-password  (public)
// Always responds with the same generic message whether or not the email
// exists, so this endpoint can't be used to discover which emails have
// admin accounts.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required.');

  const genericMessage = 'If an account exists for that email, a reset link has been sent.';
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (admin) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiry },
    });

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
    const resetLink = `${adminUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetEmail(admin, resetLink).catch((err) =>
      console.error('[auth] Failed to send password reset email:', err.message)
    );
  }

  res.json({ success: true, message: genericMessage });
});

// POST /api/auth/reset-password  (public)
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required.');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long.');
  }

  const admin = await prisma.admin.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!admin) {
    throw new ApiError(400, 'This reset link is invalid or has expired. Please request a new one.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

module.exports = {
  login,
  getMe,
  createAdmin,
  getAdmins,
  deleteAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
};
