import Product from './Product.js'
import Category from './Category.js'
import Review from './Review.js'
import User from './User.js'
import Favorite from './Favorite.js'
import Order from './Order.js'
import OrderItem from './OrderItem.js'
import Cart from './Cart.js'
import PasswordReset from './PasswordReset.js'
import UserBehavior from './UserBehavior.js'

// Configurar associações
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

// Review associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' })
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' })
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// Favorite associations
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' })
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Product.hasMany(Favorite, { foreignKey: 'productId', as: 'favorites' })
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// Order associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' })
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// Cart associations
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' })
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartItems' })
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// UserBehavior associations
User.hasMany(UserBehavior, { foreignKey: 'userId', as: 'behaviors' })
UserBehavior.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Product.hasMany(UserBehavior, { foreignKey: 'productId', as: 'behaviors' })
UserBehavior.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

export {
  Product,
  Category,
  Review,
  User,
  Favorite,
  Order,
  OrderItem,
  Cart,
  PasswordReset,
  UserBehavior
}
