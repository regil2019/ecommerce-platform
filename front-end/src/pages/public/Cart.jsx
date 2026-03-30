import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, Shield, Trash2, Minus, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';
import { formatCurrency, getImageUrl } from '../../lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import { Button } from '../../components/ui/Button';
import ProductSuggestions from '../../components/ProductSuggestions';


export default function Cart() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : subtotal > 50 ? 9.99 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('cart.title')}</h1>
          {cartItems.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('cart.items', { count: String(cartItems.length) })}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center animate-fadeIn">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingCart size={40} />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t('cart.empty')}</h2>
            <p className="mb-8 text-muted-foreground max-w-md mx-auto">{t('cart.emptyDesc')}</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('cart.explore')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="border-b border-border p-6 last:border-b-0 transition-colors hover:bg-accent/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        {item.images?.length > 1 ? (
                          <Carousel className="w-24 h-24">
                            <CarouselContent>
                              {(item.images || []).map((img, idx) => (
                                <CarouselItem key={idx}>
                                  <img src={getImageUrl(img)} alt={`${item.name} ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-1 size-6" />
                            <CarouselNext className="right-1 size-6" />
                          </Carousel>
                        ) : (
                          <img
                            src={getImageUrl(item.images?.[0] || item.image)}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{item.description}</p>
                        <span className="text-primary font-semibold text-sm">
                          {formatCurrency(item.price)} {t('product.each')}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center font-medium text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                          title={t('cart.remove')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl border border-border shadow-card p-6">
                <ProductSuggestions title={t('cart.youMayAlsoLike')} limit={3} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-foreground">{t('cart.orderSummary')}</h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal', { count: String(cartItems.length) })}</span>
                    <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                      {shipping === 0 ? t('cart.freeShipping') : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.taxes')}</span>
                    <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
                  </div>
                  {subtotal < 100 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-primary font-medium">
                        {t('cart.freeShippingThreshold', { amount: formatCurrency(100 - subtotal) })}
                      </p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                      🎉 {t('cart.freeShipping')}!
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-foreground">{t('cart.total')}</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                {user ? (
                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t('cart.continueCheckout')}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium text-center block transition-colors"
                    >
                      {t('cart.loginToCheckout')}
                    </Link>
                    <p className="text-xs text-muted-foreground text-center">
                      {t('cart.or')}{' '}
                      <Link to="/register" className="text-primary hover:underline">{t('cart.createAccount')}</Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="bg-card rounded-xl border border-border shadow-card p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Shield className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{t('cart.securePayment')}</h3>
                      <p className="text-sm text-muted-foreground">{t('cart.securePaymentDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Truck className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{t('cart.expressDelivery')}</h3>
                      <p className="text-sm text-muted-foreground">{t('cart.expressDeliveryDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Cart */}
              <div className="bg-card rounded-xl border border-border shadow-card p-4">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full text-destructive hover:bg-destructive/10 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                >
                  <Trash2 className="inline mr-2" size={16} />
                  {t('cart.clearCart')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-xl animate-slideUp">
              <h3 className="text-lg font-bold mb-4 text-foreground">{t('cart.clearCartConfirm')}</h3>
              <p className="text-muted-foreground mb-6">{t('cart.clearCartDesc')}</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                    toast.success(t('cart.clearCartSuccess'));
                  }}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
