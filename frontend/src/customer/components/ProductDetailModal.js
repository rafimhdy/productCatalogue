import React, { useState, useEffect } from "react";
import "./css/ProductDetailModal.css";
import SimpleStarRating from "./SimpleStarRating";
import "../../global.css";
import {
  X,
  Tag,
  MessageSquare,
  ThumbsUp,
  Send,
  ShoppingCart,
} from "lucide-react";

const ProductDetailModal = ({ product, onClose, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [displayedReviews, setDisplayedReviews] = useState(3); // Batasi jumlah review yang ditampilkan
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [orderId, setOrderId] = useState(product?.order_id || null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle click outside modal to close
  const handleModalClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.classList.add("modal-open");

    // Cleanup function untuk menghapus kelas saat komponen di-unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews();
    }
  }, [product?.id]);

  // When product has explicit order_id (opened from order history), treat that order as eligible
  useEffect(() => {
    if (product?.order_id) {
      setEligibleOrders([
        {
          order_id: product.order_id,
          order_date: product.created_at || new Date().toISOString(),
        },
      ]);
      setOrderId(product.order_id);
    }
  }, [product?.order_id, product?.created_at]);

  useEffect(() => {
    if (!product?.order_id) {
      // fetch eligible orders when modal opens for direct product view
      fetch(`http://localhost:5000/api/reviews/can-review/${product.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.canReview) {
            setEligibleOrders(data.availableOrders);
            setOrderId(
              data.availableOrders.length
                ? data.availableOrders[0].order_id
                : null
            );
          } else {
            setEligibleOrders([]);
            setOrderId(null);
          }
        })
        .catch((err) =>
          console.error("Error fetching review eligibility:", err)
        );
    }
  }, [product?.id, product?.order_id]);

  if (!product) {
    return null;
  }

  const fetchProductReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/product/${product.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.error("Failed to fetch reviews");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const finalOrderId = orderId || product.order_id;
    if (!finalOrderId) {
      alert("Pilih pesanan untuk ulasan terlebih dahulu.");
      return;
    }
    if (rating === 0) {
      alert("Silakan berikan rating untuk produk ini.");
      return;
    }
    if (reviewText.trim().length < 10) {
      alert("Review harus minimal 10 karakter.");
      return;
    }

    setSubmittingReview(true);
    const reviewData = {
      product_id: product.id,
      order_id: finalOrderId,
      rating,
      review_text: reviewText.trim(),
    };

    try {
      let success = true;
      if (onReviewSubmit) {
        const result = onReviewSubmit(reviewData);
        if (result && typeof result.then === "function") {
          success = await result;
        }
      }
      if (success) {
        setRating(0);
        setReviewText("");
        setShowSuccessMessage(true);
        fetchProductReviews(); // refresh list after successful submit
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error("Error delegating review submit:", err);
      alert("Terjadi kesalahan saat mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const renderImages = () => {
    if (!product.image_url) {
      return (
        <div className="product-detail-image placeholder">
          <div className="no-image-fallback">Tidak ada gambar</div>
        </div>
      );
    }

    // Handle both external URLs and local uploads
    return (
      <div className="product-detail-image">
        <img
          src={
            product.image_url.startsWith("http")
              ? product.image_url
              : `http://localhost:5000/uploads/${product.image_url}`
          }
          alt={product.name}
          className="main-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/logo192.png"; // fallback ke asset yang pasti ada
          }}
        />
      </div>
    );
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="modal-overlay" onClick={handleModalClick}>
      <div
        className="modal-content product-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Detail Produk</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="product-detail-content">
            {/* Left column - Product Image */}
            {renderImages()}

            {/* Right column - Product Info */}
            <div className="product-detail-info">
              <h2 className="product-detail-title">{product.name}</h2>

              {product.category_name && (
                <span className="product-detail-category">
                  <Tag size={14} />
                  {product.category_name}
                </span>
              )}

              <div className="product-detail-rating">
                <SimpleStarRating
                  rating={calculateAverageRating()}
                  size={18}
                  readonly={true}
                />
                <span className="rating-count">
                  {calculateAverageRating()} ({reviews.length} ulasan)
                </span>
              </div>

              <div className="product-detail-price">
                <span className="price-label">Harga:</span>
                {formattedPrice}
              </div>

              <div className="product-detail-stats">
                <div className="product-stat">
                  <div className="stat-value">{product.stock}</div>
                  <div className="stat-label">Stok</div>
                </div>
                <div className="product-stat">
                  <div className="stat-value">{reviews.length}</div>
                  <div className="stat-label">Ulasan</div>
                </div>
              </div>

              <div className="product-detail-description">
                <h4 className="description-title">Deskripsi</h4>
                <p className="description-text">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="product-reviews-section">
            <h3 className="section-title">
              <MessageSquare size={18} />
              Ulasan Pelanggan
            </h3>

            {loadingReviews ? (
              <div className="loading-reviews">Memuat ulasan...</div>
            ) : reviews.length > 0 ? (
              <>
                <div className="reviews-list">
                  {reviews.slice(0, displayedReviews).map((review) => (
                    <div className="review-item" key={review.id}>
                      <div className="review-header">
                        <div className="reviewer-info">
                          <h4 className="reviewer-name">
                            {review.customer_name}
                          </h4>
                          <span className="review-date">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <div className="review-rating">
                          <SimpleStarRating
                            rating={review.rating}
                            size={16}
                            readonly={true}
                          />
                        </div>
                      </div>
                      <p className="review-text">{review.review_text}</p>
                    </div>
                  ))}
                </div>

                {reviews.length > displayedReviews && (
                  <button
                    className="btn-link show-more"
                    onClick={() => setDisplayedReviews((prev) => prev + 3)}
                  >
                    Tampilkan lebih banyak ulasan
                  </button>
                )}
              </>
            ) : (
              <div className="no-reviews">
                Belum ada ulasan untuk produk ini
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="add-review-section">
            <h3 className="section-title">
              <ThumbsUp size={18} />
              Tambahkan Ulasan
            </h3>

            {eligibleOrders.length > 0 || product.order_id ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                {showSuccessMessage && (
                  <div className="success-message">
                    Ulasan Anda berhasil dikirim!
                  </div>
                )}

                {eligibleOrders.length > 1 && (
                  <div className="form-group">
                    <label>Pilih Pesanan</label>
                    <select
                      value={orderId || ""}
                      onChange={(e) =>
                        setOrderId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="form-control"
                      required
                    >
                      <option value="">Pilih Pesanan</option>
                      {eligibleOrders.map((order) => (
                        <option key={order.order_id} value={order.order_id}>
                          Pesanan #{order.order_id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Rating Anda</label>
                  <SimpleStarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size={24}
                  />
                </div>

                <div className="form-group">
                  <label>Ulasan Anda</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
                    className="form-control"
                    rows="4"
                    required
                    minLength="10"
                  />
                  <div className="char-count">Minimal 10 karakter</div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      "Mengirim..."
                    ) : (
                      <>
                        <Send size={16} />
                        Kirim Ulasan
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="no-eligible-orders">
                <ShoppingCart size={24} />
                <p>
                  Anda harus membeli produk ini terlebih dahulu untuk memberikan
                  ulasan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
