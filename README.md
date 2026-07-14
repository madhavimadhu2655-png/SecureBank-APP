# 🏦 SecureBank — Complete Digital Banking App

Full-stack payment platform inspired by PhonePe, Google Pay & Paytm.
Built with React + Vite + Tailwind (frontend) and Node.js + Express + MongoDB (backend).

---

## ⚡ Quick Start (3 steps)

### Step 1 — Setup Backend

```bash
cd securebank-complete/backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Open `backend/.env` and fill in your real values:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/banking_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
JWT_EXPIRY=2h
FRONTEND_URL=http://localhost:5173
LARGE_TRANSFER_THRESHOLD=10000
FRAUD_LARGE_THRESHOLD=5000
LOG_LEVEL=info
```

Generate your JWT secret by running:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:
```bash
npm run dev
```

✅ You should see:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
SecureBank v2.0 running on port 5000 [development]
```

---

### Step 2 — Setup Frontend

Open a **new terminal window** and run:

```bash
cd securebank-complete/frontend
npm install
```

Create your `.env.local` file:
```bash
cp .env.example .env.local
```

The default value is already correct for local development:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

✅ You should see:
```
VITE v5.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

---

### Step 3 — Open in Browser

Go to: **http://localhost:5173**

Register a new account and start using the app!

---

## 🔑 Make Yourself Admin

After registering, go to **MongoDB Atlas → Collections → banking_db → users**

Find your document and run in Atlas Shell:
```js
use banking_db
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { role: "admin" } }
)
```

Then **log out and log back in** — you'll land on the Admin Dashboard.

---

## 📁 Project Structure

```
securebank-complete/
├── backend/                         Node.js + Express API
│   ├── config/database.js           MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        Register, Login, JWT
│   │   ├── transactionController.js Atomic UPI transfers
│   │   ├── adminController.js       Admin management
│   │   ├── walletController.js      Digital wallet
│   │   ├── investmentController.js  MF, Gold, FD
│   │   └── billsController.js       Bill payments
│   ├── middleware/
│   │   ├── auth.js                  JWT verify + RBAC
│   │   ├── rateLimiter.js           Per-route rate limits
│   │   └── validators.js            Input validation
│   ├── models/
│   │   ├── User.js                  User schema + bcrypt
│   │   ├── Transaction.js           Payment records
│   │   ├── Log.js                   Audit trail
│   │   ├── Wallet.js                Digital wallet
│   │   └── Investment.js            MF / Gold / FD
│   ├── routes/
│   │   ├── auth.js                  /api/auth/*
│   │   ├── user.js                  /api/user/*
│   │   ├── transaction.js           /api/transactions/*
│   │   ├── admin.js                 /api/admin/*
│   │   ├── wallet.js                /api/wallet/*
│   │   ├── investments.js           /api/investments/*
│   │   └── bills.js                 /api/bills/*
│   ├── services/
│   │   ├── fraudDetection.js        4-rule fraud engine
│   │   └── notificationService.js   OTP + notifications
│   ├── utils/
│   │   ├── logger.js                Winston logger
│   │   └── auditLogger.js           DB audit writer
│   ├── server.js                    Main entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                        React + Vite + Tailwind
    ├── src/
    │   ├── App.jsx                  All routes (43 pages)
    │   ├── main.jsx                 React entry point
    │   ├── index.css                Tailwind + custom styles
    │   ├── context/
    │   │   ├── AuthContext.jsx      JWT + session timeout
    │   │   ├── ThemeContext.jsx     Dark/light mode
    │   │   └── LanguageContext.jsx  10 Indian languages
    │   ├── services/api.js          Axios + all APIs
    │   ├── components/
    │   │   └── common/
    │   │       ├── Layout.jsx       Responsive sidebar
    │   │       └── LoadingSpinner.jsx
    │   └── pages/ (43 pages)
    │       Core:    UPIDashboard, UPISendPage, QRScannerPage
    │       Bills:   MobileRecharge, CreditCard, Electricity,
    │                Water, Gas, DTH, Broadband, MetroCard,
    │                Flights, Hotels
    │       Easy:    BankAccounts, Analytics, Notifications,
    │                Profile, Favourites, Receipt, Repeat,
    │                Language, Contacts
    │       Medium:  Rewards, SplitBill, MerchantPay, AutoPay,
    │                NearbyMap, EMI, Tickets, Insurance
    │       Hard:    Wallet, MutualFunds, DigitalGold, BNPL,
    │                AIAssistant, UPILite, FD
    │       Admin:   Dashboard, Users, Alerts
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env.example
```

---

## 🌐 All API Endpoints

### Auth
```
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me
```

### User
```
GET   /api/user/profile
GET   /api/user/balance
PUT   /api/user/profile
```

### Transactions
```
POST  /api/transactions/transfer
POST  /api/transactions/request-otp
GET   /api/transactions/history
```

### Wallet
```
GET   /api/wallet
POST  /api/wallet/add
POST  /api/wallet/send
POST  /api/wallet/withdraw
```

### Investments
```
GET   /api/investments
POST  /api/investments/mutual-fund
POST  /api/investments/gold
POST  /api/investments/fd
POST  /api/investments/fd/:id/break
```

### Bills
```
GET   /api/bills/fetch
POST  /api/bills/recharge
POST  /api/bills/electricity
POST  /api/bills/credit-card
POST  /api/bills/generic
```

### Admin
```
GET   /api/admin/dashboard
GET   /api/admin/users
PUT   /api/admin/users/:id/suspend
GET   /api/admin/transactions
GET   /api/admin/alerts
PUT   /api/admin/transactions/:id/resolve
```

---

## 🔒 Security Features

- bcrypt password hashing (12 salt rounds)
- JWT authentication (2h expiry)
- Account lockout after 5 failed attempts
- Helmet.js security headers
- MongoDB injection sanitization
- Rate limiting (relaxed in dev, strict in production)
- Atomic transactions (MongoDB sessions)
- 4-rule fraud detection engine
- Complete audit trail in database

---

## 🚀 Deploy to Production

### Frontend → Vercel
```bash
cd frontend
npm run build
# Upload dist/ to Vercel
# Set environment variable: VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render
- Connect your GitHub repo
- Build command: `cd backend && npm install`
- Start command: `node server.js`
- Add all `.env` variables in Render dashboard
- Change `NODE_ENV` to `production`

### MongoDB → Atlas
- Free M0 cluster works fine
- Network Access → Allow `0.0.0.0/0`
- Copy connection string to `MONGO_URI`

---

## 💡 Tips

- Both terminals must stay open while using the app
- Restart backend with `rs` + Enter in nodemon terminal, or Ctrl+C then `npm run dev`
- If you see "Too many requests" during dev, restart the backend (clears rate limit memory)
- The AI Assistant uses the Claude API — it works as long as you're logged in
- Dark mode toggle is in the sidebar bottom-left
