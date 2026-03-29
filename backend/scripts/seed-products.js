import Product from '../src/models/Product.js';
import sequelize from '../src/config/database.js';

async function seedProducts() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      console.log(`Products already exist (${existingProducts} products)`);
      await sequelize.close();
      return;
    }

    const products = [
      {
        name: 'iPhone 14 Pro Max',
        price: 1099.99,
        description: 'Apple iPhone 14 Pro Max with A16 Bionic chip',
        images: ['https://images.unsplash.com/photo-1678188947769-42e40a85633e?w=800&h=600&fit=crop'],
        stock: 50,
        categoryId: null,
        weight: 0.240,
        isActive: true,
        slug: 'iphone-14-pro-max',
        short_description: 'Apple iPhone 14 Pro Max',
        original_price: 1199.99,
        discount_percentage: 8,
        main_image: 'https://images.unsplash.com/photo-1678188947769-42e40a85633e?w=800&h=600&fit=crop',
        sku: 'IPH14PM',
        is_featured: true,
        dimensions: '160.7 x 77.6 x 7.8 mm',
        tags: ['apple', 'iphone', 'smartphone']
      },
      {
        name: 'MacBook Air M2',
        price: 1199.99,
        description: 'Apple MacBook Air with M2 chip',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'],
        stock: 25,
        categoryId: null,
        weight: 1.29,
        isActive: true,
        slug: 'macbook-air-m2',
        short_description: 'Apple MacBook Air with M2 chip',
        original_price: 1299.99,
        discount_percentage: 8,
        main_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
        sku: 'MBAIRM2',
        is_featured: true,
        dimensions: '304.1 x 215.4 x 16.1 mm',
        tags: ['apple', 'macbook', 'laptop']
      }
    ];

    await Product.bulkCreate(products);
    console.log(`Successfully added ${products.length} products`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

seedProducts();