import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/AdminManagement.css";
import { Plus, Edit, Trash, X } from "lucide-react";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://31.97.109.187:5000/api/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      const data = await response.json();
      setAdmins(data);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch admins: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://31.97.109.187:5000/api/admin/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      setError("Failed to add admin");
      console.error("Error:", err);
    }
  };

  // Edit admin
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://31.97.109.187:5000/api/admin/${selectedAdmin.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowEditModal(false);
      setSelectedAdmin(null);
      setFormData({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      setError("Failed to update admin");
      console.error("Error:", err);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://31.97.109.187:5000/api/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
    } catch (err) {
      setError("Failed to delete admin");
      console.error("Error:", err);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Don't show existing password
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Manajemen Admin</h2>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            Tambah Admin
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>#{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tambah Admin</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="admin-form">
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="submit-btn">
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Admin</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditAdmin} className="admin-form">
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Password Baru (kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="submit-btn">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
