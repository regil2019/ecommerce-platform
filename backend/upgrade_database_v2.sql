-- Database Upgrade Script v2.0
-- Adds missing columns to support the modern frontend UI
-- Run this script after backing up your database

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN short_description TEXT,
ADD COLUMN original_price DECIMAL(10,2),
ADD COLUMN discount_percentage INT,
ADD COLUMN main_image VARCHAR(255),
ADD COLUMN sku VARCHAR(50),
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN dimensions VARCHAR(100),
ADD COLUMN tags JSON;

-- Remove redundant categoryId column if it exists
ALTER TABLE products 
DROP COLUMN categoryId;

-- Update existing products with default values
UPDATE products SET 
    short_description = 'High quality product',
    original_price = price,
    discount_percentage = 0,
    main_image = JSON_EXTRACT(images, '$[0]'),
    sku = CONCAT('SKU-', id),
    is_featured = FALSE,
    is_active = TRUE,
    dimensions = '20x15x10 cm',
    tags = JSON_ARRAY('general'),
    updated_at = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Add foreign key constraint for category_id if not exists
ALTER TABLE products 
ADD CONSTRAINT fk_products_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE SET NULL;

-- Update categories table to support the new frontend requirements
ALTER TABLE categories 
ADD COLUMN slug VARCHAR(100) UNIQUE,
ADD COLUMN image VARCHAR(255),
ADD COLUMN parent_id INT,
ADD COLUMN product_count INT DEFAULT 0,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing categories with default values
UPDATE categories SET 
    slug = LOWER(REPLACE(name, ' ', '-')),
    image = CASE 
        WHEN name = 'Roupas' THEN 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop'
        WHEN name = 'Calçados' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
        ELSE 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
    END,
    parent_id = NULL,
    product_count = (SELECT COUNT(*) FROM products p WHERE p.category_id = categories.id),
    updated_at = CURRENT_TIMESTAMP;

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Add foreign key constraint for parent_id if not exists
ALTER TABLE categories 
ADD CONSTRAINT fk_categories_parent_id 
FOREIGN KEY (parent_id) REFERENCES categories(id) 
ON DELETE SET NULL;

-- Create reviews table if it doesn't exist (for completeness)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create cart table if it doesn't exist (for completeness)
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_cart (user_id, product_id)
);

-- Create indexes for cart
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);

