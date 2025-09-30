import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./admin/pages/Login";
import React, { Suspense, lazy, useEffect } from 'react';
import CustomerHome from "./customer/pages/CustomerHome";
import ProtectedAdmin from "./admin/components/ProtectedAdmin";
import { AuthProvider } from "./AuthContext";
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
// CustomerLogin import removed (unused) to avoid lint warning
import { NotificationProvider } from "./customer/components/NotificationContext";
import { initScrollReveal } from './scrollReveal';
import Navbar from "./customer/components/Navbar";

// Komponen untuk memicu scroll reveal saat route berubah
function ScrollRevealHandler() {
  const location = useLocation();
  useEffect(() => {
    // Trigger reveal setelah navigasi
    setTimeout(() => initScrollReveal(), 50);
  }, [location]);
  return null;
}

const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));

function MainLayout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <ScrollRevealHandler />
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
                                    <Suspense fallback={<div>Loading admin...</div>}>
                                        <AdminDashboard />
                                    </Suspense>
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
                        <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
                        <Route path="/payment/pending/:orderId" element={<PaymentPending />} />
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