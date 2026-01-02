import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setError('ID da sessão não encontrado');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payment/order-by-session/${sessionId}`);
      setOrder(response.data);

      // Clear cart after successful order
      clearCart();

      toast.success('Pedido realizado com sucesso!');
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Erro ao carregar detalhes do pedido');
      toast.error('Erro ao carregar detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle size={48} className="mx-auto mb-2" />
            <h2 className="text-xl font-bold">Erro ao carregar pedido</h2>
          </div>
          <p className="mb-6 text-gray-700">{error || 'Não foi possível carregar os detalhes do pedido.'}</p>
          <Link
            to="/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Realizado com Sucesso!</h1>
          <p className="text-gray-600 mb-4">
            Obrigado por sua compra. Seu pedido foi recebido e está sendo processado.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              <strong>Número do Pedido:</strong> #{order.id}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Data:</strong> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Itens do Pedido
              </h2>
              <div className="space-y-4">
                {order.OrderItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <img
                        src={item.Product?.images?.[0] || '/images/placeholder-product.jpg'}
                        alt={item.Product?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.Product?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Truck className="mr-2" size={20} />
                Informações de Entrega
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Endereço:</strong> {order.shippingAddress || 'Será informado em breve'}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> {order.status === 'completed' ? 'Confirmado' : 'Processando'}
                </p>
                <p className="text-gray-700">
                  <strong>Previsão de Entrega:</strong> 3-5 dias úteis
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                Status do Pedido
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Pagamento confirmado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Pedido sendo preparado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Enviado para entrega</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Entregue</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Ações</h2>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
                >
                  Ver Todos os Pedidos
                </Link>
                <Link
                  to="/"
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors block text-center"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            📧 Um email de confirmação foi enviado para seu endereço de email com todos os detalhes do pedido.
          </p>
        </div>
      </div>
    </div>
  );
}
