import PropTypes from 'prop-types';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'bg-gray-700 text-white'
      : 'text-gray-300 hover:bg-gray-700';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className={`bg-primary min-h-screen p-3 flex flex-col fixed inset-y-0 left-0 z-50 w-64 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between mb-8">
          <div className="text-white text-xl font-bold">{t("admin.virtualStore")}</div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden text-white hover:text-gray-300 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <NavLink
            to="/admin"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("admin.dashboard")}
          </NavLink>
          <NavLink
            to="/admin/products"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin/products')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("admin.products")}
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={`block p-2 rounded transition-colors ${getLinkClass('/admin/orders')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("admin.orders")}
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/admin/categories"
                className={`block p-2 rounded transition-colors ${getLinkClass('/admin/categories')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("admin.categories")}
              </NavLink>
              <NavLink
                to="/admin/users"
                className={`block p-2 rounded transition-colors ${getLinkClass('/admin/users')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("admin.users")}
              </NavLink>
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-gray-700 pt-4">
          <div className="text-gray-400 text-sm mb-2">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full p-2 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            {t("nav.exitSystem")}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <div className="flex-1 md:ml-0">
        <div className="p-4 bg-muted md:hidden">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-foreground hover:text-foreground/80 p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 md:p-8 bg-muted">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {};