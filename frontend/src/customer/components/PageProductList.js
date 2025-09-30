// src/customer/components/PageProductList.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import ProductSearchFilter from "./ProductSearchFilter";
import ProductDetailModal from "./ProductDetailModal"; // Import modal
import { useNotification } from "./NotificationContext"; // Import notifikasi
import "./css/PageProductList.css"; // <-- CSS baru untuk Grid

const API_BASE = process.env.REACT_APP_API_BASE || "http://31.97.109.187:5000";

const PageProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // State untuk produk yang dipilih
  const { notify } = useNotification(); // Hook notifikasi

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      setProducts(res.data);
      setFilteredProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Silakan login untuk memberikan ulasan.", "info");
      return false;
    }

    if (!reviewData || !reviewData.product_id) {
      console.error("Review data invalid or missing product_id", reviewData);
      notify("Data ulasan tidak valid.", "error");
      return false;
    }

    // Debug logging
    console.log("PageProductList sending review data:", reviewData);

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: reviewData.product_id,
          order_id: reviewData.order_id,
          rating: reviewData.rating,
          review_text: reviewData.review_text,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notify("Ulasan berhasil dikirim!", "success");
        setSelectedProduct(null);
        // Optionally, refresh product data to show new average rating
        fetchProducts();
        return true;
      } else {
        notify(data.message || "Gagal mengirim ulasan.", "error");
        return false;
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      notify("Terjadi kesalahan saat mengirim ulasan.", "error");
      return false;
    }
  };

  // --- LOGIC SEARCH & FILTER (Sama seperti sebelumnya) ---
  const handleSearch = (searchTerm) => {
    let filtered = products;
    if (searchTerm) {
      filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category_id === parseInt(filters.category)
      );
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
      filtered = filtered.filter((product) => {
        const price = product.price;
        const minMatch = filters.minPrice === null || price >= filters.minPrice;
        const maxMatch = filters.maxPrice === null || price <= filters.maxPrice;
        return minMatch && maxMatch;
      });
    }

    setFilteredProducts(filtered);
  };
  // --- AKHIR LOGIC SEARCH & FILTER ---

  if (loading) {
    return (
      <div
        className="product-page-list-container"
        style={{ textAlign: "center", padding: "100px 20px" }}
      >
        <p style={{ color: "#6c757d" }}>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-page-list-container">
      <ProductSearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        categories={categories}
      />

      {filteredProducts.length === 0 ? (
        <div className="product-not-found-message">
          <h3>Produk Tidak Ditemukan</h3>
          <p>Coba ubah kata kunci pencarian atau filter yang digunakan</p>
        </div>
      ) : (
        <>
          {/* Grid Konten Produk */}
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onProductClick={handleProductClick}
              />
            ))}
          </div>

          {/* Info Jumlah Produk */}
          <div className="product-count-info">
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </div>
        </>
      )}

      {/* Render Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default PageProductList;
