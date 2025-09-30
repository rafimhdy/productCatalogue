// frontend/src/customer/components/HeroSectionKanan.js
import React from 'react';
import './css/HeroSectionKanan.css'; // File CSS untuk styling

const HeroSectionKanan = () => {
    return (
        <div className="hero-section-container">
            {/* Kolom Kiri: Teks */}
            <div className="hero-text-content">
                <h1>Lorem Ipsum Dolor Sit Amet</h1>
                <p>Lorem ipsum dolor sit amet, lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
            </div>

            {/* Kolom Kanan: Gambar */}
            <div className="hero-image-content">
                {/* Pastikan kamu punya gambar ini di folder public atau assets */}
                <img
                    src="https://blog.bankmega.com/wp-content/uploads/2022/11/Makanan-Khas-Tradisional.jpg" // Ganti dengan path gambar kamu
                    alt="Mindful living"
                    className="hero-image"
                />
            </div>
        </div>
    );
};

export default HeroSectionKanan;