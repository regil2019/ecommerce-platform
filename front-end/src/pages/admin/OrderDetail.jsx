import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Copy,
  CreditCard,
  MoreVertical,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { fetchOrderById, updateOrderStatus } from "@/services/orderApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const getStatusVariant = (status) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "outline";
    case "shipped":
      return "default";
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function AdminOrderDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error(t("common.errorLoad"));
      console.error("Order detail error:", error);
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(t("admin.statusUpdated"));
      loadOrder();
    } catch (error) {
      toast.error(t("common.error"));
      console.error("Status update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        {t("common.noResults")}
      </div>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate("/admin/orders")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t("common.back")}</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight text-foreground sm:grow-0">
            {t("orders.order")} #{order.id}
          </h1>
          <Badge variant={getStatusVariant(order.status)} className="ml-auto sm:ml-0">
            {order.status}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              {t("common.print")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">{t("common.more")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t("admin.exportCSV")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">{t("common.delete")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    {t("orders.order")} {order.id}
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(order.id)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">{t("common.copy")}</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {t("orders.date")}: {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">{t("common.more")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleStatusChange("pending")}>
                        {t("orders.markAs", { status: t("orders.pending") })}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange("processing")}>
                        {t("orders.markAs", { status: t("orders.processing") })}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange("shipped")}>
                        {t("orders.markAs", { status: t("orders.shipped") })}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange("delivered")}>
                        {t("orders.markAs", { status: t("orders.delivered") })}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleStatusChange("cancelled")}>
                        {t("orders.markAs", { status: t("orders.cancelled") })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold text-foreground">{t("orders.orderDetails")}</div>
                  <ul className="grid gap-3">
                    {order.orderItems?.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {item.product.name} x <span>{item.quantity}</span>
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-2" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                      <span>{formatCurrency(order.total)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                      <span>{formatCurrency(0)}</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">{t("common.total")}</span>
                      <span>{formatCurrency(order.total)}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>{t("orders.customer")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid gap-2">
                  <div className="font-semibold text-foreground">
                    {order.user?.name}
                  </div>
                  <div className="text-muted-foreground">
                    {order.user?.email}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.shippingInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex items-start gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div className="grid gap-1">
                    <div>{order.shippingAddress?.street}</div>
                    <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                    <div>{order.shippingAddress?.country}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.payment")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>{order.paymentMethod}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
