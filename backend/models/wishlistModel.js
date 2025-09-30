import db from "../db.js";

const Wishlist = {
    // Add product to wishlist
    add: (userId, productId, callback) => {
        // First check if already exists
        db.query(
            "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
            [userId, productId],
            (err, results) => {
                if (err) return callback(err);
                if (results.length > 0) {
                    return callback(new Error("Product already in wishlist"));
                }

                // Add to wishlist
                db.query(
                    "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
                    [userId, productId],
                    callback
                );
            }
        );
    },

    // Remove product from wishlist
    remove: (userId, productId, callback) => {
        db.query(
            "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
            [userId, productId],
            callback
        );
    },

    // Get user's wishlist
    getByUserId: (userId, callback) => {
        db.query(`
            SELECT w.*, p.name, p.price, p.image_url, p.description, p.stock
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId], callback);
    },

    // Check if product is in user's wishlist
    isInWishlist: (userId, productId, callback) => {
        db.query(
            "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
            [userId, productId],
            callback
        );
    }
};

export default Wishlist;
