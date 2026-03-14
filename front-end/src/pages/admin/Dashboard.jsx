import { useEffect, useState } from "react";
import { useAuth } from '../../hooks/useAuth';
import { DollarSign, ShoppingCart, Package, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import StatCard from "../../components/admin/StatCard";
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line } from "recharts";
import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";
import { useI18n } from "../../i18n";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].name}: {payload[0].value}
            </span>
            {payload[1] && (
              <span className="font-bold text-muted-foreground">
                {payload[1].name}: {formatCurrency(payload[1].value)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const loadStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/stats");
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Dashboard stats error:", err);
        setError(t("common.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("admin.dashboard")}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("admin.totalRevenue")}
          value={formatCurrency(stats.totalRevenue?.total || 0)}
          description={`${stats.totalRevenue?.count || 0} ${t("admin.sales")}`}
          icon={<DollarSign />}
          colorClass="text-green-500"
        />
        <StatCard
          title={t("admin.totalOrders")}
          value={stats.orders?.total || 0}
          description={`${stats.orders?.pending || 0} ${t("admin.pending")}`}
          icon={<ShoppingCart />}
          colorClass="text-blue-500"
        />
        <StatCard
          title={t("admin.totalProducts")}
          value={stats.products?.total || 0}
          description={`${stats.products?.inactive || 0} ${t("common.inactive")}`}
          icon={<Package />}
          colorClass="text-purple-500"
        />
        <StatCard
          title={t("admin.totalCategories")}
          value={stats.categories?.total || 0}
          description={`${stats.categories?.empty || 0} ${t("admin.empty")}`}
          icon={<BarChart />}
          colorClass="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.salesChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats.salesLast7Days}>
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="vendas" name={t("admin.sales")} fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="total" name={t("common.total")} stroke="#82ca9d" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.ordersChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stats.ordersLast7Days}>
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="pedidos" name={t("admin.orders")} fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.recentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <ul className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{order.user.name}</p>
                      <p className="text-sm text-muted-foreground">{order.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">{t("admin.noOrders")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.topProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
              <ul className="space-y-4">
                {stats.topSellingProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.sales")}: {product.totalSold}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">{formatCurrency(product.price)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">{t("admin.noSales")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}