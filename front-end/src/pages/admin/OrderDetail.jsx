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
  CardFooter,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { fetchOrderById, updateOrderStatus } from "@/services/orderApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

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
      toast.error("Erro ao carregar detalhes do pedido.");
      console.error(error);
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
      toast.success("Status do pedido atualizado com sucesso!");
      loadOrder();
    } catch (error) {
      toast.error("Erro ao atualizar o status do pedido.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        Pedido não encontrado.
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
            <span className="sr-only">Voltar</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Pedido #{order.id}
          </h1>
          <Badge variant={getStatusVariant(order.status)} className="ml-auto sm:ml-0">
            {order.status}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Imprimir
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Mais</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Exportar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Excluir</DropdownMenuItem>
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
                    Pedido {order.id}
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(order.id)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copiar ID do Pedido</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Data: {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">Mais</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleStatusChange("pending")}
                      >
                        Marcar como Pendente
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleStatusChange("processing")}
                      >
                        Marcar como Processando
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleStatusChange("shipped")}
                      >
                        Marcar como Enviado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleStatusChange("delivered")}
                      >
                        Marcar como Entregue
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleStatusChange("cancelled")}
                      >
                        Marcar como Cancelado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Detalhes do Pedido</div>
                  <ul className="grid gap-3">
                    {order.orderItems?.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between"
                      >
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
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(order.total)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>{formatCurrency(0)}</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">Total</span>
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
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid gap-2">
                  <div className="font-semibold">
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
                <CardTitle>Informações de Envio</CardTitle>
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
                <CardTitle>Pagamento</CardTitle>
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
