import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import api from "../../services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
            // Update local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setError('Erro ao atualizar status do pedido');
        }
    };


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/api/admin/orders');
                console.log('Orders data:', response.data);
                // A API retorna { data: [], pagination: {} }
                const ordersData = response.data.data || [];
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch(err) {
                setError("Erro ao carregar pedidos");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Carregando pedidos...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 mx-auto mt-8 max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold">Todos os Pedidos</h2>
            {orders.length === 0 ? (
                <p>Nenhum pedido encontrado.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Data</th>
                                <th className="px-4 py-2 border">Cliente</th>
                                <th className="px-4 py-2 border">Total</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Itens</th>
                                <th className="px-4 py-2 border">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{order.id}</td>
                                    <td className="px-4 py-2 border">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {order.User ? order.User.name : 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        ${order.total?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <StatusBadge status={order.status} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {order.OrderItems?.length || 0} itens
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <Link 
                                            to={`/admin/orders/${order.id}`} 
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Ver detalhes
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
