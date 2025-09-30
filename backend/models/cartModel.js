import db from "../db.js";

const Cart = {
    getCartByUser: (userId, callback) => {
        db.query(
            "SELECT * FROM carts WHERE user_id = ? LIMIT 1",
            [userId],
            callback
        );
    },

    createCart: (userId, callback) => {
        db.query(
            "INSERT INTO carts (user_id) VALUES (?)",
            [userId],
            callback
        );
    },

    getCartItems: (cartId, callback) => {
        db.query(
            `SELECT ci.id, ci.quantity, p.name, p.price
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId],
            callback
        );
    },

    addOrUpdateItem: (cartId, productId, quantity, callback) => {
        db.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [cartId, productId, quantity],
            callback
        );
    },

    removeItem: (cartItemId, callback) => {
        db.query("DELETE FROM cart_items WHERE id = ?", [cartItemId], callback);
    }
};

export default Cart;
