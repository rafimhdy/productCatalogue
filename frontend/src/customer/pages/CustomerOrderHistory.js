import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductDetailModal from "../components/ProductDetailModal";
import { useNotification } from "../components/NotificationContext";
import "./css/CustomerOrderHistory.css";

const CustomerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [productToReview, setProductToReview] = useState(null);
  const navigate = useNavigate();
  const { notify } = useNotification();

  const checkAuthAndFetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "customer") {
      navigate("/login");
      return;
    }

    await fetchOrders();
  }, [navigate]);

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, [checkAuthAndFetchOrders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://31.97.109.187:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
      setCurrentPage(1);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Yakin mau batalkan pesanan ini?");
    if (!confirmCancel) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(
        `http://31.97.109.187:5000/api/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to cancel order");

      // Update local orders state to show cancelled
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
      // If selectedOrder is this one, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }
      alert("Pesanan berhasil dibatalkan");
    } catch (err) {
      console.error("Cancel order error:", err);
      alert(err.message || "Gagal membatalkan pesanan");
    } finally {
      setCancellingId(null);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `http://31.97.109.187:5000/api/orders/admin/${orderId}/items`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch order items");
      const items = await response.json();
      // merge with order metadata
      const orderMeta = orders.find((o) => o.id === orderId);
      setSelectedOrder({ ...orderMeta, items });
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      processing: "#17a2b8",
      shipped: "#6f42c1",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: "Menunggu Konfirmasi",
      processing: "Sedang Diproses",
      shipped: "Dalam Pengiriman",
      delivered: "Telah Diterima",
      cancelled: "Dibatalkan",
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    // Handle NaN or invalid numbers
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return "Rp 0";
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login untuk memberikan ulasan.", "info");
      return false;
    }

    if (!reviewData || !reviewData.product_id || !reviewData.order_id) {
      console.error("Invalid review data", reviewData);
      notify("Data ulasan tidak lengkap.", "error");
      return false;
    }

    console.log("CustomerOrderHistory sending review data:", reviewData);
    console.log("Token available:", !!token);

    try {
      const requestBody = {
        product_id: reviewData.product_id,
        order_id: reviewData.order_id,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
      };

      console.log("Request body being sent:", requestBody);

      const response = await fetch("http://31.97.109.187:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response from server:", { status: response.status, data });

      if (response.ok) {
        notify("Ulasan berhasil dikirim!", "success");
        setProductToReview(null);
        return true;
      } else {
        notify(data.message || "Gagal mengirim ulasan.", "error");
        return false;
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      notify("Terjadi kesalahan saat mengirim ulasan.", "error");
      return false;
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="order-history-container">
      <Navbar />
      <h2 className="order-history-title">Riwayat Pesanan Saya</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>Belum Ada Pesanan</h3>
          <p>Anda belum pernah melakukan pesanan. Mari mulai berbelanja!</p>
          <button
            onClick={() => navigate("/customer/home")}
            className="btn btn-success"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        (() => {
          // Pagination slicing
          const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
          if (currentPage > totalPages) setCurrentPage(totalPages);
          const start = (currentPage - 1) * itemsPerPage;
          const pageOrders = orders.slice(start, start + itemsPerPage);
          return (
            <>
              <div className="orders-grid">
                {pageOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h4>Pesanan #{order.id}</h4>
                        <p className="order-date">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div
                        className="order-status"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {getStatusText(order.status)}
                      </div>
                    </div>

                    <div className="order-footer">
                      <div>
                        <p className="order-total">
                          Total: {formatCurrency(order.total_price)}
                        </p>
                      </div>
                      <div className="order-actions">
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="btn btn-primary"
                        >
                          Lihat Detail
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="btn btn-danger"
                          >
                            {cancellingId === order.id
                              ? "Membatalkan..."
                              : "Batalkan"}
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            onClick={() => navigate("/customer/home")}
                            className="btn btn-success"
                          >
                            Pesan Lagi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-pagination">
                <div className="pagination-left">
                  <label>
                    Tampilkan:
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    / halaman
                  </label>
                </div>
                <div className="pagination-buttons">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={p === currentPage ? "active" : ""}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          );
        })()
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Detail Pesanan #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p>
                <strong>Tanggal:</strong> {formatDate(selectedOrder.created_at)}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className="order-status"
                  style={{
                    marginLeft: 10,
                    backgroundColor: getStatusColor(selectedOrder.status),
                  }}
                >
                  {getStatusText(selectedOrder.status)}
                </span>
              </p>
              <p>
                <strong>Total:</strong>{" "}
                {formatCurrency(selectedOrder.total_price)}
              </p>
            </div>

            <h4>Produk yang Dipesan:</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <div className="order-items-list">
                {selectedOrder.items.map((item) => {
                  const price = Number(item.price) || 0;
                  const subtotal =
                    Number(item.subtotal) ||
                    price * (Number(item.quantity) || 1);
                  return (
                    <div key={item.id} className="order-item">
                      <div className="item-info">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="item-image"
                          />
                        )}
                        <div className="item-details">
                          <h4>{item.product_name}</h4>
                          <p>
                            {item.quantity} x {formatCurrency(price)}
                          </p>
                        </div>
                      </div>
                      <div className="item-actions">
                        <div className="item-subtotal">
                          {formatCurrency(subtotal)}
                        </div>
                        {selectedOrder.status === "delivered" && (
                          <button
                            onClick={() => {
                              const productData = {
                                id: item.product_id,
                                name: item.product_name,
                                price,
                                image_url: item.image_url,
                                description:
                                  item.description ||
                                  "Tidak ada deskripsi tersedia.",
                                stock: item.stock ?? null,
                                category_name: item.category_name ?? undefined,
                              };
                              setProductToReview({
                                ...productData,
                                order_id: selectedOrder.id,
                              });
                              setSelectedOrder(null);
                            }}
                            className="btn btn-review"
                          >
                            Tulis Ulasan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                Detail produk tidak tersedia untuk pesanan lama
              </p>
            )}
          </div>
        </div>
      )}

      {/* Render ProductDetailModal for Reviews */}
      {productToReview && (
        <ProductDetailModal
          product={productToReview}
          onClose={() => setProductToReview(null)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default CustomerOrderHistory;
