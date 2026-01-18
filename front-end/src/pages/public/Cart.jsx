import useCart from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiCreditCard, FiTruck, FiShield, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../../lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import ProductSuggestions from '../../components/ProductSuggestions';
import { useState } from 'react';

// Note: Stripe.js will show a warning about HTTP vs HTTPS during development.
// This is expected behavior and the warning will disappear in production when using HTTPS.
// See: https://stripe.com/docs/security#tls
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : subtotal > 50 ? 9.99 : 15.99; // Progressive shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Faça login para continuar com a compra');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    try {
      setLoading(true);
      const stripe = await stripePromise;
      const response = await api.post('/payment/create-checkout-session', { cartItems });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.join(', ') || 'Erro ao iniciar pagamento';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error('Erro ao atualizar quantidade');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
          {cartItems.length > 0 && (
            <span className="text-sm text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FiShoppingCart size={40} />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Seu carrinho está vazio</h2>
            <p className="mb-8 text-gray-600 max-w-md mx-auto">
              Parece que você ainda não adicionou nenhum produto ao carrinho.
              Explore nossa loja e encontre produtos incríveis!
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="border-b border-gray-200 p-6 last:border-b-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        {(item.images?.length > 1) ? (
                          <Carousel className="w-24 h-24">
                            <CarouselContent>
                              {(item.images || [item.image || '/images/placeholder-product.jpg']).map((img, idx) => (
                                <CarouselItem key={idx}>
                                  <img
                                    src={img}
                                    alt={`${item.name} - Image ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg"
                                  />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            {item.images?.length > 1 && (
                              <>
                                <CarouselPrevious className="left-1 size-6" />
                                <CarouselNext className="right-1 size-6" />
                              </>
                            )}
                          </Carousel>
                        ) : (
                          <img
                            src={item.images?.[0] || item.image || '/images/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-600 font-semibold">{formatCurrency(item.price)} each</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>

                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remover item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Suggestions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <ProductSuggestions title="Você pode gostar também" limit={3} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.length} itens)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Frete</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Impostos</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>

                  {subtotal < 100 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        Add {formatCurrency(25 - subtotal)} more for free shipping!
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {user ? (
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FiCreditCard className="mr-2" size={20} />
                        Finalizar Compra
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center block"
                    >
                      Fazer Login para Comprar
                    </Link>
                    <p className="text-xs text-gray-600 text-center">
                      Ou <Link to="/register" className="text-blue-600 hover:underline">criar conta</Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Security & Shipping Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiShield className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Pagamento Seguro</h3>
                      <p className="text-sm text-gray-600">Seus dados estão protegidos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiTruck className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Express Delivery</h3>
                      <p className="text-sm text-gray-600">Free shipping over $25</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Cart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  <FiTrash2 className="inline mr-2" size={16} />
                  Limpar Carrinho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Limpar Carrinho?</h3>
              <p className="text-gray-600 mb-6">
                Esta ação irá remover todos os itens do seu carrinho. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                    toast.success('Carrinho limpo com sucesso');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
