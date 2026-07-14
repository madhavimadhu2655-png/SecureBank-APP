const express = require('express');
const router  = express.Router();
const { mobileRecharge, electricityBill, creditCardBill, genericBill, fetchBill } = require('../controllers/billsController');
const { authenticate } = require('../middleware/auth');
const { transferLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.get('/fetch',          fetchBill);
router.post('/recharge',      transferLimiter, mobileRecharge);
router.post('/electricity',   transferLimiter, electricityBill);
router.post('/credit-card',   transferLimiter, creditCardBill);
router.post('/generic',       transferLimiter, genericBill);

module.exports = router;
