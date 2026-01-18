import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  Heart,
  Package,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { Button } from './ui/Button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navLinkClasses =
  'text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors';
const activeNavLinkClasses = 'text-gray-900 font-semibold';

const NavBar = ({ searchTerm, setSearchTerm }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const renderUserMenu = (isMobile = false) => {
    const menuTrigger = (
      <Button variant="ghost" size="icon" className="rounded-full">
        <User className="h-5 w-5" />
      </Button>
    );

    const menuContent = (
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders">
            <Package className="mr-2 h-4 w-4" />
            <span>Meus Pedidos</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">
            <Heart className="mr-2 h-4 w-4" />
            <span>Favoritos</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    );

    if (isMobile) {
      // No modo mobile, os links são mostrados diretamente no Sheet
      return (
        <div className="space-y-2">
          <p className="font-semibold px-2">{user.name}</p>

          <SheetClose asChild>
            <Link
              to="/profile"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              <User className="h-5 w-5" /> Perfil
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/orders"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              <Package className="h-5 w-5" /> Pedidos
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/favorites"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              <Heart className="h-5 w-5" /> Favoritos
            </Link>
          </SheetClose>

          {user.role === 'admin' && (
            <SheetClose asChild>
              <Link
                to="/admin"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
              >
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
            </SheetClose>
          )}

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-2 p-2"
          >
            <LogOut className="h-5 w-5" /> Sair
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
        {menuContent}
      </DropdownMenu>
    );
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/images/lumo-logo.png"
              alt="Lumo"
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? activeNavLinkClasses : navLinkClasses
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? activeNavLinkClasses : navLinkClasses
              }
            >
              Produtos
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? activeNavLinkClasses : navLinkClasses
              }
            >
              Sobre
            </NavLink>
          </nav>

          {/* Ações e Busca */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Barra de Busca Desktop */}
            <div className="hidden sm:flex flex-1 max-w-xs">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border bg-gray-50 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ações do Usuário */}
            <div className="flex items-center gap-2">
              {/* Carrinho: sem asChild, navegação via onClick */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Login / Menu do usuário */}
              {user ? (
                renderUserMenu()
              ) : (
                <Button onClick={() => navigate('/login')}>Login</Button>
              )}
            </div>

            {/* Menu Mobile Trigger */}
            <div className="md:hidden">
              <Sheet>
                {/* Trigger simples sem asChild */}
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="sr-only">
                      Menu de Navegação
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Menu de navegação principal com links para diferentes seções do site
                    </SheetDescription>
                  </SheetHeader>

                  <div className="p-4">
                    <div className="mb-8">
                      <img
                        src="/images/lumo-logo.png"
                        alt="Lumo"
                        className="h-16 w-auto"
                      />
                    </div>

                    {/* Busca Mobile */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full border bg-gray-50 pl-10 pr-4 py-2 text-sm"
                      />
                    </div>

                    {/* Navegação Mobile */}
                    <nav className="flex flex-col space-y-2 mb-6">
                      <SheetClose asChild>
                        <NavLink
                          to="/"
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          Home
                        </NavLink>
                      </SheetClose>
                      <SheetClose asChild>
                        <NavLink
                          to="/products"
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          Produtos
                        </NavLink>
                      </SheetClose>
                      <SheetClose asChild>
                        <NavLink
                          to="/about"
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          Sobre
                        </NavLink>
                      </SheetClose>
                    </nav>

                    <div className="border-t pt-4">
                      {user ? (
                        renderUserMenu(true)
                      ) : (
                        // Login mobile: Link direto dentro do SheetClose
                        <SheetClose asChild>
                          <Link
                            to="/login"
                            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
                          >
                            Login
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

NavBar.propTypes = {
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func.isRequired,
};

export default NavBar;
