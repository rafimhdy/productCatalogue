import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../models/categoryModel.js";

// Ambil semua kategori
export const fetchCategories = (req, res) => {
    getAllCategories((err, results) => {
        if (err) {
            console.error('ERROR - fetchCategories DB error:', err);
            return res.status(500).json({ message: "Gagal ambil kategori", error: err });
        }
        res.json(results);
    });
};

// Ambil kategori by id
export const fetchCategoryById = (req, res) => {
    const { id } = req.params;
    getCategoryById(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal ambil kategori", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.json(results[0]);
    });
};

// Tambah kategori baru
export const addCategory = (req, res) => {
    createCategory(req.body, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal tambah kategori", error: err });
        res.status(201).json({ message: "Kategori berhasil ditambahkan", id: results.insertId });
    });
};

// Update kategori
export const editCategory = (req, res) => {
    const { id } = req.params;
    updateCategory(id, req.body, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal update kategori", error: err });
        res.json({ message: "Kategori berhasil diupdate" });
    });
};

// Hapus kategori
export const removeCategory = (req, res) => {
    const { id } = req.params;
    deleteCategory(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal hapus kategori", error: err });
        res.json({ message: "Kategori berhasil dihapus" });
    });
};
