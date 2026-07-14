const express = require('express');
const router = express.Router();
const { initiateTransfer, requestOTP, getHistory } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { transferLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { transferValidation } = require('../middleware/validators');

// All transaction routes require authentication
router.use(authenticate);

router.post('/transfer', transferLimiter, transferValidation, initiateTransfer);
router.post('/request-otp', otpLimiter, requestOTP);
router.get('/history', getHistory);

module.exports = router;
