import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { XCircle, ShoppingBag, RefreshCcw } from 'lucide-react';
import './css/PaymentPage.css';

const PaymentError = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId, navigate]);

    const fetchOrderDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`http://31.97.109.187:5000/api/orders/details/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderDetails(response.data);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryPayment = () => {
        navigate(`/payment/${orderId}`);
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

    if (error || !orderDetails) {
        return (
            <>
                <Navbar />
                <div className="payment-container">
                    <div className="alert alert-danger">
                        {error || "Order details could not be loaded."}
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/order-history')}>
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
                        <div className="status-icon error">
                            <XCircle size={50} />
                        </div>
                    </div>

                    <div className="status-body">
                        <h2 className="status-title error">Payment Failed</h2>
                        <p className="status-message">
                            Your payment for Order #{orderId} could not be processed.
                            This could be due to insufficient funds, expired session, or other payment issues.
                        </p>

                        <div className="order-summary">
                            <div className="order-summary-item">
                                <div className="label">Order Date</div>
                                <div className="value">{new Date(orderDetails.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="order-summary-item">
                                <div className="label">Payment Method</div>
                                <div className="value">Midtrans</div>
                            </div>
                            <div className="order-summary-item">
                                <div className="label">Status</div>
                                <div className="value status error">{orderDetails.status}</div>
                            </div>
                            <div className="order-summary-item total">
                                <div className="label">Total Amount</div>
                                <div className="value">Rp {orderDetails.total_price?.toLocaleString()}</div>
                            </div>
                        </div>

                        {orderDetails.items && orderDetails.items.length > 0 && (
                            <div className="items-list">
                                <h3 className="items-list-title">Ordered Items</h3>
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

                        <div className="payment-notice alert-danger" style={{marginTop: '20px', backgroundColor: '#ffebee', color: '#c0392b', borderLeft: '4px solid #c0392b', padding: '15px'}}>
                            You can try again with a different payment method or contact customer service for assistance.
                        </div>
                    </div>

                    <div className="status-actions">
                        <button onClick={handleRetryPayment} className="btn btn-danger" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <RefreshCcw size={16} style={{marginRight: '8px'}} />
                            Try Payment Again
                        </button>
                        <a href="/order-history" className="btn btn-outline">
                            View Order History
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PaymentError;
