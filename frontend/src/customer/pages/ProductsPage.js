// src/ProductsPage.js (Revisi Responsif)

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageProductList from "../components/PageProductList";
import './css/ProductsPage.css'; // <-- Import CSS baru

const ProductsPage = () => {
    return (
        // Menggunakan class untuk background dan min-height
        <div className="products-page-root">
            <Navbar />

            {/* Page Header: Kontras dengan Sentuhan Softness */}
            <div className="page-header-container">
                <h1 className="page-header-title">
                    Koleksi Produk Terbaik Kami
                </h1>
                <p className="page-header-subtitle">
                    Jelajahi berbagai kategori dan temukan yang Anda butuhkan dengan fitur pencarian yang akurat.
                </p>
            </div>

            {/* Products List Grid */}
            <div className="page-main-content">
                <PageProductList />
            </div>

            <Footer />
        </div>
    );
};

export default ProductsPage;
