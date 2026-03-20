import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Tag, Loader2, Check, AlertCircle, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';
import { createCheckoutSession, validatePromoCode } from '../../services/paymentApi';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { ShimmerButton } from '../../components/magicui/ShimmerButton';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const CURRENCIES = [
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'RUB', symbol: '₽', label: 'Russian Ruble' },
];

export default function Checkout() {
    const { cartItems, total: cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const [currency, setCurrency] = useState('EUR');
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = promoResult?.discount_amount ?? 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');
        setPromoResult(null);

        try {
            const result = await validatePromoCode(promoCode.trim(), subtotal);
            if (result.valid) {
                setPromoResult(result);
                toast.success(t('checkout.promoApplied'));
            } else {
                setPromoError(result.error || t('checkout.promoInvalid'));
            }
        } catch (err) {
            const msg = err.response?.data?.error || t('checkout.promoInvalid');
            setPromoError(msg);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error(t('cart.loginToCheckout'));
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) return;

        setCheckoutLoading(true);
        try {
            // Check if Stripe is initialized (even if session is created on backend, 
            // the redirect might fail if Stripe.js is blocked)
            const stripe = await stripePromise;
            if (!stripe && !import.meta.env.DEV) {
                console.error("Stripe.js failed to load. Check your network or content security policy.");
                toast.warning(t('common.errorNetwork') + " (Stripe.js)");
            }

            const result = await createCheckoutSession({
                currency,
                promo_code: promoResult ? promoCode.trim() : undefined,
            });
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            toast.error(msg);
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">{t('checkout.title')}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left — Cart items & promo */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Items */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="font-semibold text-foreground mb-4">{t('checkout.step1')}</h2>
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={item.cartId || `${item.id}-${index}`} className="flex items-center gap-4">
                                        <img
                                            src={item.images?.[0] || item.image || '/images/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-foreground">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Promo Code */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                {t('checkout.promoCode')}
                            </h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        setPromoError('');
                                        setPromoResult(null);
                                    }}
                                    placeholder="PROMO2025"
                                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring"
                                />
                                <Button
                                    onClick={handleValidatePromo}
                                    disabled={promoLoading || !promoCode.trim()}
                                    variant="outline"
                                >
                                    {promoLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        t('checkout.applyPromo')
                                    )}
                                </Button>
                            </div>
                            {promoResult && (
                                <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                    <Check className="h-4 w-4" />
                                    <span>{t('checkout.promoApplied')} — {t('checkout.discount')}: {formatCurrency(discount)}</span>
                                </div>
                            )}
                            {promoError && (
                                <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{promoError}</span>
                                </div>
                            )}
                        </div>

                        {/* Currency */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="font-semibold text-foreground mb-4">{t('checkout.currency')}</h2>
                            <div className="flex gap-2">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => setCurrency(c.code)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${currency === c.code
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        {c.symbol} {c.code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-xl p-6 sticky top-24 space-y-4">
                            <h2 className="font-semibold text-foreground text-lg">{t('cart.orderSummary')}</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t('cart.subtotal', { count: String(cartItems.length) })}</span>
                                    <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>{t('checkout.discount')}</span>
                                        <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border pt-4">
                                <div className="flex justify-between text-lg font-bold text-foreground">
                                    <span>{t('cart.total')}</span>
                                    <span>{formatCurrency(finalTotal)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('checkout.currency')}: {currency}
                                </p>
                            </div>

                            <ShimmerButton
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className="w-full py-3 text-base font-bold mt-2 text-white dark:text-slate-950 shadow-lg shadow-primary/20"
                                background="hsl(var(--primary))"
                                shimmerColor="hsl(var(--primary-foreground))"
                            >
                                {checkoutLoading ? (
                                    <span className="flex items-center justify-center gap-2 relative z-10">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {t('checkout.redirecting')}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2 relative z-10">
                                        <CreditCard className="h-5 w-5" />
                                        {t('checkout.placeOrder')}
                                    </span>
                                )}
                            </ShimmerButton>

                            {/* Trust & Reassurance */}
                            <div className="mt-6 pt-6 border-t border-border space-y-4">
                                <div className="flex items-center justify-center gap-4 text-muted-foreground/50">
                                    <ShieldCheck className="h-6 w-6" />
                                    <Lock className="h-6 w-6" />
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                    {t('checkout.securePayment')} • 256-bit SSL Encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
