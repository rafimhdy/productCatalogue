import React, { useState, useEffect, useRef } from "react";
import ProductDetailModal from "./ProductDetailModal";
import { useNotification } from "./NotificationContext";
import "./css/BestSellers.css";
import { Star, ShoppingCart, Award } from "lucide-react";

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [cardTransforms, setCardTransforms] = useState({});
  const rafRefs = useRef({});
  const { notify } = useNotification();

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/best-sellers?limit=3"
      ); // Only fetch 3 products
      if (response.ok) {
        const data = await response.json();
        setBestSellers(data || []);
      } else {
        setError("Failed to fetch best sellers");
      }
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      setError("Failed to load best sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login untuk memberikan ulasan.", "info");
      return false;
    }
    if (!reviewData || !reviewData.product_id) {
      console.error("Invalid review data from modal", reviewData);
      notify("Data ulasan tidak valid", "error");
      return false;
    }
    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: reviewData.product_id,
          order_id: reviewData.order_id,
          rating: reviewData.rating,
          review_text: reviewData.review_text,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        notify("Ulasan berhasil dikirim!", "success");
        handleCloseModal();
        fetchBestSellers();
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

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login terlebih dahulu.", "info");
      return;
    }
    try {
      setAddingToCartId(product.id);
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("Produk ditambahkan ke keranjang", "success");
      } else {
        notify(data.message || "Gagal menambahkan ke keranjang", "error");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      notify("Terjadi kesalahan server", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  // safe numeric parser
  const toNumber = (val, fallback = 0) => {
    if (val === null || val === undefined) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const renderStars = (ratingInput, totalReviews) => {
    const rating = toNumber(ratingInput, 0);
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={16}
            fill="#fbbf24"
            stroke="#fbbf24"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        );
      } else {
        stars.push(<Star key={i} size={16} stroke="#d1d5db" />);
      }
    }

    return (
      <div className="rating-stars">
        {stars}
        <span className="rating-text">
          ({rating.toFixed(1)} • {totalReviews} ulasan)
        </span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCardMouseMove = (e, id) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.
    const px = x / rect.width - 0.5; // -0.5 .. 0.5
    const py = y / rect.height - 0.5;

    // throttle with rAF per id
    if (rafRefs.current[id]) cancelAnimationFrame(rafRefs.current[id]);
    rafRefs.current[id] = requestAnimationFrame(() => {
      const rotateY = px * 6; // degrees
      const rotateX = -py * 6; // degrees
      const translateX = px * 6; // px
      const translateY = py * 6; // px
      setCardTransforms((prev) => ({
        ...prev,
        [id]: `perspective(900px) translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }));
    });
  };

  const handleCardMouseLeave = (e, id) => {
    if (rafRefs.current[id]) cancelAnimationFrame(rafRefs.current[id]);
    setCardTransforms((prev) => ({ ...prev, [id]: "none" }));
  };

  const renderProductCard = (product, index, extraClass = "") => (
    <div
      key={product.id}
      className={`best-seller-card ${extraClass}`}
      onClick={() => handleProductClick(product)}
      onMouseMove={(e) => handleCardMouseMove(e, product.id)}
      onMouseLeave={(e) => handleCardMouseLeave(e, product.id)}
      style={{ transform: cardTransforms[product.id] || undefined }}
    >
      <div className="card-inner">
        <div className="rank-badge">#{index + 1}</div>
        <div className="product-image">
          <img
            src={
              product.image_url
                ? product.image_url.startsWith("http")
                  ? product.image_url
                  : `http://localhost:5000/uploads/${product.image_url}`
                : "/placeholder-product.jpg"
            }
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-product.jpg";
            }}
          />
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-category">{product.category_name}</p>
          {renderStars(product.average_rating, product.total_reviews)}
          <div className="product-price">{formatCurrency(product.price)}</div>
          <div className="product-stats">
            <span className="sold-count">{product.total_sold} terjual</span>
            <span className="stock-count">Stok: {product.stock}</span>
          </div>
          <button
            className="add-to-cart-btn"
            disabled={addingToCartId === product.id}
            onClick={(e) => handleAddToCart(e, product)}
          >
            <ShoppingCart size={16} />
            {addingToCartId === product.id
              ? "Menambah..."
              : "Tambah ke Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );

  const trioClass = `best-sellers-trio count-${bestSellers.length} ${
    bestSellers.length === 3 ? "trio-3" : "trio-n"
  }`;

  if (loading) {
    return (
      <section className="best-sellers-section">
        <div className="container">
          <div className="section-header">
            <h2>
              <Award size={32} />
              Best Sellers
            </h2>
            <p>Produk terlaris pilihan pelanggan</p>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Memuat produk terlaris...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="best-sellers-section">
        <div className="container">
          <div className="section-header">
            <h2>
              <Award size={32} />
              Best Sellers
            </h2>
            <p>Produk terlaris pilihan pelanggan</p>
          </div>
          <div className="error-state">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="best-sellers" className="best-sellers-section">
      <div className="container">
        <div className="section-header">
          <h2>
            <Award size={32} />
            Best Sellers
          </h2>
          <p>Produk terlaris pilihan pelanggan</p>
        </div>

        {bestSellers.length === 0 ? (
          <div className="empty-state">
            <Award size={64} />
            <h3>Belum ada produk terlaris</h3>
            <p>
              Produk terlaris akan muncul di sini berdasarkan penjualan dan
              rating
            </p>
          </div>
        ) : (
          <div className="best-sellers-container">
            <div className={trioClass}>
              {bestSellers.slice(0, 3).map((p, i) => {
                const cls =
                  i === 0
                    ? "position-one"
                    : i === 1
                    ? "position-two"
                    : "position-three";
                return renderProductCard(p, i, cls);
              })}
            </div>
          </div>
        )}
      </div>{" "}
      {/* close .container */}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </section>
  );
};

export default BestSellers;
