import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Komponen terpisah untuk setiap item di keranjang
const CartItem = ({ item, onUpdate, onRemove }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

  // Process image URL to handle both external URLs and local uploaded files
  const getProcessedImageUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL, return as is
    if (url.startsWith("http")) {
      return url;
    }

    // If it's a local file path, prepend the server URL
    if (url.startsWith("/uploads/")) {
      return `${API_BASE}${url}`;
    }

    // If it's just a filename, assume it's in uploads
    if (!url.includes("/") && !url.startsWith("http")) {
      return `${API_BASE}/uploads/${url}`;
    }

    return url;
  };

  const imageUrl = getProcessedImageUrl(item.image_url);

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "center",
        padding: "15px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ flexShrink: 0, position: "relative" }}>
        {imageError || !imageUrl ? (
          // Fallback placeholder when image is missing or broken
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #ccc",
              flexDirection: "column",
            }}
          >
            <span
              style={{ color: "#999", fontSize: "10px", textAlign: "center" }}
            >
              📷
            </span>
            <span
              style={{ color: "#999", fontSize: "10px", textAlign: "center" }}
            >
              No Image
            </span>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #eee",
                }}
              >
                <span style={{ color: "#999", fontSize: "12px" }}>
                  Loading...
                </span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={item.products_name}
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #eee",
                display: imageLoading ? "none" : "block",
              }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </>
        )}
      </div>
      <div style={{ flexGrow: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, color: "#333" }}>{item.products_name}</h5>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 5,
                background: item.quantity <= 1 ? "#f8f8f8" : "#f0f0f0",
                cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                color: item.quantity <= 1 ? "#ccc" : "#333",
              }}
            >
              -
            </button>
            <span
              style={{
                minWidth: "30px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 5,
                background: "#f0f0f0",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
        </div>
        <p
          style={{
            margin: "8px 0",
            fontWeight: "bold",
            color: "#2c5aa0",
            fontSize: 16,
          }}
        >
          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12, color: "#888" }}>
          Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
        </p>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => onRemove(item.id)}
            style={{
              background: "none",
              border: "1px solid #dc3545",
              color: "#dc3545",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: 12,
              borderRadius: 4,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#dc3545";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#dc3545";
            }}
          >
            🗑️ Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Tambahkan kelas override saat komponen dimuat
    document.body.classList.add("cart-bg-override");

    // Hapus kelas saat komponen dilepas (misalnya, saat pindah halaman)
    return () => {
      document.body.classList.remove("cart-bg-override");
    };
  }, []);

  useEffect(() => {
    checkAuthAndFetchCart();
  }, []);

  const checkAuthAndFetchCart = async () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    // Check if user is authenticated and is a customer
    if (!token || userRole !== "customer") {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    await fetchCart();
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        // Token invalid or expired
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch cart`);
      }

      const data = await res.json();
      console.log("Cart data received:", data); // Debug log
      setCartItems(data.items || []);
      setLoading(false);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please login again.");
        handleLogin();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        return alert(data.message || "Failed to update quantity");
      }

      await fetchCart(); // Refresh cart data
    } catch (err) {
      console.error("Update quantity error:", err);
      alert("Gagal update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Hapus item dari keranjang?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ itemId }),
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please login again.");
        handleLogin();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        return alert(data.message || "Failed to remove item");
      }

      await fetchCart(); // Refresh cart data
    } catch (err) {
      console.error("Remove item error:", err);
      alert("Gagal menghapus item");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong! Tambahkan produk terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please login again.");
        handleLogin();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Checkout failed");
      }

      // Redirect to payment page instead of opening WhatsApp directly
      navigate(`/payment/${data.orderId}`);

      await fetchCart(); // Refresh to show empty cart after checkout
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Gagal checkout");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login prompt for unauthenticated users (tanpa Navbar, sudah di App.js)
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            border: "2px solid #e0e0e0",
            borderRadius: "12px",
            backgroundColor: "#f9f9f9",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ color: "#333", marginBottom: "20px" }}>
            🛒 Akses Keranjang Belanja
          </h2>
          <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.6" }}>
            Anda perlu login sebagai customer untuk melihat keranjang belanja
            dan melakukan pemesanan.
          </p>
          <button
            onClick={handleLogin}
            style={{
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "80px 20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            border: "2px solid #e0e0e0",
            borderRadius: "12px",
            backgroundColor: "#f9f9f9",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ color: "#333", marginBottom: "20px" }}>
            🛒 Keranjang Kosong
          </h2>
          <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.6" }}>
            Keranjang belanja Anda masih kosong. Mari mulai berbelanja!
          </p>
          <button
            onClick={() => navigate("/customer/home")}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Mulai Belanja
          </button>
        </div>
      </div>
    );
  }

  // Show cart with items
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "100px 20px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 0 }}>Keranjang Anda</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Kolom Kiri: Daftar Item */}
        <div style={{ flex: 2, minWidth: 300 }}>
          <div
            style={{
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <h4>Keranjang ({cartItems.length} items)</h4>
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>
        {/* Kolom Kanan: Ringkasan Total & Checkout */}
        <div
          style={{
            flex: 1,
            minWidth: 250,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <h4>Ringkasan Pesanan</h4>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span>Subtotal</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <span>Pengiriman</span>
              <span>Gratis</span>
            </div>
            <hr />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              <span>Total</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            style={{
              padding: "15px 20px",
              backgroundColor: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
