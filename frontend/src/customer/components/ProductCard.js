import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X, Heart } from "lucide-react";
import { useNotification } from "./NotificationContext";
import { AuthContext } from "../../AuthContext";
import "./css/ProductCard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const ProductCard = ({
  product = {
    id: 1,
    name: "Sample Product",
    price: "150,000",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  },
  onProductClick,
}) => {
  const { notify } = useNotification();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Fallback behavior - only navigate if no onProductClick provided
      navigate(`/product/${product.id}`);
    }
  };

  // Check wishlist status when component mounts
  useEffect(() => {
    if (user?.role === "customer") {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/api/wishlist/check/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent card click

    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login untuk menambahkan ke wishlist", "info");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      const url = isInWishlist
        ? `${API_BASE}/api/wishlist/remove/${product.id}`
        : `${API_BASE}/api/wishlist/add`;

      const method = isInWishlist ? "DELETE" : "POST";
      const body = isInWishlist
        ? undefined
        : JSON.stringify({ productId: product.id });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(body && { body }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        notify(
          isInWishlist
            ? "Produk dihapus dari wishlist"
            : "Produk ditambahkan ke wishlist",
          "success"
        );
      } else {
        notify(data.message || "Gagal mengubah wishlist", "error");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      notify("Gagal mengubah wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login untuk menambahkan produk ke keranjang", "info");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok)
        return notify(data.message || "Gagal menambahkan produk", "error");

      notify("Produk berhasil ditambahkan ke cart!", "success");
      setClicked(true);
    } catch (err) {
      console.error(err);
      notify("Gagal menambahkan produk", "error");
    }
  };

  const handleRemove = () => setClicked(false);

  return (
    <div
      className={`product-card-root anim-hover-lift ${
        clicked ? "is-clicked" : ""
      }`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {Number(product.is_best_seller) === 1 &&
      Number(product.best_seller_rank) > 0 ? (
        <div className="best-seller-mini-badge">
          #{product.best_seller_rank}
        </div>
      ) : null}
      {/* Wishlist Heart Icon */}
      {user?.role === "customer" && (
        <button
          onClick={handleWishlistToggle}
          className={`wishlist-button ${isInWishlist ? "in-wishlist" : ""} ${
            wishlistLoading ? "loading" : ""
          }`}
          disabled={wishlistLoading}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={20}
            fill={isInWishlist ? "#dc2626" : "none"}
            color={isInWishlist ? "#dc2626" : "#64748b"}
          />
        </button>
      )}

      {/* Gambar Produk */}
      <div className="product-image-container">
        <img
          src={
            product.image
              ? `${API_BASE}/uploads/${product.image}`
              : product.image_url
          }
          alt={product.name}
          loading="lazy"
        />
      </div>

      {/* Bottom sliding bar (mengandung dua panel) */}
      <div className="product-sliding-bar">
        {/* 1. Panel Normal: Detail & Tombol Add to Cart */}
        <div className="product-add-section">
          <div className="product-detail-text">
            <h4 className="product-name">{product.name}</h4>
            <p className="product-price">Rp{product.price}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="product-cart-button"
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* 2. Panel Konfirmasi: Confirmation & Tombol Remove */}
        <div className="product-confirm-section">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="product-remove-button"
            aria-label="Remove from cart"
          >
            <X size={20} />
          </button>
          <div className="product-confirm-text">
            <h4>{product.name}</h4>
            <p>Added to cart</p>
          </div>
          <div className="placeholder-div" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
