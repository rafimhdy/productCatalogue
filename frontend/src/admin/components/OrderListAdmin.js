import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingCart,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const OrderListAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderItems, setOrderItems] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders when search term or status filter changes
  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  // Auto dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Pagination calculations
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/orders/admin/${orderId}/items`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order items");
      }

      const data = await response.json();
      setOrderItems((prev) => ({
        ...prev,
        [orderId]: data,
      }));
    } catch (err) {
      console.error("Error fetching order items:", err);
    }
  };

  const toggleOrderDetails = (orderId) => {
    // If we're expanding this order, fetch its items
    if (!expandedOrders[orderId]) {
      fetchOrderItems(orderId);
    }

    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <div className="order-status status-pending">
            <Clock size={16} />
            Pending
          </div>
        );
      case "confirmed":
        return (
          <div className="order-status status-confirmed">
            <CheckCircle size={16} />
            Dikonfirmasi
          </div>
        );
      case "shipped":
        return (
          <div className="order-status status-shipped">
            <Truck size={16} />
            Dikirim
          </div>
        );
      case "delivered":
        return (
          <div className="order-status status-delivered">
            <Package size={16} />
            Selesai
          </div>
        );
      case "cancelled":
        return (
          <div className="order-status status-cancelled">
            <XCircle size={16} />
            Dibatalkan
          </div>
        );
      default:
        return <div className="order-status">{status}</div>;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      // Map frontend status terms to database enum values
      const statusMapping = {
        pending: "pending",
        confirmed: "processing", // Map 'confirmed' to 'processing'
        shipped: "shipped",
        delivered: "delivered",
        cancelled: "cancelled",
      };

      const databaseStatus = statusMapping[newStatus] || newStatus;

      const response = await fetch(
        `${API_BASE}/api/orders/admin/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: databaseStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setSuccessMessage(
        `Status pesanan #${orderId} berhasil diubah menjadi ${getStatusText(
          newStatus
        )}`
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Gagal mengubah status pesanan: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Dikonfirmasi";
      case "shipped":
        return "Dikirim";
      case "delivered":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getCustomerInitials = (name) => {
    if (!name) return "C";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="order-management">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      {/* Header with stats */}
      <div className="order-header">
        <h2 style={{ color: "whitesmoke" }}>
          <ShoppingCart size={28} />
          Manajemen Pesanan
        </h2>
        <div className="order-stats">
          <span className="stat-badge total">
            <ShoppingCart size={16} />
            Total: {orders.length} pesanan
          </span>
          <span className="stat-badge pending">
            <Clock size={16} />
            Pending:{" "}
            {orders.filter((order) => order.status === "pending").length}
          </span>
          <span className="stat-badge completed">
            <CheckCircle size={16} />
            Selesai:{" "}
            {orders.filter((order) => order.status === "delivered").length}
          </span>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="success-notification">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      {/* Filters and Search */}
      <div className="order-filters">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari pesanan berdasarkan ID, nama, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="shipped">Dikirim</option>
          <option value="delivered">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page-select"
        >
          <option value={5}>5 per halaman</option>
          <option value={10}>10 per halaman</option>
          <option value={20}>20 per halaman</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("");
          }}
          className="btn btn-outline"
        >
          <Filter size={16} />
          Reset Filter
        </button>
      </div>

      {/* Orders List */}
      {currentOrders.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={64} className="empty-icon" />
          <h3>Tidak ada pesanan ditemukan</h3>
          <p>Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <div className="orders-list">
          {currentOrders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Order Header */}
              <div className="order-header-card">
                <div className="order-basic-info">
                  <div className="order-id">
                    <h5>Pesanan #{order.id}</h5>
                    <p style={{ fontSize: "small" }} className="order-date">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="order-customer-info">
                    <div className="customer-avatar">
                      {getCustomerInitials(order.customer_name)}
                    </div>
                    <div className="customer-details">
                      <h5>{order.customer_name}</h5>
                      <p>
                        <Mail size={14} />
                        {order.customer_email}
                      </p>
                    </div>
                  </div>

                  <div className="order-amount">
                    {formatCurrency(order.total_price)}
                  </div>

                  <div className="order-status-container">
                    {getStatusBadge(order.status)}
                    <button
                      className="btn btn-sm"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrders[order.id] ? (
                        <>
                          <EyeOff size={14} />
                          Sembunyikan
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Detail
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details (expandable) */}
              {expandedOrders[order.id] && (
                <div className="order-details">
                  {/* Order Items Section */}
                  <div className="order-items-section">
                    <h5>
                      <Package size={16} />
                      Item Pesanan
                    </h5>

                    {!orderItems[order.id] ? (
                      <div className="loading-items">
                        <div className="spinner-small"></div>
                        <span>Memuat item...</span>
                      </div>
                    ) : (
                      <div className="items-grid">
                        {orderItems[order.id].map((item) => (
                          <div key={item.id} className="order-item">
                            {item.product_image ? (
                              <img
                                src={`${API_BASE}/uploads/${item.product_image}`}
                                alt={item.product_name}
                                className="item-image"
                              />
                            ) : (
                              <div className="item-image-placeholder">
                                <Package size={24} />
                              </div>
                            )}
                            <div className="item-info">
                              <h6>{item.product_name}</h6>
                              <p>
                                {formatCurrency(item.price)} x {item.quantity}
                              </p>
                              <p className="item-subtotal">
                                Subtotal:{" "}
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Actions Section */}
                  <div className="order-actions-section">
                    <h5>Ubah Status Pesanan</h5>
                    <div className="status-buttons">
                      {order.status !== "pending" &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "pending")
                            }
                            className="btn btn-sm btn-outline"
                            disabled={updatingOrderId === order.id}
                          >
                            <Clock size={14} />
                            Pending
                          </button>
                        )}

                      {order.status !== "confirmed" &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "confirmed")
                            }
                            className="btn btn-sm btn-primary"
                            disabled={updatingOrderId === order.id}
                          >
                            <CheckCircle size={14} />
                            Konfirmasi
                          </button>
                        )}

                      {(order.status === "confirmed" ||
                        order.status === "shipped") &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "shipped")
                            }
                            className="btn btn-sm btn-warning"
                            disabled={updatingOrderId === order.id}
                          >
                            <Truck size={14} />
                            Kirim
                          </button>
                        )}

                      {order.status === "shipped" &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "delivered")
                            }
                            className="btn btn-sm btn-success"
                            disabled={updatingOrderId === order.id}
                          >
                            <Package size={14} />
                            Selesaikan
                          </button>
                        )}

                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "cancelled")
                            }
                            className="btn btn-sm btn-danger"
                            disabled={updatingOrderId === order.id}
                          >
                            <XCircle size={14} />
                            Batalkan
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;

              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`pagination-btn ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Selanjutnya
            <ChevronRight size={16} />
          </button>

          <div className="pagination-info">
            Menampilkan {indexOfFirstOrder + 1}-
            {Math.min(indexOfLastOrder, filteredOrders.length)} dari{" "}
            {filteredOrders.length} pesanan
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListAdmin;

<style jsx>{`
  .order-management {
    padding: 20px;
    background-color: #f4f4f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .order-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .order-header h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .order-stats {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }

  .stat-badge {
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 14px;
    color: white;
    display: inline-block;
    background-color: #007bff;
    transition: background-color 0.3s;
  }

  .stat-badge:hover {
    background-color: #0056b3;
  }

  .order-filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
  }

  .search-input:focus {
    border-color: #007bff;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    font-size: 16px;
    color: #007bff;
  }

  .status-filter,
  .items-per-page-select {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    background-color: white;
    transition: border-color 0.3s;
    flex-shrink: 0;
  }

  .status-filter:focus,
  .items-per-page-select:focus {
    border-color: #007bff;
    outline: none;
  }

  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }

  .btn-outline {
    background-color: transparent;
    color: #007bff;
    border: 1px solid #007bff;
  }

  .btn-outline:hover {
    background-color: #007bff;
    color: white;
  }

  .orders-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .order-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s;
  }

  .order-card:hover {
    transform: translateY(-2px);
  }

  .order-header-card {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .order-basic-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .order-id {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-id h4 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  .order-date {
    margin: 0;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .order-customer-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .customer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #007bff;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 18px;
  }

  .customer-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .customer-details h5 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .customer-details p {
    margin: 0;
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .order-amount {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .order-status-container {
    display: flex;
    justify-content: flex-end;
  }

  .order-status {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .order-actions-header {
    display: flex;
    justify-content: flex-end;
  }

  .order-details {
    padding: 15px;
    background-color: #fafafa;
    border-radius: 6px;
    margin: 10px 0;
  }

  .order-items-section {
    margin-bottom: 15px;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  .order-item {
    background: white;
    border-radius: 4px;
    padding: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .item-info h6 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }

  .item-info p {
    margin: 0;
    font-size: 12px;
    color: #666;
  }

  .order-actions-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .status-buttons {
    display: flex;
    gap: 10px;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }

  .pagination-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pagination-btn:hover {
    background-color: #007bff;
    color: white;
  }

  .pagination-numbers {
    display: flex;
    gap: 5px;
  }

  .pagination-info {
    font-size: 14px;
    color: #666;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    font-size: 16px;
    color: #666;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }

  .loading-container {
    text-align: center;
    padding: 40px 20px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #007bff;
    border-top: 4px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .order-header {
      text-align: center;
    }

    .order-stats {
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .stat-badge {
      font-size: 12px;
      padding: 6px 10px;
    }

    .order-filters {
      flex-direction: column;
      gap: 10px;
    }

    .search-input {
      padding: 8px 30px 8px 10px;
      font-size: 12px;
    }

    .status-filter,
    .items-per-page-select {
      padding: 8px;
      font-size: 12px;
    }

    .btn {
      padding: 8px 12px;
      font-size: 12px;
    }

    .orders-list {
      grid-template-columns: 1fr;
    }

    .order-card {
      transition: none;
    }

    .order-header-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .order-basic-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .order-id {
      flex-direction: column;
      align-items: flex-start;
    }

    .order-id h4 {
      font-size: 16px;
    }

    .order-date {
      font-size: 12px;
    }

    .customer-avatar {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    .customer-details h5 {
      font-size: 14px;
    }

    .customer-details p {
      font-size: 10px;
    }

    .order-amount {
      font-size: 14px;
    }

    .order-status {
      font-size: 12px;
      padding: 4px 8px;
    }

    .order-details {
      padding: 10px;
    }

    .order-items-section {
      margin-bottom: 10px;
    }

    .items-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }

    .order-item {
      padding: 8px;
    }

    .item-image {
      width: 50px;
      height: 50px;
    }

    .item-info h6 {
      font-size: 12px;
    }

    .item-info p {
      font-size: 10px;
    }

    .order-actions-section {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 5px;
    }

    .status-buttons {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 5px;
    }

    .pagination {
      flex-direction: column;
      align-items: flex-start;
    }

    .pagination-btn {
      padding: 6px 10px;
      font-size: 12px;
    }

    .pagination-info {
      font-size: 12px;
    }
  }
`}</style>;
