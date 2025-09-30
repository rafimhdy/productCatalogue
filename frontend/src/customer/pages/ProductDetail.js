import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { useNotification } from "../components/NotificationContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StarRating from "../components/StarRating";
import "./css/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
    fetchRatingSummary();

    // Trigger animation after component mounts
    setTimeout(() => setShowContent(true), 300);
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://31.97.109.187:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        notify("Product not found", "error");
        navigate("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      notify("Failed to load product", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const response = await fetch(
        `http://31.97.109.187:5000/api/reviews/product/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchRatingSummary = async () => {
    try {
      const response = await fetch(
        `http://31.97.109.187:5000/api/reviews/summary/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        setRatingSummary(data);
      }
    } catch (error) {
      console.error("Error fetching rating summary:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      notify("Please login to add products to cart", "info");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://31.97.109.187:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: parseInt(id),
          quantity: quantity,
        }),
      });

      if (response.ok) {
        notify(`${quantity} item(s) added to cart!`, "success");
      } else {
        const errorData = await response.json();
        notify(errorData.message || "Failed to add to cart", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      notify("Failed to add to cart", "error");
    }
  };

  const handleReviewSubmitted = () => {
    fetchProductReviews();
    fetchRatingSummary();
    fetchProductDetails();
  };

  const safeRating = (rating) => {
    const num = parseFloat(rating);
    return isNaN(num) ? 0 : num;
  };

  const renderStars = (rating) => {
    const safeRatingValue = safeRating(rating);
    const stars = [];
    const fullStars = Math.floor(safeRatingValue);
    const hasHalfStar = safeRatingValue % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="loading-screen">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="error-screen">
          <div className="error-container">
            <h2>Product not found</h2>
            <button
              onClick={() => navigate("/products")}
              className="back-button"
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Navbar />

      <div className="product-showcase">
        {/* Modern Product Display - Inspired by productTemplate */}
        <div className="product-container">
          <div
            className={`color-overlay ${showContent ? "slide-down" : ""}`}
          ></div>

          <div className="product-content">
            {/* Animated Product Title */}
            <div
              className={`product-title-section ${
                showContent ? "animate-in" : ""
              }`}
            >
              <h1 className="modern-product-name">
                {product && product.name ? (
                  product.name.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className="word-part"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {word}
                    </span>
                  ))
                ) : (
                  <span className="word-part">Product Name</span>
                )}
              </h1>

              {ratingSummary && ratingSummary.total_reviews > 0 && (
                <div className="product-rating-modern">
                  <div className="stars">
                    {renderStars(ratingSummary.average_rating)}
                  </div>
                  <span className="rating-text">
                    {safeRating(ratingSummary.average_rating).toFixed(1)} (
                    {ratingSummary.total_reviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Product Image with Animation */}
            <div className="product-image-modern">
              <img
                src={product?.image_url || "/placeholder-image.png"}
                alt={product?.name || "Product"}
                className={`main-product-image ${imageLoaded ? "loaded" : ""}`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Modern Info Panel - Similar to nutrition panel */}
            <div
              className={`product-info-panel ${showContent ? "slide-up" : ""}`}
            >
              <div className="info-item">
                <div className="info-value">
                  Rp {product?.price?.toLocaleString("id-ID") || "0"}
                </div>
                <div className="info-label">Price</div>
              </div>

              <div className="info-item">
                <div className="info-value">{product?.stock || 0}</div>
                <div className="info-label">In Stock</div>
              </div>

              <div className="info-item">
                <div className="info-value">
                  {ratingSummary?.total_reviews || 0}
                </div>
                <div className="info-label">Reviews</div>
              </div>

              <div className="info-item">
                <div className="info-value">
                  {safeRating(ratingSummary?.average_rating || 0).toFixed(1)}
                </div>
                <div className="info-label">Rating</div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product && product.stock > 0 && (
              <div
                className={`product-actions-modern ${
                  showContent ? "fade-in" : ""
                }`}
              >
                <div className="quantity-modern">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <button onClick={handleAddToCart} className="add-cart-modern">
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Description Section */}
        <div className="description-section">
          <div className="description-container">
            <h3>About This Product</h3>
            <p>{product?.description || "No description available."}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section-modern">
          <h2>Customer Reviews</h2>

          {/* Rating Summary */}
          {ratingSummary && ratingSummary.total_reviews > 0 && (
            <div className="rating-summary-modern">
              <div className="overall-rating-modern">
                <div className="rating-score-large">
                  {safeRating(ratingSummary.average_rating).toFixed(1)}
                </div>
                <div className="rating-stars-large">
                  {renderStars(ratingSummary.average_rating)}
                </div>
                <div className="rating-count-modern">
                  Based on {ratingSummary.total_reviews} reviews
                </div>
              </div>

              <div className="rating-breakdown-modern">
                {[5, 4, 3, 2, 1].map((star) => {
                  const starFieldName = `${
                    ["zero", "one", "two", "three", "four", "five"][star]
                  }_star`;
                  const starCount = ratingSummary[starFieldName] || 0;
                  const percentage =
                    ratingSummary.total_reviews > 0
                      ? (starCount / ratingSummary.total_reviews) * 100
                      : 0;

                  return (
                    <div key={star} className="rating-bar-modern">
                      <span className="star-label-modern">{star} ★</span>
                      <div className="bar-container-modern">
                        <div
                          className="bar-fill-modern"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="star-count-modern">{starCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Star Rating Component */}
          <StarRating
            productId={parseInt(id)}
            onReviewSubmitted={handleReviewSubmitted}
          />

          {/* Reviews List */}
          <div className="reviews-list-modern">
            {reviewsLoading ? (
              <div className="reviews-loading">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header-modern">
                    <div className="reviewer-info-modern">
                      <span className="reviewer-name-modern">
                        {review.customer_name || "Anonymous"}
                      </span>
                      <div className="review-rating-modern">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="review-date-modern">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.review_text && (
                    <div className="review-text-modern">
                      {review.review_text}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-reviews-modern">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
