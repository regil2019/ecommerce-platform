import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { FloatingDock } from './components/FloatingDock';

import NavBar from './components/navbar';
import Footer from './components/Footer';

/* Public pages */
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import UserProfile from './pages/public/UserProfile';
import OrderHistory from './pages/public/OrderHistory';
import OrderSuccess from './pages/public/OrderSuccess';
import OrderCancel from './pages/public/OrderCancel';
import Favorites from './pages/public/Favorites';
import About from './pages/public/About';
import PublicCategories from './pages/public/Categories';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

/* Admin pages */
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductNew from './pages/admin/ProductNew';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import AdminRoute from './components/admin/AdminRoute';

/* Providers */
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        theme="colored"
      />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <NavBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="pt-20 min-h-screen bg-background text-foreground transition-colors duration-300 pb-24">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home searchTerm={searchTerm} />} />
                <Route path="/products" element={<Products searchTerm={searchTerm} />} />
                <Route path="/categories" element={<PublicCategories />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/about" element={<About />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductNew />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Routes>
            </div>

            <FloatingDock />

            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </>
  );
}
