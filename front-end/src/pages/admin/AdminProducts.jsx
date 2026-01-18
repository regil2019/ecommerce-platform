import React, { useState, useEffect, useCallback } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProductNew from "@/pages/admin/ProductNew";

export default function AdminProducts() {
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
      toast.error("Erro ao carregar produtos.");
      console.error(error);
      setProducts([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduct(id);
        toast.success("Produto excluído com sucesso!");
        loadProducts();
      } catch (error) {
        toast.error(error.message || "Erro ao excluir produto.");
        console.error(error);
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
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="draft">Inativos</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar
                </span>
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1"
                onClick={() => setIsProductModalOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Novo Produto
                </span>
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  Gerencie seus produtos e visualize seu desempenho de vendas.
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
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
                        <span className="sr-only">Imagem</span>
                      </TableHeader>
                      <TableHeader>Nome</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader className="hidden md:table-cell">Preço</TableHeader>
                      <TableHeader className="hidden md:table-cell">Estoque</TableHeader>
                      <TableHeader className="hidden md:table-cell">Categoria</TableHeader>
                      <TableHeader>
                        <span className="sr-only">Ações</span>
                      </TableHeader>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Carregando...
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
                              src={product.images?.[0] || "/images/placeholder.jpg"}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 0 ? "outline" : "secondary"}>
                              {product.stock > 0 ? "Ativo" : "Inativo"}
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
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/admin/products/${product.id}`)}
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(product.id)}
                                  className="text-red-600"
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Nenhum produto encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>

              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando{" "}
                  <strong>
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>{" "}
                  de <strong>{pagination.total}</strong> produtos
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
                        Anterior
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === totalPages}
                      >
                        Próximo
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

      {/* Modal de Novo Produto */}
      {isProductModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[10001] bg-black/20 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />
          {/* Modal Content */}
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="w-full max-w-3xl max-h-[80vh] bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border overflow-y-auto">
              <ProductNew onClose={() => setIsProductModalOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
