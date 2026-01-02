import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/ui/StatusBadge';
import OrderTracking from '../../components/OrderTracking';

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders');
        setOrders(data.data || []);
      } catch (err) {
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Meus Pedidos</h2>
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Pedido #{order.id}</span>
                  <span className="ml-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  Ver detalhes
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                Status: <StatusBadge status={order.status} />
              </div>
              <div className="mt-2 text-sm text-gray-700">Total: Kz {order.total?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes do pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedOrder(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Detalhes do Pedido #{selectedOrder.id}</h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-700">Status:</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className="mb-2 text-sm text-gray-700">Total: Kz {selectedOrder.total?.toFixed(2)}</div>
              <div className="mb-4 text-sm text-gray-700">Data: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            </div>

            <OrderTracking
              status={selectedOrder.status}
              createdAt={selectedOrder.createdAt}
              updatedAt={selectedOrder.updatedAt}
            />

            <div className="mt-6">
              <span className="font-semibold">Itens:</span>
              <ul className="list-disc ml-6 mt-2">
                {selectedOrder.OrderItems?.map(item => (
                  <li key={item.id} className="mb-1">
                    {item.Product?.name} - {item.quantity} x Kz {item.price?.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
