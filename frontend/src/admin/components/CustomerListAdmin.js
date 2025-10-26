import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  Plus,
  X,
  Mail,
  User,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./css/CustomerAdmin.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

// Cache busting version - increment ini untuk force refresh
const CACHE_VERSION = Date.now();

const CustomerListAdmin = () => {
  console.log(
    "CustomerListAdmin component rendered at:",
    new Date().toISOString(),
    "Version:",
    CACHE_VERSION
  );
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // CRUD states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [search, customers]);

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

      // Add cache-busting parameter
      const url = `${API_BASE}/api/customers/admin/all?t=${Date.now()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus customer ini?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/customers/admin/${customerId}?t=${Date.now()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          alert("Token kadaluarsa. Silakan login ulang sebagai admin.");
          // Redirect to login or logout
          window.location.href = "/admin/login";
          return;
        }
        alert("Gagal menghapus customer");
      } else {
        setCustomers(
          customers.filter((customer) => customer.id !== customerId)
        );
        alert("Customer berhasil dihapus");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Terjadi kesalahan saat menghapus customer");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const response = await fetch(
        `${API_BASE}/api/customers/admin?t=${Date.now()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: "", email: "", phone: "", password: "" });
        fetchCustomers(); // Refresh the list
        alert("Customer berhasil dibuat");
      } else {
        if (response.status === 403) {
          alert("Token kadaluarsa. Silakan login ulang sebagai admin.");
          window.location.href = "/admin/login";
          return;
        }
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          alert(data.message || "Gagal membuat customer");
        }
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Terjadi kesalahan saat membuat customer");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch(
        `${API_BASE}/api/customers/admin/${editingCustomer.id}?t=${Date.now()}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setEditingCustomer(null);
        setFormData({ name: "", email: "", phone: "", password: "" });
        fetchCustomers(); // Refresh the list
        alert("Customer berhasil diperbarui");
      } else {
        if (response.status === 403) {
          alert("Token kadaluarsa. Silakan login ulang sebagai admin.");
          window.location.href = "/admin/login";
          return;
        }
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          alert(data.message || "Gagal memperbarui customer");
        }
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Terjadi kesalahan saat memperbarui customer");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", password: "" });
    setFormErrors({});
    setEditingCustomer(null);
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

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-success"
        >
          <Plus size={16} />
          Tambah Customer
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
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>

              <div className="customer-actions">
                <button
                  onClick={() => handleEditCustomer(customer)}
                  className="btn btn-warning btn-sm"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  disabled={deleting}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  {deleting ? "Menghapus..." : "Hapus"}
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

      {/* Detail modal removed */}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Customer Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="modal-body">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className={formErrors.email ? "error" : ""}
                />
                {formErrors.email && (
                  <span className="error-text">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={formErrors.phone ? "error" : ""}
                />
                {formErrors.phone && (
                  <span className="error-text">{formErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className={formErrors.password ? "error" : ""}
                />
                {formErrors.password && (
                  <span className="error-text">{formErrors.password}</span>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCustomer} className="modal-body">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className={formErrors.email ? "error" : ""}
                />
                {formErrors.email && (
                  <span className="error-text">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={formErrors.phone ? "error" : ""}
                />
                {formErrors.phone && (
                  <span className="error-text">{formErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Password Baru (kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={formErrors.password ? "error" : ""}
                />
                {formErrors.password && (
                  <span className="error-text">{formErrors.password}</span>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? "Menyimpan..." : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListAdmin;
