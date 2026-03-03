import React, { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/clerk-react';
import {
  PlusCircle,
  MoreHorizontal,
  File,
  Search,
  ChevronLeft,
  ChevronRight,
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
import { fetchAdminProducts, deleteProduct } from "@/services/productApi";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProductNew from "@/pages/admin/ProductNew";
import { useI18n } from "@/i18n";


export default function AdminProducts() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const navigate = useNavigate();

  const safeProducts = products ?? [];

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProducts(pagination.page, pagination.limit, searchTerm);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setPagination((prev) => ({ ...prev, total: data.totalProducts || 0 }));
    } catch (error) {
      toast.error(t("common.errorLoad"));
      console.error("Admin products error:", error);
      setProducts([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadProducts();
  }, [loadProducts, isLoaded, isSignedIn]);

  const handleDelete = async (id) => {
    if (window.confirm(t("admin.confirmDelete"))) {
      try {
        await deleteProduct(id);
        toast.success(t("admin.deleteSuccess"));
        loadProducts();
      } catch (error) {
        const msg = error.response?.data?.error || error.userMessage || error.message || t("admin.deleteError");
        toast.error(msg);
        console.error("Delete error:", error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
              <TabsTrigger value="active">{t("common.active")}</TabsTrigger>
              <TabsTrigger value="draft">{t("common.inactive")}</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t("admin.exportCSV")}
                </span>
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1"
                onClick={() => setIsProductModalOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t("admin.newProduct")}
                </span>
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.products")}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("common.description")}
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("admin.searchProducts")}
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
                      <TableHeader className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">{t("common.image")}</span>
                      </TableHeader>
                      <TableHeader>{t("common.name")}</TableHeader>
                      <TableHeader>{t("common.status")}</TableHeader>
                      <TableHeader className="hidden md:table-cell">{t("admin.price")}</TableHeader>
                      <TableHeader className="hidden md:table-cell">{t("admin.stock")}</TableHeader>
                      <TableHeader className="hidden md:table-cell">{t("admin.category")}</TableHeader>
                      <TableHeader>
                        <span className="sr-only">{t("common.actions")}</span>
                      </TableHeader>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {t("common.loading")}
                        </TableCell>
                      </TableRow>
                    ) : safeProducts.length > 0 ? (
                      safeProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="hidden sm:table-cell">
                            <img
                              alt={product.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={getImageUrl(product.images?.[0])}
                              width="64"
                              loading="lazy"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 0 ? "outline" : "secondary"}>
                              {product.stock > 0 ? t("common.active") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.category?.name}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t("common.actions")}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    alert(t("common.featureComingSoon") || "Edit feature coming soon!");
                                    // Future: open modal in edit mode
                                    // setEditingProduct(product);
                                    // setIsProductModalOpen(true);
                                  }}
                                >
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(product.id)}
                                  className="text-destructive"
                                >
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                        disabled={pagination.page === totalPages}
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

      {/* New Product Modal */}
      {isProductModalOpen && (
        <>
          <div
            className="fixed inset-0 z-[10001] bg-black/20 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
              <ProductNew onClose={() => setIsProductModalOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
