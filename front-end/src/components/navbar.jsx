import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import UserMenu from './UserMenu';

const NavBar = ({ searchTerm, setSearchTerm }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ---------------- CART COUNT ---------------- */
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------------- ESC CLOSE MOBILE MENU ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300
        ${scrolled ? 'bg-white/90 backdrop-blur shadow-sm' : 'bg-white'}
        dark:bg-gray-900 dark:border-gray-800`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/lumo-logo.png"
              alt="Lumo"
              className="h-16 md:h-20 w-auto -mt-0.5"
            />
          </Link>

          {/* SEARCH DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-xl px-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              <FaSearch className="absolute right-4 top-3 text-gray-400 text-sm" />
            </div>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-6">

            {/* CART */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-blue-600 dark:text-gray-100"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center
                  rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER */}
            {user ? (
              user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="text-sm font-semibold hover:text-blue-600"
                >
                  Admin
                </Link>
              ) : (
                <UserMenu user={user} logout={logout} />
              )
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold hover:text-blue-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden text-gray-800 dark:text-gray-100"
            aria-label="Menu"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="relative z-50 bg-white dark:bg-gray-900 border-t dark:border-gray-800 md:hidden">
            <div className="space-y-4 px-4 py-4">

              {/* SEARCH MOBILE */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2 text-sm
                    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
                <FaSearch className="absolute right-4 top-3 text-gray-400 text-sm" />
              </div>

              {/* CART */}
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <FaShoppingCart />
                Carrinho
                {cartCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* USER */}
              {user ? (
                user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-semibold"
                  >
                    Admin
                  </Link>
                ) : (
                  <UserMenu
                    user={user}
                    logout={logout}
                    onMenuItemClick={() => setIsMenuOpen(false)}
                  />
                )
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-semibold"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

NavBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired
};

export default NavBar;
