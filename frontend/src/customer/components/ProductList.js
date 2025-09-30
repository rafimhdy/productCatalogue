import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import ProductSearchFilter from "./ProductSearchFilter";
import ProductDetailModal from "./ProductDetailModal";
import { useNotification } from "./NotificationContext";
import "./css/ProductList.css";
import { rescanReveal } from "../../scrollReveal"; // ensure dynamically loaded cards get revealed

// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from "swiper/react"; // <-- Import useSwiper
import { ChevronLeft, ChevronRight } from "lucide-react"; // <-- Import Ikon Lucide

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import required modules
import { Navigation, Scrollbar, A11y } from "swiper/modules";

// --- Komponen Panah Kustom ---
const CustomSwiperControls = () => {
  // Hook untuk mendapatkan instance Swiper
  const swiper = useSwiper();

  return (
    <div className="custom-swiper-navigation">
      <button
        onClick={() => swiper.slidePrev()}
        className="swiper-button-prev-custom"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => swiper.slideNext()}
        className="swiper-button-next-custom"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
// --- Akhir Komponen Panah Kustom ---

const ProductList = ({ showSearch = false }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://31.97.109.187:5000/api/products");
      setProducts(res.data);
      setFilteredProducts(res.data);
      setLoading(false);
      // Re-scan reveal after products inserted into DOM (next paint)
      setTimeout(() => {
        try {
          rescanReveal();
        } catch (e) {
          /* silent */
        }
      }, 0);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://31.97.109.187:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (searchTerm) => {
    let filtered = products;
    if (searchTerm) {
      filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    // After filtering, some cards may be newly mounted; rescan to avoid stuck opacity:0
    setTimeout(() => {
      try {
        rescanReveal();
      } catch (e) {}
    }, 0);
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
      console.error("Review data invalid", reviewData);
      notify("Data ulasan tidak valid.", "error");
      return false;
    }
    try {
      const response = await fetch("http://31.97.109.187:5000/api/reviews", {
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      {showSearch && (
        <ProductSearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          categories={categories}
        />
      )}

      {filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "2px dashed #dee2e6",
          }}
        >
          <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>
            Produk Tidak Ditemukan
          </h3>
          <p style={{ color: "#868e96", marginBottom: 0 }}>
            Coba ubah kata kunci pencarian atau filter yang digunakan
          </p>
        </div>
      ) : (
        <div className="product-swiper-container">
          <Swiper
            modules={[Navigation, Scrollbar, A11y]}
            spaceBetween={20}
            slidesPerView={4}
            // navigation HILANG karena kita pakai custom control
            loop={filteredProducts.length > 4}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
          >
            {filteredProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} onProductClick={handleProductClick} />
              </SwiperSlide>
            ))}

            {/* Panggil Kontrol Kustom di dalam Swiper */}
            <CustomSwiperControls />
          </Swiper>
        </div>
      )}

      {showSearch && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "14px",
          }}
        >
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </div>
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

export default ProductList;
