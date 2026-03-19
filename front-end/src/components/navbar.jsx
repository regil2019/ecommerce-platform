import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Sun, Moon, User, LogOut, Heart, LayoutDashboard, Package } from 'lucide-react';
import useCart from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar({ searchTerm, setSearchTerm }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems: cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale, LOCALES } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Block scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-background/80 backdrop-blur-md shadow-md border-b border-border'
        : 'bg-background/50 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/25">
              E
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 font-display">
              Elevate
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-[280px] mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full bg-secondary/50 border-border border-2 text-foreground rounded-full pl-12 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 group-hover:bg-secondary/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-primary transition-colors duration-300" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/products" className="text-foreground/80 hover:text-primary font-medium transition-colors duration-200">
              {t('nav.products')}
            </Link>

            <Link to="/about" className="text-foreground/80 hover:text-primary font-medium transition-colors duration-200">
              {t('nav.about')}
            </Link>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary transition-colors">
                <span className="text-xl">{LOCALES[locale].flag}</span>
                <span className="font-medium text-sm">{LOCALES[locale].name}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-card rounded-xl shadow-lg border border-border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                {Object.entries(LOCALES).map(([key, { name, flag }]) => (
                  <button
                    key={key}
                    onClick={() => setLocale(key)}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary transition-colors flex items-center gap-3 ${locale === key ? 'bg-primary/10 text-primary' : ''
                      }`}
                  >
                    <span className="text-xl">{flag}</span>
                    <span className="font-medium text-sm">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-foreground/80 transition-all duration-300 hover:rotate-90"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Actions */}
            {!user ? (
              <Link
                to="/login"
                className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5"
              >
                {t('nav.login')}
              </Link>
            ) : (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="p-2 rounded-full hover:bg-secondary text-foreground/80 transition-colors relative group">
                    <LayoutDashboard size={20} />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Dashboard
                    </span>
                  </Link>
                )}

                <Link to="/favorites" className="p-2 rounded-full hover:bg-secondary text-foreground/80 transition-colors relative group">
                  <Heart size={20} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('nav.favorites')}
                  </span>
                </Link>

                <Link to="/orders" className="p-2 rounded-full hover:bg-secondary text-foreground/80 transition-colors relative group">
                  <Package size={20} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('nav.orders')}
                  </span>
                </Link>

                <Link to="/profile" className="p-2 rounded-full hover:bg-secondary text-foreground/80 transition-colors relative group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-secondary text-foreground/80 hover:text-destructive transition-colors relative group"
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('nav.logout')}
                  </span>
                </button>
              </>
            )}


            <div className="flex items-center gap-2 border-l border-border/50 pl-4 ml-2">
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-secondary text-foreground/80 transition-all duration-300 hover:scale-110 group">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg border-2 border-background animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-secondary text-foreground transition-colors">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-[280px] sm:w-[350px] bg-background border-l border-border shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <span className="font-bold text-xl text-primary">Elevate</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-secondary text-foreground"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-8 flex-grow">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder={t('common.search')}
                      className="w-full bg-secondary/50 border-border border-2 text-foreground rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-all text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </form>

                  <nav className="flex flex-col gap-2">
                    <Link
                      to="/products"
                      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-semibold transition-all group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package size={22} className="text-muted-foreground group-hover:text-primary" />
                      {t('nav.products')}
                    </Link>

                    <Link
                      to="/about"
                      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-semibold transition-all group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Search size={22} className="text-muted-foreground group-hover:text-primary" />
                      {t('nav.about')}
                    </Link>

                    <div className="h-px bg-border/50 my-2" />

                    {!user ? (
                      <div className="space-y-3 pt-2">
                        <Link
                          to="/login"
                          className="flex items-center justify-center w-full px-4 py-3 rounded-xl border-2 border-border text-foreground font-bold hover:bg-secondary transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.login')}
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.register')}
                        </Link>
                      </div>
                    ) : (
                      <>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-all"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <LayoutDashboard size={22} className="text-primary" />
                            Dashboard
                          </Link>
                        )}
                        <Link
                          to="/favorites"
                          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart size={22} className="text-primary" />
                          {t('nav.favorites')}
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package size={22} className="text-primary" />
                          {t('nav.orders')}
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary text-foreground font-medium transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={22} className="text-primary" />
                          {t('nav.profile')}
                        </Link>
                      </>
                    )}
                  </nav>
                </div>

                <div className="p-6 bg-secondary/20 border-t border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-semibold text-sm">{t('theme.toggle')}</span>
                    <button
                      onClick={toggleTheme}
                      className="p-2.5 rounded-full bg-background border border-border text-foreground shadow-sm active:scale-95 transition-all"
                    >
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>

                  {user && (
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive font-bold transition-all"
                    >
                      <LogOut size={22} />
                      {t('nav.logout')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
