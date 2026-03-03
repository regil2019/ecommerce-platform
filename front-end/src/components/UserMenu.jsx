import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { User, ClipboardList, Heart, LogOut } from 'lucide-react';
import { useI18n } from '@/i18n';

const UserMenu = ({ user, logout, onMenuItemClick }) => {
  const { t } = useI18n();

  const handleLogout = () => {
    logout();
    if (onMenuItemClick) onMenuItemClick();
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="user-menu" className="border-none">
        <AccordionTrigger
          className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold
          text-foreground hover:text-primary hover:no-underline
          data-[state=open]:text-primary"
        >
          <User className="h-4 w-4" />
          {user?.name || t('nav.myAccount')}
        </AccordionTrigger>

        <AccordionContent className="pt-2">
          <div className="space-y-1">
            <Link
              to="/profile"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-muted-foreground hover:bg-accent hover:text-primary transition"
            >
              <User className="h-4 w-4" />
              {t('nav.profile')}
            </Link>

            <Link
              to="/orders"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-muted-foreground hover:bg-accent hover:text-primary transition"
            >
              <ClipboardList className="h-4 w-4" />
              {t('nav.orders')}
            </Link>

            <Link
              to="/favorites"
              onClick={onMenuItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm
                text-muted-foreground hover:bg-accent hover:text-primary transition"
            >
              <Heart className="h-4 w-4" />
              {t('nav.favorites')}
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm
                text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UserMenu;
