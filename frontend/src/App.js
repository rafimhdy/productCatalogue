import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import React from "react";
import { AuthProvider } from "./AuthContext";
import { NotificationProvider } from "./customer/components/NotificationContext";
import Navbar from "./customer/components/Navbar";

// Import components normally
import Login from "./admin/pages/Login";
import CustomerHome from "./customer/pages/CustomerHome";
import ProtectedAdmin from "./admin/components/ProtectedAdmin";
import Register from "./customer/pages/Register";
import CartPage from "./customer/pages/CartPage";
import CustomerOrderHistory from "./customer/pages/CustomerOrderHistory";
import ProductsPage from "./customer/pages/ProductsPage";
import ProductDetail from "./customer/pages/ProductDetail";
import PaymentPage from "./customer/pages/PaymentPage";
import PaymentSuccess from "./customer/pages/PaymentSuccess";
import PaymentPending from "./customer/pages/PaymentPending";
import PaymentError from "./customer/pages/PaymentError";
import CustomerDashboard from "./customer/pages/CustomerDashboard";
import PrivacyPolicy from "./customer/pages/PrivacyPolicy";
import TermsConditions from "./customer/pages/TermsConditions";
import AdminDashboard from "./admin/pages/AdminDashboard";

function MainLayout({ children }) {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <NotificationProvider>{children}</NotificationProvider>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CustomerHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdmin>
                  <AdminDashboard />
                </ProtectedAdmin>
              }
            />

            {/* Customer Routes */}
            <Route path="/customer/home" element={<CustomerHome />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-history" element={<CustomerOrderHistory />} />

            {/* Payment Routes */}
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route
              path="/payment/success/:orderId"
              element={<PaymentSuccess />}
            />
            <Route
              path="/payment/pending/:orderId"
              element={<PaymentPending />}
            />
            <Route path="/payment/error/:orderId" element={<PaymentError />} />

            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
