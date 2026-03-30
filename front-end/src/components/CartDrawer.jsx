import { X, ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { useI18n } from '../i18n';
import { formatCurrency, getImageUrl } from '../lib/utils';

export default function CartDrawer() {
  const { cartItems, isDrawerOpen, setIsDrawerOpen, removeFromCart, updateQuantity, total } = useCart();
  const { t } = useI18n();

  const FREE_SHIPPING_THRESHOLD = 100;
  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">{t('cart.title')}</h2>
            {cartItems.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {cartItems.length > 0 && (
          <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
            {total >= FREE_SHIPPING_THRESHOLD ? (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <span>🎉</span>
                {t('cart.freeShipping')}!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-1.5">
                {t('cart.freeShippingThreshold', { amount: formatCurrency(remaining) })}
              </p>
            )}
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">{t('cart.empty')}</p>
              <Link
                to="/products"
                onClick={() => setIsDrawerOpen(false)}
                className="mt-4 text-xs text-primary hover:underline"
              >
                {t('cart.explore')}
              </Link>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
              >
                <img
                  src={getImageUrl(item.images?.[0] || item.image)}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.name}</h3>
                  {item.selectedSize && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('cart.size', { size: item.selectedSize })}
                    </p>
                  )}
                  <p className="text-sm font-bold text-primary mt-1">{formatCurrency(item.price * item.quantity)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold w-6 text-center text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-destructive/60 hover:text-destructive transition-colors p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('cart.total')}</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                {t('cart.title')}
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('cart.checkout')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
