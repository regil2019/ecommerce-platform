import Product from './Product.js'
import Category from './Category.js'
import Review from './Review.js'
import User from './User.js'
import Favorite from './Favorite.js'
import Order from './Order.js'
import OrderItem from './OrderItem.js'
import Cart from './Cart.js'
import UserBehavior from './UserBehavior.js'
import Promotion from './Promotion.js'

// Configurar associações
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' })
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })

// Review associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'CASCADE' })
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews', onDelete: 'CASCADE' })
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// Favorite associations
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites', onDelete: 'CASCADE' })
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites', onDelete: 'CASCADE' })
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// Order associations
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'orderItems', onDelete: 'CASCADE' })
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems', onDelete: 'RESTRICT' }) // Prevent deleting products with orders
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// Cart associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems', onDelete: 'CASCADE' })
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems', onDelete: 'CASCADE' })
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// UserBehavior associations
User.hasMany(UserBehavior, { foreignKey: 'user_id', as: 'behaviors', onDelete: 'CASCADE' })
UserBehavior.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Product.hasMany(UserBehavior, { foreignKey: 'product_id', as: 'behaviors', onDelete: 'CASCADE' })
UserBehavior.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

export {
  Product,
  Category,
  Review,
  User,
  Favorite,
  Order,
  OrderItem,
  Cart,
  UserBehavior,
  Promotion
}
