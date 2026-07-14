const express = require('express');
const router = express.Router();
const {
  getAllUsers, getAllTransactions, getFraudAlerts,
  suspendUser, getDashboardStats, resolveAlert,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require auth AND admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.get('/transactions', getAllTransactions);
router.get('/alerts', getFraudAlerts);
router.put('/transactions/:id/resolve', resolveAlert);

module.exports = router;
