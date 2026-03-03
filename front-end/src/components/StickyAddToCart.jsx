import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RainbowButton } from './magicui/RainbowButton';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart } from 'lucide-react';

export const StickyAddToCart = ({ product, quantity, onIncrement, onDecrement, onAddToCart, isVisible }) => {
    if (!product) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                        {/* Product Info (Hidden on small mobile) */}
                        <div className="hidden sm:flex items-center gap-3">
                            <img
                                src={product.images?.[0] || product.image}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover border border-border"
                            />
                            <div>
                                <h3 className="font-semibold text-foreground text-sm line-clamp-1">{product.name}</h3>
                                <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
                            {/* Quantity - simplified */}
                            <div className="flex items-center rounded-lg border border-border bg-card h-10">
                                <button onClick={onDecrement} className="px-3 hover:bg-accent text-foreground">-</button>
                                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                <button onClick={onIncrement} className="px-3 hover:bg-accent text-foreground">+</button>
                            </div>

                            <RainbowButton onClick={onAddToCart} className="h-10 px-6 text-sm">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </RainbowButton>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
