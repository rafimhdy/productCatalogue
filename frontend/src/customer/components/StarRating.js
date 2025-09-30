import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { useNotification } from "./NotificationContext";
import "./css/StarRating.css";

const StarRating = ({ productId, onReviewSubmitted }) => {
  const { user } = useContext(AuthContext);
  const { notify } = useNotification();
  const [canReview, setCanReview] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user?.role === "customer" && productId) {
      checkReviewEligibility();
    }
  }, [user, productId]);

  const checkReviewEligibility = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://31.97.109.187:5000/api/reviews/can-review/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCanReview(data.canReview);
        setAvailableOrders(data.availableOrders);
        if (data.availableOrders.length === 1) {
          setSelectedOrder(data.availableOrders[0].order_id);
        }
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedOrder || !rating) {
      notify("Please select an order and provide a rating", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://31.97.109.187:5000/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          order_id: selectedOrder,
          rating: rating,
          review_text: reviewText,
        }),
      });

      if (response.ok) {
        notify("Review submitted successfully!", "success");
        setShowForm(false);
        setRating(0);
        setReviewText("");
        setSelectedOrder("");
        setCanReview(false);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        const errorData = await response.json();
        notify(errorData.message || "Failed to submit review", "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      notify("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (interactive = false) => {
    const stars = [];
    const currentRating = interactive ? hoverRating || rating : rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star ${i <= currentRating ? "filled" : "empty"} ${
            interactive ? "interactive" : ""
          }`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
          onMouseEnter={interactive ? () => handleStarHover(i) : undefined}
          onMouseLeave={interactive ? handleStarLeave : undefined}
          disabled={!interactive}
        >
          {i <= currentRating ? "★" : "☆"}
        </button>
      );
    }

    return <div className="stars-container">{stars}</div>;
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Sangat Buruk",
      2: "Buruk",
      3: "Cukup",
      4: "Baik",
      5: "Sangat Baik",
    };
    return texts[rating] || "";
  };

  if (!user || user.role !== "customer") {
    return null;
  }

  if (!canReview) {
    return (
      <div className="review-section">
        <div className="no-review-message">
          <p>
            Anda dapat memberikan review setelah menerima produk yang telah
            dibeli.
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="review-section">
        <div className="review-prompt">
          <h3>Berikan Review Anda</h3>
          <p>Bagikan pengalaman Anda dengan produk ini</p>
          <button
            onClick={() => setShowForm(true)}
            className="write-review-button"
          >
            Tulis Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <div className="review-form-container">
        <h3>Tulis Review Anda</h3>

        <form onSubmit={handleSubmitReview} className="review-form">
          {availableOrders.length > 1 && (
            <div className="form-group">
              <label>Pilih Pesanan:</label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                required
              >
                <option value="">Pilih pesanan...</option>
                {availableOrders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    Order #{order.order_id} -{" "}
                    {new Date(order.order_date).toLocaleDateString("id-ID")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Rating:</label>
            <div className="rating-input">
              {renderStars(true)}
              <span className="rating-text">
                {getRatingText(hoverRating || rating)}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Review (Opsional):</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan pengalaman Anda dengan produk ini..."
              rows="4"
              maxLength="500"
            />
            <small>{reviewText.length}/500 karakter</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!rating || !selectedOrder || isSubmitting}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StarRating;
