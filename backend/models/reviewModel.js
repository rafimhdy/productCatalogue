import db from "../db.js";

const Review = {
    // Create a new review (only for verified purchases)
    create: (reviewData, callback) => {
        const { product_id, user_id, order_id, rating, review_text } = reviewData;

        // First check if user has purchased this product in this order
        const checkPurchaseQuery = `
            SELECT oi.id 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
        `;

        db.query(checkPurchaseQuery, [order_id, user_id, product_id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) {
                return callback(new Error("You can only review products you have purchased and received"));
            }

            // Check if review already exists
            const checkExistingQuery = `
                SELECT id FROM product_reviews 
                WHERE product_id = ? AND user_id = ? AND order_id = ?
            `;

            db.query(checkExistingQuery, [product_id, user_id, order_id], (checkErr, existingReviews) => {
                if (checkErr) return callback(checkErr);
                if (existingReviews.length > 0) {
                    return callback(new Error("You have already reviewed this product for this order"));
                }

                // Create the review
                const insertQuery = `
                    INSERT INTO product_reviews (product_id, user_id, order_id, rating, review_text, is_verified)
                    VALUES (?, ?, ?, ?, ?, TRUE)
                `;

                db.query(insertQuery, [product_id, user_id, order_id, rating, review_text], (insertErr, insertResult) => {
                    if (insertErr) return callback(insertErr);

                    const newReviewId = insertResult.insertId;
                    // Update product rating statistics then return original insert id, not update result
                    Review.updateProductRating(product_id, (updateErr) => {
                        if (updateErr) return callback(updateErr);
                        callback(null, { insertId: newReviewId });
                    });
                });
            });
        });
    },

    // Get reviews for a product
    getByProductId: (productId, callback) => {
        const query = `
            SELECT pr.*, c.name as customer_name, pr.created_at, pr.updated_at
            FROM product_reviews pr
            JOIN customers c ON pr.user_id = c.id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `;
        db.query(query, [productId], callback);
    },

    // Get user's reviews
    getByUserId: (userId, callback) => {
        const query = `
            SELECT pr.*, p.name as product_name, p.image_url
            FROM product_reviews pr
            JOIN products p ON pr.product_id = p.id
            WHERE pr.user_id = ?
            ORDER BY pr.created_at DESC
        `;
        db.query(query, [userId], callback);
    },

    // Check if user can review a product (has purchased and delivered)
    canUserReview: (userId, productId, callback) => {
        const query = `
            SELECT DISTINCT o.id as order_id, o.created_at as order_date
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN product_reviews pr ON (pr.product_id = oi.product_id AND pr.user_id = o.user_id AND pr.order_id = o.id)
            WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered' AND pr.id IS NULL
            ORDER BY o.created_at DESC
        `;
        db.query(query, [userId, productId], callback);
    },

    // Update product rating statistics and Wilson Score
    updateProductRating: (productId, callback) => {
        // Calculate new rating statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_reviews
            FROM product_reviews 
            WHERE product_id = ? AND is_verified = TRUE
        `;

        db.query(statsQuery, [productId], (err, stats) => {
            if (err) return callback(err);

            const { total_reviews, average_rating, positive_reviews } = stats[0];

            // Calculate Wilson Score (confidence interval for positive reviews)
            let wilsonScore = 0;
            if (total_reviews >= 10) { // Minimum 10 reviews required
                const n = total_reviews;
                const p = positive_reviews / n;
                const z = 1.96; // 95% confidence interval

                wilsonScore = (p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n);
                wilsonScore = Math.max(0, wilsonScore); // Ensure non-negative
            }

            // Update product statistics
            const updateQuery = `
                UPDATE products 
                SET total_reviews = ?, 
                    average_rating = ?, 
                    wilson_score = ?,
                    last_rating_update = NOW()
                WHERE id = ?
            `;

            db.query(updateQuery, [total_reviews, average_rating || 0, wilsonScore, productId], (updateErr) => {
                if (updateErr) return callback(updateErr);

                // Update total sold count from order_items
                const soldQuery = `
                    UPDATE products p
                    SET total_sold = (
                        SELECT COALESCE(SUM(oi.quantity), 0)
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        WHERE oi.product_id = p.id AND o.status = 'delivered'
                    )
                    WHERE p.id = ?
                `;

                db.query(soldQuery, [productId], callback);
            });
        });
    },

    // Calculate and update all product ratings (for batch processing)
    updateAllProductRatings: (callback) => {
        const getAllProductsQuery = "SELECT id FROM products";

        db.query(getAllProductsQuery, (err, products) => {
            if (err) return callback(err);

            let completed = 0;
            const total = products.length;

            if (total === 0) return callback(null);

            products.forEach(product => {
                Review.updateProductRating(product.id, (updateErr) => {
                    if (updateErr) console.error(`Error updating product ${product.id}:`, updateErr);

                    completed++;
                    if (completed === total) {
                        callback(null);
                    }
                });
            });
        });
    },

    // Get product rating summary
    getProductRatingSummary: (productId, callback) => {
        const query = `
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM product_reviews 
            WHERE product_id = ? AND is_verified = TRUE
        `;
        db.query(query, [productId], callback);
    }
};

export default Review;
