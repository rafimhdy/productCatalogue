import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import "./css/PaymentPage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE}/api/orders/details/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrderDetails(response.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

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

  if (error || !orderDetails) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="alert alert-danger">
            {error || "Order details could not be loaded."}
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
      <div className="payment-status-container">
        <div className="status-card fadeInUp">
          <div className="status-icon-wrapper">
            <div className="status-icon success">
              <CheckCircle size={50} />
            </div>
          </div>

          <div className="status-body">
            <h2 className="status-title success">Payment Successful!</h2>
            <p className="status-message">
              Your payment for Order #{orderId} has been successfully processed.
              Thank you for your purchase!
            </p>

            <div className="order-summary">
              <div className="order-summary-item">
                <div className="label">Order Date</div>
                <div className="value">
                  {new Date(orderDetails.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="order-summary-item">
                <div className="label">Payment Method</div>
                <div className="value">Midtrans</div>
              </div>
              <div className="order-summary-item">
                <div className="label">Status</div>
                <div className="value status success">
                  {orderDetails.status}
                </div>
              </div>
              <div className="order-summary-item total">
                <div className="label">Total Amount</div>
                <div className="value">
                  Rp {orderDetails.total_price?.toLocaleString()}
                </div>
              </div>
            </div>

            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="items-list">
                <h3 className="items-list-title">Items Purchased</h3>
                {orderDetails.items.map((item, index) => (
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
              </div>
            )}
          </div>

          <div className="status-actions">
            <a href="/order-history" className="btn btn-primary">
              View Order History
            </a>
            <a href="/products" className="btn btn-outline">
              Continue Shopping{" "}
              <ArrowRight
                size={16}
                style={{ marginLeft: "5px", verticalAlign: "middle" }}
              />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess;