-- Create favorites table if it doesn't exist (for completeness)
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_favorite (user_id, product_id)
);

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Update users table to support the new frontend requirements
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(50),
ADD COLUMN last_name VARCHAR(50),
ADD COLUMN avatar VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user',
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing users with default values
UPDATE users SET 
    first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1),
    avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone = '+1234567890',
    role = 'user',
    email_verified = TRUE,
    updated_at = CURRENT_TIMESTAMP;

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Insert sample data for demonstration
INSERT INTO categories (name, slug, description, image, parent_id, is_active, product_count, created_at, updated_at) VALUES
('Electronics', 'electronics', 'Latest gadgets and devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', NULL, TRUE, 0, NOW(), NOW()),
('Clothing', 'clothing', 'Fashion for everyone', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop', NULL, TRUE, 0, NOW(), NOW()),
('Home & Living', 'home-living', 'Make your space beautiful', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', NULL, TRUE, 0, NOW(), NOW()),
('Sports', 'sports', 'Gear up for adventure', 'https://images.unsplash.com/photo-1461896836934-28f7d26c9c06?w=400&h=300&fit=crop', NULL, TRUE, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Update product categories to match new categories
UPDATE products SET category_id = 1 WHERE category_id = 1; -- Electronics
UPDATE products SET category_id = 2 WHERE category_id = 2; -- Clothing

-- Update category product counts
UPDATE categories SET product_count = (SELECT COUNT(*) FROM products p WHERE p.category_id = categories.id);

-- Insert sample products with rich data
INSERT INTO products (name, price, description, short_description, original_price, discount_percentage, images, main_image, category_id, stock, sku, is_featured, is_active, weight, dimensions, tags, created_at, updated_at) VALUES
('Wireless Noise-Canceling Headphones', 299.99, 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals alike.', 'Premium ANC headphones with 30hr battery', 349.99, 14, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', 1, 45, 'HDPH-001', TRUE, TRUE, 0.5, '20x15x10 cm', '["audio", "wireless", "noise-canceling"]', NOW(), NOW()),
('Minimalist Leather Watch', 189.00, 'Elegant timepiece with genuine leather strap, sapphire crystal glass, and Japanese quartz movement. A perfect blend of style and functionality.', 'Elegant watch with leather strap', 189.00, 0, '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', 1, 32, 'WTCH-001', TRUE, TRUE, 0.1, '10x10x5 cm', '["watch", "leather", "minimalist"]', NOW(), NOW()),
('Premium Cotton T-Shirt', 49.99, 'Ultra-soft 100% organic cotton t-shirt with a relaxed fit. Available in multiple colors. Perfect for everyday wear.', '100% organic cotton, relaxed fit', 59.99, 17, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', 2, 120, 'TSHRT-001', FALSE, TRUE, 0.2, '30x20x2 cm', '["cotton", "organic", "casual"]', NOW(), NOW()),
('Smart Home Speaker', 129.99, 'Voice-controlled smart speaker with premium sound quality, built-in assistant, and smart home integration.', 'Voice-controlled smart speaker', 129.99, 0, '["https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop', 1, 67, 'SPKR-001', TRUE, TRUE, 0.8, '15x15x20 cm', '["smart-home", "speaker", "voice-control"]', NOW(), NOW()),
('Ergonomic Office Chair', 449.00, 'Professional ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back. Designed for all-day comfort.', 'Ergonomic chair with lumbar support', 549.00, 18, '["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop', 3, 23, 'CHAIR-001', TRUE, TRUE, 15.0, '60x60x110 cm', '["office", "ergonomic", "furniture"]', NOW(), NOW()),
('Running Shoes Pro', 159.99, 'Lightweight running shoes with responsive cushioning, breathable upper, and durable outsole for maximum performance.', 'Lightweight running shoes', 159.99, 0, '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 4, 78, 'SHOE-001', FALSE, TRUE, 0.9, '30x20x10 cm', '["running", "sports", "shoes"]', NOW(), NOW()),
('Ceramic Plant Pot Set', 79.99, 'Set of 3 modern ceramic planters in varying sizes. Perfect for indoor plants and home decor.', 'Set of 3 ceramic planters', 79.99, 0, '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop', 3, 54, 'POT-001', FALSE, TRUE, 2.5, '20x20x20 cm', '["plants", "ceramic", "decor"]', NOW(), NOW()),
('Wireless Charging Pad', 39.99, 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.', 'Fast Qi wireless charger', 49.99, 20, '["https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop"]', 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop', 1, 156, 'CHRG-001', FALSE, TRUE, 0.1, '10x10x2 cm', '["charging", "wireless", "accessories"]', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Update category product counts again after inserting new products
UPDATE categories SET product_count = (SELECT COUNT(*) FROM products p WHERE p.category_id = categories.id);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase, helpful_count, created_at) VALUES
(1, 1, 5, 'Best headphones I have ever owned!', 'The noise cancellation is incredible. I use these for work and travel, and they have completely changed my experience. Battery life is amazing too.', TRUE, 24, NOW()),
(1, 1, 4, 'Great quality, minor comfort issues', 'Sound quality is top-notch and the ANC works perfectly. Only issue is they get a bit warm after extended use.', TRUE, 12, NOW()),
(1, 2, 5, 'Elegant and functional', 'This watch is exactly what I was looking for. Simple, elegant design with great build quality.', TRUE, 8, NOW()),
(1, 3, 4, 'Comfortable and well-made', 'The cotton is really soft and the fit is perfect. Will definitely buy more colors.', TRUE, 15, NOW()),
(1, 4, 4, 'Good sound quality', 'The speaker sounds great and the voice assistant works well. Easy to set up.', TRUE, 6, NOW()),
(1, 5, 5, 'Best office chair ever', 'This chair has completely solved my back pain. Very comfortable and easy to adjust.', TRUE, 18, NOW()),
(1, 6, 5, 'Perfect running shoes', 'Lightweight and very comfortable. Great grip and cushioning. Highly recommended!', TRUE, 22, NOW()),
(1, 7, 4, 'Nice planters', 'Good quality ceramic and nice design. Perfect for my indoor plants.', TRUE, 4, NOW()),
(1, 8, 4, 'Convenient charging', 'Works well with my phone and the design is sleek. Fast charging too.', TRUE, 9, NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES
(1, 1, 1, NOW()),
(1, 3, 2, NOW()),
(1, 8, 1, NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Insert sample favorites
INSERT INTO favorites (user_id, product_id, created_at) VALUES
(1, 1, NOW()),
(1, 2, NOW()),
(1, 5, NOW()),
(1, 6, NOW())
ON DUPLICATE KEY UPDATE created_at = created_at;

-- Display summary of changes
SELECT 
    'Database upgrade completed successfully!' as status,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM reviews) as total_reviews,
    (SELECT COUNT(*) FROM cart) as total_cart_items,
    (SELECT COUNT(*) FROM favorites) as total_favorites;