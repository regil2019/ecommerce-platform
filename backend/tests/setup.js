// Jest setup file
import dotenv from 'dotenv';
import {Sequelize} from 'sequelize';
import { Product, Category, Review, User, Favorite, Order, OrderItem, Cart } from '../src/models/index.js';

// Load environment variables
dotenv.config();

// Setup test database
const testDb = new Sequelize(
  process.env.TEST_DB_NAME || 'ecommerce_test',
  process.env.TEST_DB_USER || 'root',
  process.env.TEST_DB_PASSWORD || '',
  {
    host: process.env.TEST_DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

global.testDb = testDb;

// Initialize models with testDb
Product.init(Product.rawAttributes, { sequelize: testDb, modelName: 'Product' });
Category.init(Category.rawAttributes, { sequelize: testDb, modelName: 'Category' });
Review.init(Review.rawAttributes, { sequelize: testDb, modelName: 'Review' });
User.init(User.rawAttributes, { sequelize: testDb, modelName: 'User' });
Favorite.init(Favorite.rawAttributes, { sequelize: testDb, modelName: 'Favorite' });
Order.init(Order.rawAttributes, { sequelize: testDb, modelName: 'Order' });
OrderItem.init(OrderItem.rawAttributes, { sequelize: testDb, modelName: 'OrderItem' });
Cart.init(Cart.rawAttributes, { sequelize: testDb, modelName: 'Cart' });

// Set up associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Favorite, { foreignKey: 'productId', as: 'favorites' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartItems' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Global test setup
beforeAll(async () => {
  try {
    await testDb.authenticate();
    console.log('Test database connection established successfully.');
    // Sync database schema
    await testDb.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
  }
});

// Global test teardown
afterAll(async () => {
  await testDb.close();
});

// Global test cleanup
afterEach(async () => {
  // Clean up test data after each test
  const models = Object.keys(testDb.models);
  for (const modelName of models) {
    await testDb.models[modelName].destroy({ where: {}, force: true });
  }
});
