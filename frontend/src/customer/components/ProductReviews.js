import React, { useState, useEffect } from "react";
import { Star, StarIcon } from "lucide-react";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: 5,
    reviewText: "",
    orderId: "",
  });
  const [userOrders, setUserOrders] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
    fetchUserOrders();
  }, [productId]);

  const toNumber = (val, fallback = 0) => {
    if (val === null || val === undefined) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://31.97.109.187:5000/api/reviews/product/${productId}`
      );
      const data = await response.json();
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(
        `http://31.97.109.187:5000/api/reviews/summary/${productId}`
      );
      const data = await response.json();
      // Normalize shape: ensure averageRating, totalReviews, ratingDistribution present
      const normalized = {
        averageRating: toNumber(
          data.average_rating ?? data.averageRating ?? 0,
          0
        ),
        totalReviews: toNumber(data.total_reviews ?? data.totalReviews ?? 0, 0),
        ratingDistribution: {
          1: toNumber(
            data.one_star ??
              data["1"] ??
              (data.ratingDistribution && data.ratingDistribution[1]) ??
              0,
            0
          ),
          2: toNumber(
            data.two_star ??
              data["2"] ??
              (data.ratingDistribution && data.ratingDistribution[2]) ??
              0,
            0
          ),
          3: toNumber(
            data.three_star ??
              data["3"] ??
              (data.ratingDistribution && data.ratingDistribution[3]) ??
              0,
            0
          ),
          4: toNumber(
            data.four_star ??
              data["4"] ??
              (data.ratingDistribution && data.ratingDistribution[4]) ??
              0,
            0
          ),
          5: toNumber(
            data.five_star ??
              data["5"] ??
              (data.ratingDistribution && data.ratingDistribution[5]) ??
              0,
            0
          ),
        },
      };
      setReviewStats(normalized);
    } catch (err) {
      console.error("Error fetching review stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://31.97.109.187:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      // Filter delivered orders that contain this product
      setUserOrders(
        (data || []).filter((order) => order.status === "delivered")
      );
    } catch (err) {
      console.error("Error fetching user orders:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login untuk memberikan review");
      return;
    }

    try {
      const response = await fetch("http://31.97.109.187:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
          order_id: parseInt(newReview.orderId),
          rating: newReview.rating,
          review_text: newReview.reviewText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Review berhasil ditambahkan!");
        setNewReview({ rating: 5, reviewText: "", orderId: "" });
        setShowAddReview(false);
        fetchReviews();
        fetchReviewStats();
      } else {
        alert(data.message || "Gagal menambahkan review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Terjadi kesalahan saat menambahkan review");
    }
  };

  const renderStars = (ratingInput, interactive = false, onRate = null) => {
    const rating = toNumber(ratingInput, 0);
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            fill={star <= rating ? "#ffc107" : "transparent"}
            color={star <= rating ? "#ffc107" : "#e4e5e9"}
            style={{
              cursor: interactive ? "pointer" : "default",
              transition: "all 0.2s",
            }}
            onClick={interactive ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Reviews & Rating</h3>

      {/* Review Statistics */}
      {reviewStats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "20px",
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "3rem", fontWeight: "bold", color: "#333" }}
            >
              {toNumber(reviewStats.averageRating).toFixed(1)}
            </div>
            {renderStars(Math.round(toNumber(reviewStats.averageRating)))}
            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
              {toNumber(reviewStats.totalReviews)} review
              {toNumber(reviewStats.totalReviews) !== 1 ? "s" : ""}
            </div>
          </div>

          <div>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = toNumber(reviewStats.ratingDistribution[rating], 0);
              const percentage =
                toNumber(reviewStats.totalReviews, 0) > 0
                  ? (count / toNumber(reviewStats.totalReviews, 0)) * 100
                  : 0;
              return (
                <div
                  key={rating}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ minWidth: "60px", fontSize: "14px" }}>
                    {rating} bintang
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: "#ffc107",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      minWidth: "30px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Review Button */}
      {localStorage.getItem("token") &&
        localStorage.getItem("userRole") === "customer" && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowAddReview(!showAddReview)}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showAddReview ? "Tutup Form Review" : "+ Tulis Review"}
            </button>
          </div>
        )}

      {/* Add Review Form */}
      {showAddReview && (
        <form
          onSubmit={handleSubmitReview}
          style={{
            padding: "20px",
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            marginBottom: "20px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h4>Tulis Review Anda</h4>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Pilih Pesanan:
            </label>
            <select
              value={newReview.orderId}
              onChange={(e) =>
                setNewReview({ ...newReview, orderId: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">Pilih pesanan yang sudah diterima...</option>
              {userOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  Pesanan #{order.id} - {formatDate(order.created_at)} - Rp{" "}
                  {toNumber(order.total_price).toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Rating:
            </label>
            {renderStars(newReview.rating, true, (rating) =>
              setNewReview({ ...newReview, rating })
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Review:
            </label>
            <textarea
              value={newReview.reviewText}
              onChange={(e) =>
                setNewReview({ ...newReview, reviewText: e.target.value })
              }
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Kirim Review
            </button>
            <button
              type="button"
              onClick={() => setShowAddReview(false)}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div>
        <h4 style={{ marginBottom: "15px" }}>
          Review dari Pembeli ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p>Belum ada review untuk produk ini.</p>
            <p style={{ fontSize: "14px" }}>
              Jadilah yang pertama memberikan review!
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <strong>{review.customer_name}</strong>
                    {review.is_verified_purchase && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          color: "#28a745",
                          fontWeight: "bold",
                        }}
                      >
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {formatDate(review.created_at)}
                  </span>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  {renderStars(review.rating)}
                </div>

                {review.review_text && (
                  <p
                    style={{
                      margin: 0,
                      lineHeight: "1.6",
                      color: "#333",
                    }}
                  >
                    {review.review_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
