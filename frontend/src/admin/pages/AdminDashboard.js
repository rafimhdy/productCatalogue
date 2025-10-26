import React, { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddProductForm from "../components/AddProductForm";
import ProductListAdmin from "../components/ProductListAdmin";
import CategoryListAdmin from "../components/CategoryListAdmin";
import AddCategoryForm from "../components/AddCategoryForm";
import AdminSettingsTabs from "../components/AdminSettingsTabs";
import CustomerListAdmin from "../components/CustomerListAdmin";
import OrderListAdmin from "../components/OrderListAdmin";

// Lucide React Icons
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Settings,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  Menu,
  X,
  Package2,
  UserCheck,
  Clock,
  CheckCircle,
} from "lucide-react";

import { AuthContext } from "../../AuthContext";
import "./css/AdminDashboard.css";
import { Navbar } from "react-bootstrap";

const DashboardCharts = lazy(() => import("../components/DashboardCharts"));

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const AdminDashboard = () => {
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [refreshCategories, setRefreshCategories] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "admin") {
      logout();
      navigate("/login");
    }
  }, [navigate, logout]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    fetchCategories();
  }, [refreshProducts, page]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.value || [];
      setProducts(items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/orders/admin/all?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.value || [];
      setOrders(items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/customers/admin/all?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.value || [];
      setCustomers(items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.value || [];
      setCategories(items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (selectedPage) => {
    setPage(selectedPage);
    setShowMobileNav(false);
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const totalOrders = orders.length;
  const totalCustomers = customers.length;

  // Calculate recent orders stats
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalRevenue = orders.reduce(
    (sum, order) =>
      order.status !== "cancelled"
        ? sum + (Number(order.total_price) || 0)
        : sum,
    0
  );

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderDashboardOverview = () => (
    <div>
      {/* Dashboard Stats - 4 Columns */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Package size={24} />
            </div>
          </div>
          <h3>{totalProducts}</h3>
          <p>Total Produk</p>
        </div>

        <div className={`stat-card ${lowStockCount > 0 ? "low-stock" : ""}`}>
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <AlertTriangle size={24} />
            </div>
          </div>
          <h3>{lowStockCount}</h3>
          <p>Stok Menipis</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <ShoppingCart size={24} />
            </div>
          </div>
          <h3>{totalOrders}</h3>
          <p>Total Pesanan</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Users size={24} />
            </div>
          </div>
          <h3>{totalCustomers}</h3>
          <p>Total Pelanggan</p>
        </div>
      </div>

      {/* Charts Section */}
      <Suspense
        fallback={
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Memuat grafik...</p>
          </div>
        }
      >
        <DashboardCharts
          orders={orders}
          products={products}
          categories={categories}
        />
      </Suspense>

      {/* Recent Orders Section */}
      <div className="recent-orders">
        <div className="recent-orders-header">
          <h3>Pesanan Terbaru</h3>
          <button
            className="view-all-btn"
            onClick={() => handleTabChange("orders")}
          >
            Lihat Semua
          </button>
        </div>
        <div className="recent-orders-list">
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Belum ada pesanan</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="recent-order-item">
                <div className="recent-order-avatar">
                  {order.customer_name
                    ? order.customer_name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div className="recent-order-info">
                  <h4>Pesanan #{order.id}</h4>
                  <p>
                    {order.customer_name} • {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="recent-order-amount">
                  {formatCurrency(order.total_price)}
                </div>
                <span className={`recent-order-status ${order.status}`}>
                  {order.status === "pending" && <Clock size={12} />}
                  {order.status === "delivered" && <CheckCircle size={12} />}
                  {order.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Dashboard Admin</h1>
          <p>Kelola toko online Anda dengan mudah</p>
        </div>

        {/* Mobile Navigation Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setShowMobileNav(!showMobileNav)}
        >
          {showMobileNav ? <X size={20} /> : <Menu size={20} />}
          {showMobileNav ? "Tutup Menu" : "Menu Admin"}
        </button>

        <div className="admin-content">
          {/* Sidebar Navigation */}
          <div className={`admin-sidebar ${showMobileNav ? "show" : ""}`}>
            <div className="admin-nav">
              <button
                className={`admin-nav-item ${
                  page === "dashboard" ? "active" : ""
                }`}
                onClick={() => handleTabChange("dashboard")}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              <button
                className={`admin-nav-item ${
                  page === "products" ? "active" : ""
                }`}
                onClick={() => handleTabChange("products")}
              >
                <Package size={20} />
                Produk
              </button>
              <button
                className={`admin-nav-item ${
                  page === "categories" ? "active" : ""
                }`}
                onClick={() => handleTabChange("categories")}
              >
                <FolderOpen size={20} />
                Kategori
              </button>
              <button
                className={`admin-nav-item ${
                  page === "orders" ? "active" : ""
                }`}
                onClick={() => handleTabChange("orders")}
              >
                <ShoppingCart size={20} />
                Pesanan
              </button>
              <button
                className={`admin-nav-item ${
                  page === "customers" ? "active" : ""
                }`}
                onClick={() => handleTabChange("customers")}
              >
                <Users size={20} />
                Pelanggan
              </button>
              <button
                className={`admin-nav-item ${
                  page === "settings" ? "active" : ""
                }`}
                onClick={() => handleTabChange("settings")}
              >
                <Settings size={20} />
                Pengaturan
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                borderTop: "1px solid #f1f5f9",
                marginTop: "16px",
              }}
            >
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Keluar
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-main">
            {page === "dashboard" && renderDashboardOverview()}

            {page === "products" && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <AddProductForm
                    onProductAdded={() => setRefreshProducts(!refreshProducts)}
                    categories={categories}
                  />
                </div>
                <ProductListAdmin />
              </div>
            )}

            {page === "categories" && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <AddCategoryForm
                    onCategoryAdded={() =>
                      setRefreshCategories(!refreshCategories)
                    }
                  />
                </div>
                <CategoryListAdmin />
              </div>
            )}

            {page === "orders" && <OrderListAdmin />}

            {page === "customers" && (
              <CustomerListAdmin key={`customers-${Date.now()}`} />
            )}

            {page === "settings" && <AdminSettingsTabs />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
