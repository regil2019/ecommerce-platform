import React, { useMemo } from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { Dock } from './magicui/Dock';
import useCart from '../hooks/useCart';

export const FloatingDock = () => {
    const { cartItems } = useCart();

    const cartCount = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const dockItems = [
        { icon: Home, href: "/", label: "Home" },
        { icon: ShoppingBag, href: "/products", label: "Products" },
        { icon: ShoppingCart, href: "/cart", label: "Cart", badge: cartCount },
        { icon: User, href: "/profile", label: "Profile" },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center">
            <div className="pointer-events-auto">
                <Dock items={dockItems} className="glass-morphism border border-foreground/5 shadow-2xl rounded-full px-2" />
            </div>
        </div>
    );
};
