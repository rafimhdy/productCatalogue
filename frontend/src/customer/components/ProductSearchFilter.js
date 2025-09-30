// src/customer/components/ProductSearchFilter.js

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import './css/ProductSearchFilter.css'; // <-- Pastikan ini diimport

const ProductSearchFilter = ({ onSearch, onFilter, categories, priceRange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fungsi bantu untuk menerapkan filter
    const applyFilters = (category, min, max) => {
        onFilter({
            category: category,
            minPrice: min ? parseFloat(min) : null,
            maxPrice: max ? parseFloat(max) : null
        });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        applyFilters(categoryId, minPrice, maxPrice);
    };

    const handlePriceFilter = () => {
        applyFilters(selectedCategory, minPrice, maxPrice);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSearchTerm('');
        onSearch('');
        onFilter({});
    };

    const hasActiveFilters = selectedCategory || minPrice || maxPrice || searchTerm;

    return (
        <div className="product-filter-container">
            {/* Search Bar */}
            <div className="search-bar-wrapper">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                    onFocus={(e) => e.target.classList.add('is-focused')}
                    onBlur={(e) => e.target.classList.remove('is-focused')}
                />
            </div>

            {/* Filter Toggle & Reset Button */}
            <div className="filter-controls-bar">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn btn-toggle-filter ${showFilters ? 'is-active' : ''}`}
                >
                    <Filter size={16} />
                    {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-reset-filter"
                    >
                        <X size={16} />
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Filter Panel (Dropdown) */}
            {showFilters && (
                <div className="filter-panel-dropdown">
                    <div className="filter-options-grid">

                        {/* Category Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Kategori</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Rentang Harga</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Harga Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="price-input"
                                />
                                <span className="price-separator">-</span>
                                <input
                                    type="number"
                                    placeholder="Harga Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="price-input"
                                />
                            </div>
                            <button
                                onClick={handlePriceFilter}
                                className="btn btn-apply-price"
                            >
                                Terapkan Filter Harga
                            </button>
                        </div>

                        {/* Quick Price Filters */}
                        <div className="filter-group">
                            <label className="filter-label">Filter Cepat (Harga)</label>
                            <div className="quick-filter-buttons">
                                <button
                                    onClick={() => {
                                        setMinPrice('');
                                        setMaxPrice('100000');
                                        applyFilters(selectedCategory, '', 100000);
                                    }}
                                    className="btn btn-quick-filter"
                                >
                                    &lt; Rp 100,000
                                </button>
                                <button
                                    onClick={() => {
                                        setMinPrice('100000');
                                        setMaxPrice('500000');
                                        applyFilters(selectedCategory, 100000, 500000);
                                    }}
                                    className="btn btn-quick-filter"
                                >
                                    Rp 100K - 500K
                                </button>
                                <button
                                    onClick={() => {
                                        setMinPrice('500000');
                                        setMaxPrice('');
                                        applyFilters(selectedCategory, 500000, '');
                                    }}
                                    className="btn btn-quick-filter"
                                >
                                    &gt; Rp 500,000
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (selectedCategory || minPrice || maxPrice) && (
                <div className="active-filters-display">
                    <p className="active-filters-label">Filter Aktif:</p>
                    <div className="active-filter-badges">
                        {selectedCategory && (
                            <span className="badge badge-category">
                                Kategori: {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                                <X
                                    size={12}
                                    className="badge-clear-icon"
                                    onClick={() => handleCategoryFilter('')}
                                />
                            </span>
                        )}
                        {(minPrice || maxPrice) && (
                            <span className="badge badge-price">
                                Harga: {minPrice && `Rp ${parseInt(minPrice).toLocaleString('id-ID')}`}
                                {minPrice && maxPrice && ' - '}
                                {maxPrice && `Rp ${parseInt(maxPrice).toLocaleString('id-ID')}`}
                                <X
                                    size={12}
                                    className="badge-clear-icon"
                                    onClick={() => {
                                        setMinPrice('');
                                        setMaxPrice('');
                                        applyFilters(selectedCategory, '', '');
                                    }}
                                />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSearchFilter;
