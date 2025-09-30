-- Customer Dashboard Database Schema
-- Run these SQL commands in your MySQL database

-- 1. Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id)
);

-- 2. Add customer preferences columns to customers table (if they don't exist)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS newsletter_preference BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS product_categories_preference JSON DEFAULT NULL;

-- 3. Add verification columns to customers table (if they don't exist)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 4. Add best sellers and rating columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS total_sold INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS wilson_score DECIMAL(5,4) DEFAULT 0.0000,
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS best_seller_rank INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_rating_update TIMESTAMP NULL DEFAULT NULL;

-- 5. Create product_reviews table for star ratings and reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (product_id, user_id, order_id)
);

-- 6. Create best_sellers table for caching best seller rankings
CREATE TABLE IF NOT EXISTS best_sellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    rank_position INT NOT NULL,
    wilson_score DECIMAL(5,4) NOT NULL,
    total_sold INT NOT NULL,
    average_rating DECIMAL(3,2) NOT NULL,
    total_reviews INT NOT NULL,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product (product_id),
    INDEX idx_rank_position (rank_position)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(verification_token);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at);

-- Products indexes for best sellers
CREATE INDEX IF NOT EXISTS idx_products_wilson_score ON products(wilson_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_total_sold ON products(total_sold DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_best_seller_rank ON products(best_seller_rank);

-- Best sellers indexes
CREATE INDEX IF NOT EXISTS idx_best_sellers_calculation_date ON best_sellers(calculation_date);
CREATE INDEX IF NOT EXISTS idx_best_sellers_wilson_score ON best_sellers(wilson_score DESC);
