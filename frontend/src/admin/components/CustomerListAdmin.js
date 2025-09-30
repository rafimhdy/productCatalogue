import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Plus,
  X,
  Save,
  Mail,
  User,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MapPin,
} from "lucide-react";
import "./css/CustomerAdmin.css";

const CustomerListAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers when search changes
  useEffect(() => {
    let filtered = [...customers];

    if (search) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(search.toLowerCase()) ||
          customer.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [customers, search]);

  // Pagination calculations
  const indexOfLastCustomer = currentPage * itemsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        "http://localhost:5000/api/customers/admin/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/orders/admin/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customer orders");
      }

      const data = await response.json();
      setCustomerOrders(data);
    } catch (err) {
      console.error("Error fetching customer orders:", err);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/customers/admin/${customerId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }

      const data = await response.json();
      setCustomerDetails(data);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setCustomerDetails(null);
    }
  };

  const fetchLoginHistory = async (customerId) => {
    setLoadingLoginHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/customers/admin/${customerId}/login-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch login history");
      }

      const data = await response.json();
      setLoginHistory(data);
    } catch (err) {
      console.error("Error fetching login history:", err);
      setLoginHistory([]);
    } finally {
      setLoadingLoginHistory(false);
    }
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    fetchCustomerOrders(customer.id);
    fetchCustomerDetails(customer.id);
    fetchLoginHistory(customer.id);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setCustomerDetails(null);
    setLoginHistory([]);
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "Belum pernah";

    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Truncate user agent string for cleaner display
  const formatUserAgent = (userAgent) => {
    if (!userAgent) return "-";

    // Extract browser and OS information
    let browser = "Unknown";
    let os = "Unknown";

    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
      browser = "Internet Explorer";
    }

    if (userAgent.includes("Windows")) {
      os = "Windows";
    } else if (userAgent.includes("Mac")) {
      os = "Mac OS";
    } else if (userAgent.includes("Android")) {
      os = "Android";
    } else if (
      userAgent.includes("iOS") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    ) {
      os = "iOS";
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
    }

    return `${browser} / ${os}`;
  };

  if (loading) {
    return (
      <div className="customer-management">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Memuat data customer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-management">
        <div className="error-container">
          <Users size={48} />
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchCustomers} className="btn btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      <div className="customer-header">
        <h2>
          <Users size={28} />
          Manajemen Customer
        </h2>
        <div className="customer-stats">
          <span style={{ color: "whitesmoke" }} className="stat-badge total">
            <Users size={16} />
            Total: {filteredCustomers.length} customer
          </span>
          <span className="stat-badge active">
            <User size={16} />
            Aktif: {filteredCustomers.filter((c) => !c.deleted_at).length}
          </span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="customer-controls">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari customer berdasarkan nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

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

        <button onClick={() => setSearch("")} className="btn btn-outline">
          <Filter size={16} />
          Reset Filter
        </button>
      </div>

      {/* Customers List */}
      {currentCustomers.length === 0 ? (
        <div className="empty-state">
          <Users
            style={{ color: "whitesmoke" }}
            size={64}
            className="empty-icon"
          />
          <h3>Tidak ada customer ditemukan</h3>
          <p>Coba ubah kata kunci pencarian Anda</p>
        </div>
      ) : (
        <div className="customers-grid">
          {currentCustomers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div style={{ color: "whitesmoke" }} className="customer-avatar">
                <User size={32} />
              </div>

              <div className="customer-info">
                <h4 className="customer-name">{customer.name}</h4>
                <div className="customer-details">
                  <p>
                    <Mail size={14} />
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p>
                      <Phone size={14} />
                      {customer.phone}
                    </p>
                  )}
                  <p>
                    <Calendar size={14} />
                    Bergabung: {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>

              <div className="customer-actions">
                <button
                  onClick={() => handleViewDetail(customer)}
                  className="btn btn-primary btn-sm"
                >
                  <Eye size={14} />
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Pagination */}
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
            Menampilkan {indexOfFirstCustomer + 1}-
            {Math.min(indexOfLastCustomer, filteredCustomers.length)} dari{" "}
            {filteredCustomers.length} customer
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-content customer-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Detail Customer</h3>
              <button className="modal-close" onClick={closeDetailModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-detail-profile">
                <div className="customer-detail-avatar">
                  <User size={48} />
                </div>
                <div className="customer-detail-info">
                  <h2 className="customer-detail-name">
                    {selectedCustomer.name}
                  </h2>
                  <div className="customer-detail-meta">
                    <span className="detail-badge">
                      {selectedCustomer.deleted_at ? "Tidak Aktif" : "Aktif"}
                    </span>
                    <span className="detail-badge customer-id">
                      ID: {selectedCustomer.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="customer-detail-grid">
                <div className="detail-card">
                  <h4 className="detail-card-title">
                    <Mail size={18} />
                    Informasi Kontak
                  </h4>
                  <div className="detail-card-content">
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Telepon</span>
                      <span className="detail-value">
                        {selectedCustomer.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <h4 className="detail-card-title">
                    <Calendar size={18} />
                    Informasi Akun
                  </h4>
                  <div className="detail-card-content">
                    <div className="detail-item">
                      <span className="detail-label">Bergabung</span>
                      <span className="detail-value">
                        {formatDate(selectedCustomer.created_at)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Login Terakhir</span>
                      <span className="detail-value">
                        {selectedCustomer.last_login
                          ? formatDate(selectedCustomer.last_login)
                          : "Belum pernah login"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="customer-detail-section">
                <h4 className="section-title">
                  <ShoppingCart size={18} />
                  Riwayat Pesanan ({customerOrders.length})
                </h4>

                {loadingOrders ? (
                  <div className="loading-inline">
                    <div className="spinner-small"></div>
                    <span>Memuat riwayat pesanan...</span>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <p className="no-data-message">Belum ada pesanan</p>
                ) : (
                  <div className="order-history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tanggal</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{formatDate(order.created_at)}</td>
                            <td>{formatCurrency(order.total_price)}</td>
                            <td>
                              <span className={`table-status ${order.status}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="customer-detail-section">
                <h4 className="section-title">
                  <User size={18} />
                  Riwayat Login
                </h4>

                {loadingLoginHistory ? (
                  <div className="loading-inline">
                    <div className="spinner-small"></div>
                    <span>Memuat riwayat login...</span>
                  </div>
                ) : loginHistory.length === 0 ? (
                  <p className="no-data-message">Belum ada riwayat login</p>
                ) : (
                  <div className="login-history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Waktu</th>
                          <th>IP Address</th>
                          <th>Lokasi</th>
                          <th>Perangkat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistory.map((login, index) => (
                          <tr key={index}>
                            <td>{formatDate(login.timestamp)}</td>
                            <td>
                              {new Date(login.timestamp).toLocaleTimeString(
                                "id-ID"
                              )}
                            </td>
                            <td>{login.ip_address}</td>
                            <td>{login.location || "-"}</td>
                            <td>{formatUserAgent(login.user_agent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListAdmin;
