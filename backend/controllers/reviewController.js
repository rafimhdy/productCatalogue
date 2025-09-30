import Review from "../models/reviewModel.js";

// Create a new review (only for verified purchases)
export const createReview = async (req, res) => {
    try {
        const { product_id, order_id, rating, review_text } = req.body;
        const user_id = req.user.id;

        // Debug logging to see what's being received
        console.log('Review submission data:', {
            product_id,
            order_id,
            rating,
            review_text,
            user_id,
            body: req.body
        });

        // Improved validation - check for undefined/null specifically, allow 0 values
        if (product_id === undefined || product_id === null ||
            order_id === undefined || order_id === null ||
            rating === undefined || rating === null || rating === '') {
            console.log('Validation failed:', { product_id, order_id, rating });
            return res.status(400).json({
                message: "Product ID, Order ID, and rating are required"
            });
        }

        const numRating = parseInt(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5 stars"
            });
        }

        const reviewData = {
            product_id: parseInt(product_id),
            user_id,
            order_id: parseInt(order_id),
            rating: numRating,
            review_text: review_text || ''
        };

        console.log('Processed review data:', reviewData);

        Review.create(reviewData, (err, result) => {
            if (err) {
                console.error("Error creating review:", err);
                return res.status(400).json({
                    message: err.message || "Failed to create review"
                });
            }

            res.status(201).json({
                message: "Review created successfully",
                reviewId: result.insertId
            });
        });

    } catch (error) {
        console.error("Error in createReview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        Review.getByProductId(productId, (err, reviews) => {
            if (err) {
                console.error("Error fetching reviews:", err);
                return res.status(500).json({ message: "Failed to fetch reviews" });
            }

            res.json(reviews);
        });

    } catch (error) {
        console.error("Error in getProductReviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const user_id = req.user.id;

        Review.getByUserId(user_id, (err, reviews) => {
            if (err) {
                console.error("Error fetching user reviews:", err);
                return res.status(500).json({ message: "Failed to fetch reviews" });
            }

            res.json(reviews);
        });

    } catch (error) {
        console.error("Error in getUserReviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check if user can review a product
export const canUserReviewProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;

        Review.canUserReview(user_id, productId, (err, orders) => {
            if (err) {
                console.error("Error checking review eligibility:", err);
                return res.status(500).json({ message: "Failed to check review eligibility" });
            }

            res.json({
                canReview: orders.length > 0,
                availableOrders: orders
            });
        });

    } catch (error) {
        console.error("Error in canUserReviewProduct:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get product rating summary
export const getProductRatingSummary = async (req, res) => {
    try {
        const { productId } = req.params;

        Review.getProductRatingSummary(productId, (err, summary) => {
            if (err) {
                console.error("Error fetching rating summary:", err);
                return res.status(500).json({ message: "Failed to fetch rating summary" });
            }

            const result = summary[0] || {
                total_reviews: 0,
                average_rating: 0,
                five_star: 0,
                four_star: 0,
                three_star: 0,
                two_star: 0,
                one_star: 0
            };

            res.json(result);
        });

    } catch (error) {
        console.error("Error in getProductRatingSummary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update all product ratings (admin endpoint)
export const updateAllProductRatings = async (req, res) => {
    try {
        Review.updateAllProductRatings((err) => {
            if (err) {
                console.error("Error updating all product ratings:", err);
                return res.status(500).json({ message: "Failed to update product ratings" });
            }

            res.json({ message: "All product ratings updated successfully" });
        });

    } catch (error) {
        console.error("Error in updateAllProductRatings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
