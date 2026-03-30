import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { FloatingDock } from './components/FloatingDock';
import NavBar from './components/navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AdminRoute from './components/admin/AdminRoute';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';

/* Public pages — lazy loaded for code splitting */
const Home = lazy(() => import('./pages/public/Home'));
const Products = lazy(() => import('./pages/public/Products'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const UserProfile = lazy(() => import('./pages/public/UserProfile'));
const OrderHistory = lazy(() => import('./pages/public/OrderHistory'));
const OrderSuccess = lazy(() => import('./pages/public/OrderSuccess'));
const OrderCancel = lazy(() => import('./pages/public/OrderCancel'));
const Favorites = lazy(() => import('./pages/public/Favorites'));
const About = lazy(() => import('./pages/public/About'));
const PublicCategories = lazy(() => import('./pages/public/Categories'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));

/* Admin pages — lazy loaded */
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const ProductNew = lazy(() => import('./pages/admin/ProductNew'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Users = lazy(() => import('./pages/admin/Users'));
const Categories = lazy(() => import('./pages/admin/Categories'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

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
            <CartDrawer />

            <div className="pt-20 min-h-screen bg-background text-foreground transition-colors duration-300 pb-24">
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </div>

            <FloatingDock />

            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </>
  );
}
