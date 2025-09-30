import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  Edit3,
  Trash2,
  X,
  Save,
  Upload,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./css/ProductCard.css";
import "./css/ProductForm.css";

// Konstanta base URL API (bisa diubah jika perlu di satu tempat)
const API_BASE = "http://31.97.109.187:5000/api";

const ProductListAdmin = () => {
  // State utama
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [editUploadError, setEditUploadError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Fetch produk dari backend
  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/products`)
      .then((res) => {
        setProducts(res.data || []);
        setFiltered(res.data || []);
      })
      .catch((err) => console.error("Gagal fetch produk:", err))
      .finally(() => setLoading(false));
  };

  // Fetch kategori
  const fetchCategories = () => {
    axios
      .get(`${API_BASE}/categories`)
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Gagal fetch kategori:", err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filter ketika search / kategori berubah
  useEffect(() => {
    let temp = [...products];
    if (search.trim()) {
      temp = temp.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoryFilter) {
      temp = temp.filter(
        (p) => Number(p.category_id) === Number(categoryFilter)
      );
    }
    setFiltered(temp);
    setCurrentPage(1);
  }, [search, categoryFilter, products]);

  // Pagination calculations
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const paginate = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Buka modal edit
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({
      id: product.id,
      name: product.name || "",
      price: product.price || 0,
      stock: product.stock || 0,
      category_id: product.category_id || "",
      description: product.description || "",
      image: product.image_url || product.image || "",
    });
    setEditUploadProgress(0);
    setEditUploadError("");
    setShowEditModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    setEditUploadProgress(0);
    setEditUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      // gunakan endpoint upload-image (menurut productRoute)
      const response = await axios.post(
        `${API_BASE}/products/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setEditUploadProgress(percent);
          },
        }
      );
      if (response.data?.filename) {
        setEditForm((prev) => ({ ...prev, image: response.data.filename }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setEditUploadError("Gagal upload gambar");
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    const payload = {
      name: editForm.name,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      category_id: Number(editForm.category_id),
      description: editForm.description || "",
      image_url: editForm.image, // backend mungkin gunakan image_url
    };
    try {
      await axios.put(`${API_BASE}/products/${editingId}`, payload);
      fetchProducts();
      closeEditModal();
    } catch (err) {
      console.error("Gagal update produk:", err);
      alert("Gagal memperbarui produk");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Gagal hapus produk:", err);
      alert("Gagal menghapus produk");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditForm({});
    document.body.style.overflow = "";
  };

  if (loading) {
    return (
      <div className="product-management">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="product-header">
        <h2>
          <Package size={28} /> Manajemen Produk
        </h2>
        <div className="product-stats">
          <span className="stat-badge">
            <Package size={16} /> Total: {filtered.length} produk
          </span>
          <span className="stat-badge low-stock">
            <AlertTriangle size={16} /> Stok Menipis:{" "}
            {filtered.filter((p) => p.stock < 5).length}
          </span>
        </div>
      </div>

      {/* Kontrol pencarian & filter */}
      <div className="product-controls">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-filter"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page-select"
        >
          <option value={4}>4 per halaman</option>
          <option value={10}>10 per halaman</option>
          <option value={20}>20 per halaman</option>
        </select>
        <button
          onClick={() => {
            setSearch("");
            setCategoryFilter("");
          }}
          className="btn btn-outline"
        >
          <Filter size={16} /> Reset Filter
        </button>
      </div>

      {/* Grid Produk */}
      {currentProducts.length === 0 ? (
        <div className="empty-state">
          <Package size={64} className="empty-icon" />
          <h3>Tidak ada produk ditemukan</h3>
          <p>Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <div className="product-grid">
          {currentProducts.map((product) => {
            const imageSrc = product.image_url
              ? product.image_url.startsWith("http")
                ? product.image_url
                : `http://31.97.109.187:5000/uploads/${product.image_url}`
              : "/placeholder-product.jpg";
            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
                  <div className="product-badges">
                    {product.stock < 5 && product.stock > 0 && (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} /> Stok Rendah
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="badge badge-danger">
                        <EyeOff size={12} /> Habis
                      </span>
                    )}
                  </div>
                  <div
                    className={`stock-badge-overlay ${
                      product.stock === 0
                        ? "out"
                        : product.stock < 5
                        ? "low"
                        : ""
                    }`}
                  >
                    Stok: {product.stock}
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h4 className="product-title">{product.name}</h4>
                    <div className="product-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                  <p className="product-category">
                    {categories.find(
                      (c) => Number(c.id) === Number(product.category_id)
                    )?.name || "Tidak berkategori"}
                  </p>
                  <div className="product-price">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </div>
                  <div
                    className={`product-stock ${
                      product.stock < 5 ? "low" : ""
                    } ${product.stock === 0 ? "out" : ""}`}
                  >
                    <span className="stock-indicator"></span>
                    Stok: {product.stock}
                  </div>
                  <p className="product-description">{product.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > itemsPerPage && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === currentPage ? "active" : ""}`}
              onClick={() => paginate(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="modal-content product-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <Edit3 size={20} /> Edit Produk
              </h3>
              <button className="modal-close" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <Package size={16} /> Nama Produk
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Harga (Rp)</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      className="form-control"
                      min={0}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stok</label>
                    <input
                      type="number"
                      name="stock"
                      value={editForm.stock}
                      onChange={handleEditChange}
                      className="form-control"
                      min={0}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      name="category_id"
                      value={editForm.category_id}
                      onChange={handleEditChange}
                      className="form-control"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Deskripsi</label>
                    <textarea
                      name="description"
                      value={editForm.description || ""}
                      onChange={handleEditChange}
                      className="form-control"
                      rows={3}
                      placeholder="Deskripsi detail tentang produk"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>
                      <Upload size={16} /> Gambar Produk
                    </label>
                    <div className="image-upload-container">
                      {editForm.image && (
                        <img
                          src={
                            editForm.image.startsWith("http")
                              ? editForm.image
                              : `http://31.97.109.187:5000/uploads/${editForm.image}`
                          }
                          alt="Preview"
                          className="image-preview"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="form-control"
                      />
                      {editUploading && (
                        <div className="upload-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${editUploadProgress}%` }}
                          />
                          <span>{editUploadProgress}%</span>
                        </div>
                      )}
                      {editUploadError && (
                        <p className="error-text">{editUploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeEditModal}
                  >
                    <X size={16} /> Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListAdmin;
