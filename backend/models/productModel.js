import db from "../db.js";

// Ambil semua produk + nama kategori
export const getAllProducts = (callback) => {
    db.query(
        `SELECT p.id, p.name, p.price, p.stock, p.image_url,
                p.category_id, c.name AS category_name,
                p.low_stock_threshold,
                p.total_sold, p.total_reviews, p.average_rating, p.wilson_score,
                p.is_best_seller, p.best_seller_rank
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id`,
        callback
    );
};

// Ambil produk by ID + nama kategori
export const getProductById = (id, callback) => {
    db.query(
        `SELECT p.id, p.name, p.price, p.stock, p.image_url,
                p.category_id, c.name AS category_name,
                p.low_stock_threshold,
                p.total_sold, p.total_reviews, p.average_rating, p.wilson_score,
                p.is_best_seller, p.best_seller_rank
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [id],
        callback
    );
};

// Tambah produk
export const createProduct = (product, callback) => {
    const { name, price, stock, image_url, category_id } = product;
    db.query(
        "INSERT INTO products (name, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?)",
        [name, price, stock, image_url, category_id],
        callback
    );
};

// Update produk
export const updateProduct = (id, product, callback) => {
    const { name, price, stock, image_url, category_id } = product;
    db.query(
        "UPDATE products SET name = ?, price = ?, stock = ?, image_url = ?, category_id = ? WHERE id = ?",
        [name, price, stock, image_url, category_id, id],
        callback
    );
};

// Hapus produk
export const deleteProduct = (id, callback) => {
    db.query("DELETE FROM products WHERE id = ?", [id], callback);
};
