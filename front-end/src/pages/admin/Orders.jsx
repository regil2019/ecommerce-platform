import React, { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import {
  File,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { updateOrderStatus } from "@/services/orderApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

export default function AdminOrders() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter === "all" ? "" : statusFilter,
        },
      });
      const ordersData = response.data?.data || [];
      const total = response.data?.pagination?.total || 0;
      setOrders(ordersData);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      toast.error(t("common.errorLoad"));
      console.error("Admin orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadOrders();
  }, [loadOrders, isLoaded, isSignedIn]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(t("admin.statusUpdated"));
      loadOrders();
    } catch (error) {
      toast.error(t("common.error"));
      console.error("Status update error:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
            <TabsTrigger value="pending">{t("orders.pending")}</TabsTrigger>
            <TabsTrigger value="processing">{t("orders.processing")}</TabsTrigger>
            <TabsTrigger value="shipped">{t("orders.shipped")}</TabsTrigger>
            <TabsTrigger value="delivered">{t("orders.delivered")}</TabsTrigger>
            <TabsTrigger value="cancelled">{t("orders.cancelled")}</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t("admin.exportCSV")}
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={statusFilter}>
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.orders")}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("common.description")}
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("admin.searchOrders")}
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t("orders.customer")}</TableHeader>
                    <TableHeader className="hidden sm:table-cell">
                      {t("orders.type")}
                    </TableHeader>
                    <TableHeader className="hidden sm:table-cell">
                      {t("common.status")}
                    </TableHeader>
                    <TableHeader className="hidden md:table-cell">{t("orders.date")}</TableHeader>
                    <TableHeader className="text-right">{t("common.total")}</TableHeader>
                    <TableHeader>
                      <span className="sr-only">{t("common.actions")}</span>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">
                            {order.user?.name || "N/A"}
                          </div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {order.user?.email || ""}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {t("orders.sale")}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue>
                                <Badge variant={getStatusVariant(order.status)}>
                                  {order.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t("orders.pending")}</SelectItem>
                              <SelectItem value="processing">{t("orders.processing")}</SelectItem>
                              <SelectItem value="shipped">{t("orders.shipped")}</SelectItem>
                              <SelectItem value="delivered">{t("orders.delivered")}</SelectItem>
                              <SelectItem value="cancelled">{t("orders.cancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">{t("common.actions")}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/orders/${order.id}`)
                                }
                              >
                                {t("orders.viewDetails")}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {t("orders.viewCustomer")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                {t("common.page", {
                  current: pagination.page,
                  total: totalPages || 1,
                })}
              </div>
              <Pagination className="ml-auto">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("common.previous")}
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                    >
                      {t("common.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
