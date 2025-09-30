import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { CreditCard, Phone, Clock, ShoppingBag } from "lucide-react";
import "./css/PaymentPage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState("midtrans");
  const [orderDetails, setOrderDetails] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const midtransLoadedRef = useRef(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Fetch order details
      const response = await axios.get(
        `${API_BASE}/api/orders/details/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrderDetails(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
      setLoading(false);
    }
  };

  const handlePayWithWhatsApp = () => {
    if (!orderDetails) return;

    // Generate WhatsApp message with order details
    const items = orderDetails.items
      .map(
        (item) =>
          `- ${item.product_name} (x${
            item.quantity
          }) - Rp ${item.price.toLocaleString()}`
      )
      .join("\n");

    const message = `
Hello, I would like to confirm my order #${orderId}.
Here are the details:
${items}

Total: Rp ${orderDetails.total_price.toLocaleString()}

Please provide payment instructions. Thank you!
        `.trim();

    // Open WhatsApp with pre-filled message
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Dynamic loader for Midtrans Snap script
  const loadMidtrans = () => {
    return new Promise((resolve, reject) => {
      if (window.snap) {
        midtransLoadedRef.current = true;
        return resolve(true);
      }
      // avoid loading multiple times
      if (midtransLoadedRef.current) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      s.async = true;
      s.setAttribute(
        "data-client-key",
        process.env.REACT_APP_MIDTRANS_CLIENT_KEY ||
          "SB-Mid-client-your-client-key-here"
      );
      s.onload = () => {
        midtransLoadedRef.current = true;
        console.debug("Midtrans loaded");
        resolve(true);
      };
      s.onerror = (e) => reject(e);
      document.body.appendChild(s);
    });
  };

  const handlePayWithMidtrans = async () => {
    setProcessingPayment(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/orders/create-payment`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) throw new Error("Failed to create payment");

      // Ensure Midtrans script is loaded before calling snap
      await loadMidtrans();

      if (!window.snap) throw new Error("Midtrans Snap not available");

      window.snap.pay(response.data.token, {
        onSuccess: function (result) {
          navigate(`/payment/success/${orderId}`);
        },
        onPending: function (result) {
          navigate(`/payment/pending/${orderId}`);
        },
        onError: function (result) {
          navigate(`/payment/error/${orderId}`);
        },
        onClose: function () {
          setProcessingPayment(false);
          setError("Payment process was closed without completing");
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      setError("Failed to initiate payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="alert alert-danger">
            Order not found or you don't have permission to view it.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/order-history")}
          >
            Back to Order History
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-container" style={{ marginTop: "60px" }}>
        <h1 className="payment-title fadeInUp">Complete Your Payment</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="payment-grid">
          {/* Order Summary Card */}
          <div className="payment-card order-card fadeInUp">
            <div className="order-header">
              <h2>Order Summary</h2>
            </div>
            <div className="order-content">
              <div className="order-info">
                <div className="order-info-group">
                  <span className="order-info-label">Order ID</span>
                  <span className="order-info-value">#{orderId}</span>
                </div>
                <div className="order-info-group">
                  <span className="order-info-label">Order Date</span>
                  <span className="order-info-value">
                    {new Date(orderDetails.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="order-info-group">
                  <span className="order-info-label">Status</span>
                  <span
                    className={`status-badge status-${
                      orderDetails.status || "pending"
                    }`}
                  >
                    {orderDetails.status || "pending"}
                  </span>
                </div>
              </div>

              <div className="items-list">
                <h3 className="items-list-title">Ordered Items</h3>

                {orderDetails.items &&
                  orderDetails.items.map((item, index) => (
                    <div className="item" key={index}>
                      <div className="item-name">
                        <div className="item-icon">
                          <ShoppingBag size={16} />
                        </div>
                        {item.product_name}
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <div className="item-price">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}

                <div className="total-row">
                  <div className="total-label">Total Amount</div>
                  <div className="total-value">
                    Rp {orderDetails.total_price?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Card */}
          <div
            className="payment-card payment-methods-card fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="payment-methods-header">
              <h2>Payment Method</h2>
            </div>
            <div className="payment-methods-content">
              {/* Midtrans Payment Option */}
              <div
                className={`payment-option ${
                  selectedOption === "midtrans" ? "selected" : ""
                }`}
                onClick={() => setSelectedOption("midtrans")}
              >
                <div className="payment-option-icon midtrans">
                  <CreditCard size={24} />
                </div>
                <div className="payment-option-info">
                  <h4 className="payment-option-title">Midtrans Payment</h4>
                  <p className="payment-option-description">
                    Credit Card, Bank Transfer, E-wallet, etc.
                  </p>
                </div>
                <div className="payment-option-radio"></div>
              </div>

              {/* WhatsApp Payment Option */}
              <div
                className={`payment-option ${
                  selectedOption === "whatsapp" ? "selected" : ""
                }`}
                onClick={() => setSelectedOption("whatsapp")}
              >
                <div className="payment-option-icon whatsapp">
                  <Phone size={24} />
                </div>
                <div className="payment-option-info">
                  <h4 className="payment-option-title">WhatsApp Payment</h4>
                  <p className="payment-option-description">
                    Contact us directly for payment instructions
                  </p>
                </div>
                <div className="payment-option-radio"></div>
              </div>

              {selectedOption === "midtrans" ? (
                <button
                  className="payment-button midtrans"
                  onClick={handlePayWithMidtrans}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="spinner"
                        style={{ marginRight: "8px" }}
                      ></span>
                      <span>Processing...</span>{" "}
                      {/* Bungkus teks dalam span! */}
                    </div>
                  ) : (
                    <>
                      <CreditCard size={20} className="payment-button-icon" />
                      Pay Now with Midtrans
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="payment-button whatsapp"
                  onClick={handlePayWithWhatsApp}
                >
                  <Phone size={20} className="payment-button-icon" />
                  Contact via WhatsApp
                </button>
              )}

              <div className="payment-footer">
                <Clock
                  size={14}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Payment valid for 24 hours
              </div>

              <div className="payment-notice notice-info">
                Please complete your payment to process your order. If you have
                any questions, feel free to contact our customer support.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
