import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Core UPI
import UPIDashboard       from './pages/UPIDashboard';
import QRScannerPage      from './pages/QRScannerPage';
import UPISendPage        from './pages/UPISendPage';
import MobileRechargePage from './pages/MobileRechargePage';
import CreditCardPage     from './pages/CreditCardPage';
import BillPaymentPage    from './pages/BillPaymentPage';

// Easy features
import BankAccountsPage   from './pages/BankAccountsPage';
import SpendAnalyticsPage from './pages/SpendAnalyticsPage';
import NotificationsPage  from './pages/NotificationsPage';
import ProfilePage        from './pages/ProfilePage';
import FavouritesPage     from './pages/FavouritesPage';
import ReceiptPage        from './pages/ReceiptPage';
import RepeatPaymentPage  from './pages/RepeatPaymentPage';
import LanguagePage       from './pages/LanguagePage';
import ContactsSyncPage   from './pages/ContactsSyncPage';

// Medium features
import RewardsPage        from './pages/RewardsPage';
import SplitBillPage      from './pages/SplitBillPage';
import MerchantPayPage    from './pages/MerchantPayPage';
import AutoPayPage        from './pages/AutoPayPage';
import NearbyMapPage      from './pages/NearbyMapPage';
import EMIPage            from './pages/EMIPage';
import TicketsPage        from './pages/TicketsPage';
import InsurancePage      from './pages/InsurancePage';

// Hard features
import WalletPage         from './pages/WalletPage';
import MutualFundsPage    from './pages/MutualFundsPage';
import DigitalGoldPage    from './pages/DigitalGoldPage';
import BNPLPage           from './pages/BNPLPage';
import AIAssistantPage    from './pages/AIAssistantPage';
import UPILitePage        from './pages/UPILitePage';
import FDPage             from './pages/FDPage';

// NEW — Separate bill pages
import MetroCardPage      from './pages/MetroCardPage';
import FlightsPage        from './pages/FlightsPage';
import HotelsPage         from './pages/HotelsPage';
import GasPage            from './pages/GasPage';

// Admin & Legacy
import TransferPage       from './pages/TransferPage';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard     from './pages/AdminDashboard';
import AdminUsers         from './pages/AdminUsers';
import AdminAlerts        from './pages/AdminAlerts';
import NotFound           from './pages/NotFound';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!token || !user) return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/upi" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/upi'} replace />;
  return children;
};

const P  = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const PA = ({ children }) => <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* UPI Home */}
      <Route path="/upi"       element={<P><UPIDashboard /></P>} />
      <Route path="/dashboard" element={<Navigate to="/upi" replace />} />

      {/* Core UPI */}
      <Route path="/upi/send"        element={<P><UPISendPage /></P>} />
      <Route path="/upi/request"     element={<P><UPISendPage /></P>} />
      <Route path="/upi/qr-scanner"  element={<P><QRScannerPage /></P>} />

      {/* Bill payments — specific pages first, generic last */}
      <Route path="/bills/recharge"    element={<P><MobileRechargePage /></P>} />
      <Route path="/bills/credit-card" element={<P><CreditCardPage /></P>} />
      <Route path="/bills/metro"       element={<P><MetroCardPage /></P>} />
      <Route path="/bills/flights"     element={<P><FlightsPage /></P>} />
      <Route path="/bills/hotels"      element={<P><HotelsPage /></P>} />
      <Route path="/bills/gas"         element={<P><GasPage /></P>} />
      {/* Generic covers: electricity, water, dth, broadband, insurance */}
      <Route path="/bills/:type"       element={<P><BillPaymentPage /></P>} />

      {/* Easy features */}
      <Route path="/accounts"          element={<P><BankAccountsPage /></P>} />
      <Route path="/analytics"         element={<P><SpendAnalyticsPage /></P>} />
      <Route path="/notifications"     element={<P><NotificationsPage /></P>} />
      <Route path="/profile"           element={<P><ProfilePage /></P>} />
      <Route path="/favourites"        element={<P><FavouritesPage /></P>} />
      <Route path="/receipt"           element={<P><ReceiptPage /></P>} />
      <Route path="/payments/repeat"   element={<P><RepeatPaymentPage /></P>} />
      <Route path="/settings/language" element={<P><LanguagePage /></P>} />
      <Route path="/contacts"          element={<P><ContactsSyncPage /></P>} />

      {/* Medium features */}
      <Route path="/rewards"           element={<P><RewardsPage /></P>} />
      <Route path="/split"             element={<P><SplitBillPage /></P>} />
      <Route path="/merchant"          element={<P><MerchantPayPage /></P>} />
      <Route path="/nearby"            element={<P><NearbyMapPage /></P>} />
      <Route path="/autopay"           element={<P><AutoPayPage /></P>} />
      <Route path="/emi"               element={<P><EMIPage /></P>} />
      <Route path="/tickets"           element={<P><TicketsPage /></P>} />
      <Route path="/insurance"         element={<P><InsurancePage /></P>} />

      {/* Hard features */}
      <Route path="/wallet"            element={<P><WalletPage /></P>} />
      <Route path="/mutual-funds"      element={<P><MutualFundsPage /></P>} />
      <Route path="/gold"              element={<P><DigitalGoldPage /></P>} />
      <Route path="/bnpl"              element={<P><BNPLPage /></P>} />
      <Route path="/ai-assistant"      element={<P><AIAssistantPage /></P>} />
      <Route path="/upi-lite"          element={<P><UPILitePage /></P>} />
      <Route path="/fd"                element={<P><FDPage /></P>} />

      {/* Legacy */}
      <Route path="/transfer" element={<P><TransferPage /></P>} />
      <Route path="/history"  element={<P><TransactionHistory /></P>} />

      {/* Admin */}
      <Route path="/admin"        element={<PA><AdminDashboard /></PA>} />
      <Route path="/admin/users"  element={<PA><AdminUsers /></PA>} />
      <Route path="/admin/alerts" element={<PA><AdminAlerts /></PA>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
