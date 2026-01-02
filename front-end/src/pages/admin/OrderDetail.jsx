import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import OrderTracking from '../../components/OrderTracking';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Erro ao carregar pedido:', err);
                toast.error('Erro ao carregar detalhes do pedido');
                navigate('/admin/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const updateOrderStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/api/admin/orders/${id}/status`, { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
            toast.success('Status atualizado com sucesso');
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            toast.error('Erro ao atualizar status do pedido');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando detalhes do pedido...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center">Pedido não encontrado.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Pedido #{order.id}</h2>
                <Button
                    onClick={() => navigate('/admin/orders')}
                    variant="outline"
                >
                    Voltar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Informações do Pedido</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <p><span className="font-medium">Data do Pedido:</span> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><span className="font-medium">Última Atualização:</span> {new Date(order.updatedAt).toLocaleString()}</p>
                        <p><span className="font-medium">Total:</span> $ {order.total?.toFixed(2)}</p>
                        <p><span className="font-medium">Status do Pagamento:</span> {order.PaymentStatus}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Nome:</span> {order.User?.name}</p>
                        <p><span className="font-medium">Email:</span> {order.User?.email}</p>
                        <p><span className="font-medium">Endereço:</span> {order.User?.address || 'Não informado'}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Atualizar Status</h3>
                <div className="flex items-center gap-4">
                    <Select
                        value={order.status}
                        onValueChange={updateOrderStatus}
                        disabled={updating}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    {updating && <span className="text-sm text-gray-500">Atualizando...</span>}
                </div>
            </div>

            <OrderTracking
                status={order.status}
                createdAt={order.createdAt}
                updatedAt={order.updatedAt}
            />

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 border text-left">Produto</th>
                                <th className="px-4 py-2 border text-center">Quantidade</th>
                                <th className="px-4 py-2 border text-right">Preço Unitário</th>
                                <th className="px-4 py-2 border text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.OrderItems?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">
                                        <div className="flex items-center gap-3">
                                            {item.Product?.images?.[0] && (
                                                <img
                                                    src={item.Product.images[0]}
                                                    alt={item.Product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.Product?.name}</p>
                                                {item.Product?.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-1">
                                                        {item.Product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 border text-right">$ {item.price?.toFixed(2)}</td>
                                    <td className="px-4 py-2 border text-right">
                                        $ {(item.quantity * item.price)?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50">
                                <td colSpan="3" className="px-4 py-2 border text-right font-semibold">
                                    Total do Pedido:
                                </td>
                                <td className="px-4 py-2 border text-right font-semibold">
                                    $ {order.total?.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}