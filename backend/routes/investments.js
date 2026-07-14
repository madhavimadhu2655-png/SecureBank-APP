const express = require('express');
const router  = express.Router();
const { getInvestments, investMutualFund, investGold, bookFD, breakFD } = require('../controllers/investmentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/',                  getInvestments);
router.post('/mutual-fund',      investMutualFund);
router.post('/gold',             investGold);
router.post('/fd',               bookFD);
router.post('/fd/:id/break',     breakFD);

module.exports = router;
