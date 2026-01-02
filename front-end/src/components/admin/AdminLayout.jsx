import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estilo para links ativos
  const getLinkClass = (path) => {
    return location.pathname === path 
      ? 'bg-gray-700 text-white'
      : 'text-gray-300 hover:bg-gray-700';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu Lateral */}
      <div className={`bg-primary min-h-screen p-3 flex flex-col fixed inset-y-0 left-0 z-50 w-64 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between mb-8">
          <div className="text-white text-xl font-bold">Loja Virtual</div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden text-white hover:text-gray-300 p-2"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavLink
            to="/admin"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin/products')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Produtos
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin/orders')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Pedidos
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/admin/categories"
                className={`block p-2 rounded transition-colors ${getLinkClass('/admin/categories')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Categorias
              </NavLink>
              <NavLink
                to="/admin/users"
                className={`block p-2 rounded transition-colors ${getLinkClass('/admin/users')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Usuários
              </NavLink>
            </>
          )}
        </nav>

        {/* Seção de Logout */}
        <div className="mt-auto border-t border-gray-700 pt-4">
          <div className="text-gray-400 text-sm mb-2">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full p-2 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            Sair do Sistema
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 md:ml-0">
        <div className="p-4 bg-gray-50 md:hidden">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-700 hover:text-gray-900 p-2"
          >
            <FaBars className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 md:p-8 bg-gray-50">
          <Outlet /> {/* Isso renderizará as sub-rotas */}
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {};