const express = require('express');
const {
  login,
  getMe,
  createAdmin,
  getAdmins,
  deleteAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/forgot-password', loginLimiter, forgotPassword);
router.post('/reset-password', loginLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/admins', protect, authorize('SUPER_ADMIN'), getAdmins);
router.post('/admins', protect, authorize('SUPER_ADMIN'), createAdmin);
router.delete('/admins/:id', protect, authorize('SUPER_ADMIN'), deleteAdmin);

module.exports = router;
