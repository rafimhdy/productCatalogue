import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  User,
  Heart,
  Settings,
  Lock,
  Mail,
  Phone,
  Bell,
  ChevronDown,
  Menu,
  X,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import "./css/CustomerDashboard.css";

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [customerData, setCustomerData] = useState({});
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    newsletter_preference: false,
    product_categories_preference: [],
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  // Reset success and error messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch customer data
      const customerResponse = await fetch(
        "http://localhost:5000/api/customers/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomerData(customerData);
        setProfileForm({
          name: customerData.name || "",
          phone: customerData.phone || "",
          newsletter_preference: customerData.newsletter_preference || false,
          product_categories_preference:
            customerData.product_categories_preference || [],
        });
      }

      // Fetch categories
      const categoriesResponse = await fetch(
        "http://localhost:5000/api/categories"
      );
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Fetch wishlist
      const wishlistResponse = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlist(wishlistData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setErrorMessage("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/customers/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileForm),
        }
      );

      if (response.ok) {
        setSuccessMessage("Profil berhasil diperbarui!");
        fetchDashboardData();
      } else {
        setErrorMessage("Gagal memperbarui profil");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan saat memperbarui profil");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/customers/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Password berhasil diubah!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Gagal mengubah password");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan saat mengubah password");
    }
  };

  const handleWishlistRemove = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setSuccessMessage("Produk dihapus dari wishlist");
        fetchDashboardData();
      } else {
        setErrorMessage("Gagal menghapus dari wishlist");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="tab-content">
            <h2>
              <User size={24} />
              Profil Saya
            </h2>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={customerData.email || ""}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={profileForm.newsletter_preference}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        newsletter_preference: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="newsletter">
                    <Bell size={16} />
                    Berlangganan newsletter
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Kategori Produk Favorit</label>
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div key={category.id} className="category-checkbox">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={profileForm.product_categories_preference.includes(
                          category.id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileForm({
                              ...profileForm,
                              product_categories_preference: [
                                ...profileForm.product_categories_preference,
                                category.id,
                              ],
                            });
                          } else {
                            setProfileForm({
                              ...profileForm,
                              product_categories_preference:
                                profileForm.product_categories_preference.filter(
                                  (id) => id !== category.id
                                ),
                            });
                          }
                        }}
                      />
                      <label htmlFor={`category-${category.id}`}>
                        {category.category_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                Simpan Perubahan
              </button>
            </form>
          </div>
        );

      case "wishlist":
        return (
          <div className="tab-content">
            <h2>
              <Heart size={24} />
              Wishlist Saya
            </h2>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <Heart size={64} />
                <h3>Wishlist Kosong</h3>
                <p>Belum ada produk yang ditambahkan ke wishlist</p>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((item) => {
                  // Backend returns: id (wishlist id), product_id, name, price, image_url, description, stock
                  const productId = item.product_id || item.id; // fallback
                  const name = item.name || item.product_name || "Produk";
                  const rawPrice = item.price ?? item.product_price;
                  const priceNumber = Number(rawPrice);
                  const displayPrice = isNaN(priceNumber)
                    ? "Tidak tersedia"
                    : "Rp " + priceNumber.toLocaleString("id-ID");
                  const imageUrl = item.image_url
                    ? item.image_url.startsWith("http")
                      ? item.image_url
                      : `http://localhost:5000/uploads/${item.image_url}`
                    : "https://via.placeholder.com/300x200?text=No+Image";
                  const description =
                    item.description ||
                    item.product_description ||
                    "Tidak ada deskripsi.";
                  return (
                    <div
                      key={item.id + "_" + productId}
                      className="wishlist-item"
                    >
                      <img
                        src={imageUrl}
                        alt={name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                      <div className="wishlist-item-content">
                        <h4>{name}</h4>
                        <p className="price">{displayPrice}</p>
                        {typeof item.stock !== "undefined" && (
                          <p
                            className={`stock-info ${
                              item.stock === 0
                                ? "out"
                                : item.stock < 5
                                ? "low"
                                : ""
                            }`}
                          >
                            Stok: {item.stock}
                          </p>
                        )}
                        <p className="description">{description}</p>
                        <div className="wishlist-actions">
                          <button
                            onClick={() => handleWishlistRemove(productId)}
                            className="btn btn-danger"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => navigate(`/product/${productId}`)}
                            className="btn btn-primary"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="tab-content">
            <h2>
              <Settings size={24} />
              Pengaturan
            </h2>

            <div className="settings-section">
              <h3>
                <Lock size={20} />
                Ubah Password
              </h3>

              <form onSubmit={handlePasswordUpdate} className="password-form">
                <div className="form-group">
                  <label>Password Saat Ini</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPassword.current ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Password Baru</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPassword.new ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Konfirmasi Password Baru</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPassword.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <Lock size={16} />
                  Ubah Password
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="customer-dashboard">
          <div className="dashboard-container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="customer-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Dashboard Customer</h1>
            <p>
              Selamat datang kembali,{" "}
              {customerData.name || user?.name || "Customer"}!
            </p>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="mobile-nav-toggle">
            <button
              className={`mobile-nav-button ${showMobileNav ? "active" : ""}`}
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <span>Dashboard Menu</span>
              {showMobileNav ? (
                <X size={20} />
              ) : (
                <ChevronDown size={20} className="arrow" />
              )}
            </button>
          </div>

          <div className="dashboard-content">
            {/* Sidebar Navigation */}
            <div className={`dashboard-sidebar ${showMobileNav ? "show" : ""}`}>
              <div className="tab-buttons">
                <button
                  className={`tab-button ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("profile");
                    setShowMobileNav(false);
                  }}
                >
                  <User size={20} />
                  Profil
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "wishlist" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("wishlist");
                    setShowMobileNav(false);
                  }}
                >
                  <Heart size={20} />
                  Wishlist
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "settings" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("settings");
                    setShowMobileNav(false);
                  }}
                >
                  <Settings size={20} />
                  Pengaturan
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">{renderTabContent()}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
