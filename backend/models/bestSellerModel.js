import db from "../db.js";

const BestSeller = {
    // Calculate and update best sellers rankings
    calculateBestSellers: (callback) => {
        console.log("Starting best sellers calculation...");

        // Get products with minimum 3 reviews (lowered from 10) and calculate Wilson Score
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.image_url,
                p.stock,
                p.category_id,
                p.total_sold,
                p.total_reviews,
                p.average_rating,
                p.wilson_score,
                CASE 
                    WHEN p.total_reviews >= 3 THEN 
                        (p.wilson_score * 0.6) + (LEAST(p.total_sold / 100, 1) * 0.4)
                    ELSE 0 
                END as final_score
            FROM products p
            WHERE p.total_reviews >= 3
            ORDER BY final_score DESC, p.total_sold DESC
            LIMIT 20
        `;

        db.query(query, (err, products) => {
            if (err) {
                console.error("Error calculating best sellers:", err);
                return callback(err);
            }

            // Clear existing best sellers
            db.query("DELETE FROM best_sellers", (deleteErr) => {
                if (deleteErr) {
                    console.error("Error clearing best sellers:", deleteErr);
                    return callback(deleteErr);
                }

                if (products.length === 0) {
                    console.log("No products qualify for best sellers (minimum 10 reviews required)");
                    return callback(null, []);
                }

                // Insert new best sellers
                const insertPromises = products.map((product, index) => {
                    return new Promise((resolve, reject) => {
                        const insertQuery = `
                            INSERT INTO best_sellers 
                            (product_id, rank_position, wilson_score, total_sold, average_rating, total_reviews, calculation_date)
                            VALUES (?, ?, ?, ?, ?, ?, NOW())
                        `;

                        db.query(insertQuery, [
                            product.id,
                            index + 1,
                            product.wilson_score,
                            product.total_sold,
                            product.average_rating,
                            product.total_reviews
                        ], (insertErr) => {
                            if (insertErr) {
                                console.error(`Error inserting best seller ${product.id}:`, insertErr);
                                reject(insertErr);
                            } else {
                                resolve();
                            }
                        });
                    });
                });

                Promise.all(insertPromises)
                    .then(() => {
                        // Update products table with best seller flags
                        BestSeller.updateBestSellerFlags(() => {
                            console.log(`Best sellers calculation completed. ${products.length} products ranked.`);
                            callback(null, products);
                        });
                    })
                    .catch(callback);
            });
        });
    },

    // Update best seller flags in products table
    updateBestSellerFlags: (callback) => {
        // First, reset all best seller flags
        db.query("UPDATE products SET is_best_seller = FALSE, best_seller_rank = NULL", (resetErr) => {
            if (resetErr) return callback(resetErr);

            // Then update the best sellers
            const updateQuery = `
                UPDATE products p
                JOIN best_sellers bs ON p.id = bs.product_id
                SET p.is_best_seller = TRUE, p.best_seller_rank = bs.rank_position
            `;

            db.query(updateQuery, callback);
        });
    },

    // Get current best sellers for homepage
    getBestSellers: (limit = 10, callback) => {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.image_url,
                p.stock,
                p.description,
                p.category_id,
                c.name AS category_name,
                p.total_sold,
                p.total_reviews,
                p.average_rating,
                p.wilson_score,
                bs.rank_position,
                bs.calculation_date
            FROM best_sellers bs
            JOIN products p ON bs.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY bs.rank_position ASC
            LIMIT ?
        `;

        db.query(query, [limit], callback);
    },

    // Get best sellers with category filter
    getBestSellersByCategory: (categoryId, limit = 10, callback) => {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.image_url,
                p.stock,
                p.description,
                p.category_id,
                c.name AS category_name,
                p.total_sold,
                p.total_reviews,
                p.average_rating,
                p.wilson_score,
                bs.rank_position
            FROM best_sellers bs
            JOIN products p ON bs.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            ORDER BY bs.rank_position ASC
            LIMIT ?
        `;

        db.query(query, [categoryId, limit], callback);
    },

    // Get trending products (products with recent high sales)
    getTrendingProducts: (days = 30, limit = 10, callback) => {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.image_url,
                p.description,
                p.stock,
                p.total_reviews,
                p.average_rating,
                COUNT(DISTINCT oi.order_id) as recent_sales,
                SUM(oi.quantity) as recent_quantity
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                AND o.status = 'delivered'
            GROUP BY p.id
            HAVING recent_sales >= 3
            ORDER BY recent_quantity DESC, recent_sales DESC
            LIMIT ?
        `;

        db.query(query, [days, limit], callback);
    },

    // Get last calculation date
    getLastCalculationDate: (callback) => {
        const query = "SELECT MAX(calculation_date) as last_calculation FROM best_sellers";
        db.query(query, callback);
    }
};

export default BestSeller;
