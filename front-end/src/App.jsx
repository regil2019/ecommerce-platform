import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NavBar from './components/navbar';
import Home from './pages/public/Home';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductNew from './pages/admin/ProductNew';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import AdminRoute from './components/admin/AdminRoute';
import UserProfile from './pages/public/UserProfile';
import OrderHistory from './pages/public/OrderHistory';
import OrderSuccess from './pages/public/OrderSuccess';
import OrderCancel from './pages/public/OrderCancel';
import Favorites from './pages/public/Favorites';
import Products from './pages/public/Products';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <ToastContainer />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <NavBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            {/* Wrapper for responsive spacing below navbar */}
            <div className="pt-20 px-2 sm:px-4 md:px-8 min-h-screen bg-gray-50">
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Home searchTerm={searchTerm} />} />
                <Route path="/products" element={<Products searchTerm={searchTerm} />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/about" element={<Home searchTerm={searchTerm} />} />

                {/* Rotas Admin */}
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
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </>
  );
}
