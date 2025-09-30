import db from "../db.js";

// GET /cart
export const getCart = (req, res) => {
    const userId = req.user.id;
    console.log("DEBUG - Get cart for user ID:", userId); // Debug log

    db.query(
        `SELECT ci.id, ci.quantity, p.name AS products_name, p.price, p.image_url
         FROM cart_items ci
                  JOIN carts c ON ci.cart_id = c.id
                  JOIN products p ON ci.product_id = p.id
         WHERE c.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) {
                console.error("DEBUG - Cart query error:", err);
                return res.status(500).json({ message: "Gagal ambil cart" });
            }
            console.log("DEBUG - Cart results:", results); // Debug log
            res.json({ items: results });
        }
    );
};

// POST /cart
export const addToCart = (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    console.log("DEBUG - Add to cart:", { userId, productId, quantity }); // Debug log

    db.query("SELECT * FROM carts WHERE user_id = ?", [userId], (err, carts) => {
        if (err) return res.status(500).json({ message: "Error server" });
        const cartId = carts.length ? carts[0].id : null;

        const insertOrUseCart = (cartId) => {
            db.query(
                "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
                [cartId, productId],
                (err, items) => {
                    if (err) return res.status(500).json({ message: "Error server" });
                    if (items.length) {
                        // update quantity
                        db.query(
                            "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
                            [quantity, items[0].id],
                            (err) => {
                                if (err) return res.status(500).json({ message: "Gagal update quantity" });
                                res.json({ message: "Berhasil tambah ke cart" });
                            }
                        );
                    } else {
                        // insert new
                        db.query(
                            "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
                            [cartId, productId, quantity],
                            (err) => {
                                if (err) return res.status(500).json({ message: "Gagal tambah ke cart" });
                                res.json({ message: "Berhasil tambah ke cart" });
                            }
                        );
                    }
                }
            );
        };

        if (!cartId) {
            // buat cart baru
            db.query("INSERT INTO carts (user_id) VALUES (?)", [userId], (err, result) => {
                if (err) return res.status(500).json({ message: "Gagal buat cart" });
                insertOrUseCart(result.insertId);
            });
        } else {
            insertOrUseCart(cartId);
        }
    });
};

// PUT /cart
export const updateCartItem = (req, res) => {
    const { itemId, quantity } = req.body;
    db.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [quantity, itemId],
        (err) => {
            if (err) return res.status(500).json({ message: "Gagal update item" });
            res.json({ message: "Quantity berhasil diupdate" });
        }
    );
};

// DELETE /cart
export const removeFromCart = (req, res) => {
    const { itemId } = req.body;
    db.query("DELETE FROM cart_items WHERE id = ?", [itemId], (err) => {
        if (err) return res.status(500).json({ message: "Gagal hapus item" });
        res.json({ message: "Item berhasil dihapus" });
    });
};
