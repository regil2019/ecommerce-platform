import { ShoppingCart, Package, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsCart from '../../components/admin/StatsCart';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    sales: 0,
    products: 0,
    orders: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6 mt-8 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCart 
  title="Vendas Totais" 
  value={`${stats.sales.toFixed(2)}`}
  icon={<ShoppingCart className="w-6 h-6" />}
  trend="+12.5%"
  trendType="positive"
/>
       <StatsCart 
  title="Produtos Ativos" 
  value={stats.products}
  icon={<Package className="w-6 h-6" />}
  trend="+5.2%"
  trendType="positive"
/>
       <StatsCart 
  title="Pedidos Pendentes" 
  value={stats.orders}
  icon={<ClipboardList className="w-6 h-6" />}
  trend="-3.1%"
  trendType="negative"
/>
      </div>
    </div>
  );
}