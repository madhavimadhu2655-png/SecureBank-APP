const express = require('express');
const router  = express.Router();
const { getWallet, addMoney, sendFromWallet, withdraw } = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { transferLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.get('/',          getWallet);
router.post('/add',      transferLimiter, addMoney);
router.post('/send',     transferLimiter, sendFromWallet);
router.post('/withdraw', transferLimiter, withdraw);

module.exports = router;
