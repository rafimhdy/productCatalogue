import db from "../db.js"; // koneksi database

// Ambil semua kategori
export const getAllCategories = (callback) => {
    db.query("SELECT * FROM categories", callback);
};

// Ambil kategori berdasarkan id
export const getCategoryById = (id, callback) => {
    db.query("SELECT * FROM categories WHERE id = ?", [id], callback);
};

// Tambah kategori baru
export const createCategory = (category, callback) => {
    const { name, description } = category;
    db.query(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        [name, description],
        callback
    );
};

// Update kategori
export const updateCategory = (id, category, callback) => {
    const { name, description } = category;
    db.query(
        "UPDATE categories SET name = ?, description = ? WHERE id = ?",
        [name, description, id],
        callback
    );
};

// Hapus kategori
export const deleteCategory = (id, callback) => {
    db.query("DELETE FROM categories WHERE id = ?", [id], callback);
};
