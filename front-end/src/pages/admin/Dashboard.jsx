import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, BarChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatCard from '../../components/admin/StatCard';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].name}: {payload[0].value}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[1].name}: {formatCurrency(payload[1].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/stats');
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.totalRevenue?.total || 0)}
          description={`${stats.totalRevenue?.count || 0} vendas`}
          icon={<DollarSign />}
          colorClass="text-green-500"
        />
        <StatCard
          title="Pedidos"
          value={stats.orders?.total || 0}
          description={`${stats.orders?.pending || 0} pendentes`}
          icon={<ShoppingCart />}
          colorClass="text-blue-500"
        />
        <StatCard
          title="Produtos"
          value={stats.products?.total || 0}
          description={`${stats.products?.inactive || 0} inativos`}
          icon={<Package />}
          colorClass="text-purple-500"
        />
        <StatCard
          title="Categorias"
          value={stats.categories?.total || 0}
          description={`${stats.categories?.empty || 0} vazias`}
          icon={<BarChart />}
          colorClass="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats.salesLast7Days}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="vendas" name="Vendas" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#82ca9d" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats.ordersLast7Days}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="pedidos" name="Pedidos" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <ul className="space-y-4">
                {stats.recentOrders.map(order => (
                  <li key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-sm text-muted-foreground">{order.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">Nenhum pedido ainda</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
              <ul className="space-y-4">
                {stats.topSellingProducts.map(product => (
                  <li key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Vendas: {product.totalSold}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(product.price)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">Nenhuma venda ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}