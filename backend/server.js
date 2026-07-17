require('dotenv').config();
const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit     = require('express-rate-limit');
const morgan        = require('morgan');
const { connectDB } = require('./config/database');
const logger        = require('./utils/logger');

const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/user');
const transactionRoutes = require('./routes/transaction');
const adminRoutes       = require('./routes/admin');
const walletRoutes      = require('./routes/wallet');
const investmentRoutes  = require('./routes/investments');
const billsRoutes       = require('./routes/bills');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.anthropic.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',

  // Production
  'https://secure-bank-app-sigma.vercel.app',

  // Git deployment
  'https://secure-bank-app-git-main-madhavimadhu2655-pngs-projects.vercel.app',

  // Preview deployment
  'https://secure-bank-qei48wtf8-madhavimadhu2655-pngs-projects.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize({ replaceWith: '_' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, slow down.' },
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
}
app.disable('x-powered-by');

app.use('/api/auth',         authRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/wallet',       walletRoutes);
app.use('/api/investments',  investmentRoutes);
app.use('/api/bills',        billsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  logger.error(err.message + ' | ' + req.method + ' ' + req.url);
  const message = process.env.NODE_ENV === 'production' ? 'An internal error occurred' : err.message;
  res.status(err.statusCode || 500).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => logger.info('SecureBank v2.0 running on port ' + PORT + ' [' + process.env.NODE_ENV + ']'));
});

module.exports = app;
