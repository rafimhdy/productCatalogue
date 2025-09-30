import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/FormStyles.css"; // Import the new styles
import {
  Plus,
  Upload,
  Package,
  DollarSign,
  Hash,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

const AddProductForm = ({ onProductAdded, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    categoryId: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [isUsingExternalUrl, setIsUsingExternalUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Stok tidak boleh negatif";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Kategori wajib dipilih";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi produk wajib diisi";
    }

    if (!isUsingExternalUrl && !imageUrl && !externalImageUrl) {
      newErrors.image = "Gambar produk wajib diisi";
    }

    if (isUsingExternalUrl && !externalImageUrl.trim()) {
      newErrors.externalImageUrl = "URL gambar wajib diisi";
    }

    if (isUsingExternalUrl && !isValidUrl(externalImageUrl)) {
      newErrors.externalImageUrl = "URL gambar tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setIsUsingExternalUrl(false);
    setExternalImageUrl("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://31.97.109.187:5000/api/products/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setImageUrl(response.data.filename);
      setUploadError("");
    } catch (error) {
      setUploadError("Gagal upload gambar. Coba lagi.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleExternalUrlChange = (e) => {
    setExternalImageUrl(e.target.value);
    setImageUrl("");

    // Clear error when user starts typing
    if (errors.externalImageUrl) {
      setErrors((prev) => ({
        ...prev,
        externalImageUrl: "",
      }));
    }
  };

  const toggleImageSourceType = () => {
    setIsUsingExternalUrl(!isUsingExternalUrl);
    setImageUrl("");
    setExternalImageUrl("");
    setUploadError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      description: formData.description.trim(),
      category_id: parseInt(formData.categoryId),
      image_url: isUsingExternalUrl ? externalImageUrl : imageUrl, // Use image_url instead of image
    };

    try {
      await axios.post("http://31.97.109.187:5000/api/products", productData);

      // Reset form
      setFormData({
        name: "",
        price: "",
        stock: "",
        description: "",
        categoryId: "",
      });
      setImageUrl("");
      setExternalImageUrl("");
      setSuccessMessage("Produk berhasil ditambahkan!");

      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

      // Close form
      setShowForm(false);

      // Notify parent component
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setErrors({ submit: "Gagal menambahkan produk. Coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form-container">
      {/* Toggle Button */}
      <div className="add-product-header">
        <button
          onClick={() => setShowForm(!showForm)}
          className={`add-product-toggle-btn ${showForm ? "active" : ""}`}
        >
          <Plus size={20} />
          {showForm ? "Tutup Form" : "Tambah Produk Baru"}
        </button>

        {successMessage && (
          <div className="success-message">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="add-product-form-card">
          <div className="form-header">
            <h3>
              <Package size={24} />
              Tambah Produk Baru
            </h3>
            <p>Lengkapi informasi produk di bawah ini</p>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group">
                <label>
                  <Package size={16} />
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-control ${errors.name ? "error" : ""}`}
                  placeholder="Masukkan nama produk"
                />
                {errors.name && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Harga *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`form-control ${errors.price ? "error" : ""}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.price}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="form-group">
                <label>
                  <Hash size={16} />
                  Stok *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`form-control ${errors.stock ? "error" : ""}`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.stock}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label>
                  <FolderOpen size={16} />
                  Kategori *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`form-control ${errors.categoryId ? "error" : ""}`}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.categoryId}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label>
                  <FileText size={16} />
                  Deskripsi Produk *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.description ? "error" : ""
                  }`}
                  placeholder="Masukkan deskripsi produk"
                  rows="4"
                />
                {errors.description && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.description}
                  </div>
                )}
              </div>

              {/* Image Upload or External URL */}
              <div className="form-group full-width">
                <label>
                  <ImageIcon size={16} />
                  Gambar Produk *
                </label>

                <div className="image-source-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${
                      !isUsingExternalUrl ? "active" : ""
                    }`}
                    onClick={() => setIsUsingExternalUrl(false)}
                  >
                    <Upload size={16} />
                    Upload Gambar
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${
                      isUsingExternalUrl ? "active" : ""
                    }`}
                    onClick={() => setIsUsingExternalUrl(true)}
                  >
                    <LinkIcon size={16} />
                    URL Gambar
                  </button>
                </div>

                {isUsingExternalUrl ? (
                  <div className="url-input-container">
                    <input
                      type="url"
                      value={externalImageUrl}
                      onChange={handleExternalUrlChange}
                      className={`form-control ${
                        errors.externalImageUrl ? "error" : ""
                      }`}
                      placeholder="Masukkan URL gambar (https://...)"
                    />
                    {errors.externalImageUrl && (
                      <div className="error-text">
                        <AlertCircle size={14} />
                        {errors.externalImageUrl}
                      </div>
                    )}

                    {externalImageUrl && isValidUrl(externalImageUrl) && (
                      <div className="image-preview">
                        <img
                          src={externalImageUrl}
                          alt="Preview"
                          className="preview-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/120x120?text=Gambar+Error";
                          }}
                        />
                        <div className="image-success">
                          <CheckCircle size={16} />
                          URL gambar valid
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="image-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="product-image"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="product-image"
                      className="file-upload-label"
                    >
                      <Upload size={20} />
                      {uploading ? "Uploading..." : "Pilih Gambar"}
                    </label>

                    {uploading && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="progress-text">{uploadProgress}%</span>
                      </div>
                    )}

                    {imageUrl && (
                      <div className="image-preview">
                        <img
                          src={`http://31.97.109.187:5000/uploads/${imageUrl}`}
                          alt="Preview"
                          className="preview-image"
                        />
                        <div className="image-success">
                          <CheckCircle size={16} />
                          Gambar berhasil diupload
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="error-text">
                        <AlertCircle size={14} />
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}

                {errors.image && !errors.externalImageUrl && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.image}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || uploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Tambah Produk
                  </>
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
