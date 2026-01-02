import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  FaUser,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt
} from 'react-icons/fa';

const UserMenu = ({ user, logout, onMenuItemClick }) => {
  const handleLogout = () => {
    logout();
    if (onMenuItemClick) onMenuItemClick();
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="user-menu" className="border-none">
        <AccordionTrigger
          className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold
          text-gray-800 hover:text-blue-600 hover:no-underline
          data-[state=open]:text-blue-600"
        >
          <FaUser className="h-4 w-4" />
          {user?.name || 'Minha Conta'}
        </AccordionTrigger>

        <AccordionContent className="pt-2">
          <div className="space-y-1">

            <Link
              to="/profile"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            >
              <FaUser className="h-4 w-4" />
              Meu Perfil
            </Link>

            <Link
              to="/orders"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            >
              <FaClipboardList className="h-4 w-4" />
              Meus Pedidos
            </Link>

            <Link
              to="/favorites"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            >
              <FaHeart className="h-4 w-4" />
              Favoritos
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm
                text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Sair
            </button>

          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UserMenu;
