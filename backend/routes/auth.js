const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.put('/update-password', authenticateToken, authController.updatePassword);
router.get('/public-stats', authController.getPublicStats);

module.exports = router;
