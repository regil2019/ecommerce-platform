import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { fetchCategories } from "../../services/categoryApi";
import api from "../../services/api";
import { formatCurrency } from "../../lib/utils";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/Button";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";

const Products = ({ searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products"),
          fetchCategories(),
        ]);

        setProducts(productsResponse.data);
        // A API de categorias retorna um objeto com uma propriedade 'data'
        setCategories(categoriesResponse.data.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category?.name === selectedCategory
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }

    if (sortOrder === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
    setPage(1);
  }, [selectedCategory, searchTerm, sortOrder, products]);

  const indexOfLastProduct = page * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSortOrder(null);
  };

  const hasFilters = selectedCategory || sortOrder;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-20">
      <main className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FiFilter />
                    Filtros
                  </h3>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Limpar
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Categorias</h4>
                  <ul className="space-y-1">
                    {categories && categories.map((category) => (
                      <li key={category.id}>
                        <Button
                          variant={selectedCategory === category.name ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          {category.name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Ordenar por</h3>
                <Select value={sortOrder || ""} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                    <SelectItem value="price-asc">Preço: Crescente</SelectItem>
                    <SelectItem value="price-desc">Preço: Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          <div className="md:col-span-3">
            {error ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <FiX size={24} />
                </div>
                <p className="mb-4 text-xl text-gray-800">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
                    <Skeleton className="mb-4 aspect-square rounded-lg" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategory ? `Produtos em ${selectedCategory}` : searchTerm ? `Resultados para "${searchTerm}"` : 'Todos os Produtos'}
                  </h2>
                  <p className="text-gray-600">
                    {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mb-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="h-12 px-4 md:h-9 md:px-3"
                    >
                      Anterior
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "primary" : "outline"}
                          size="lg"
                          onClick={() => setPage(pageNum)}
                          className="h-12 w-12 md:h-9 md:w-auto"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="lg"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="h-12 px-4 md:h-9 md:px-3"
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 animate-pulse">
                  <FiSearch size={32} />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-800">Nenhum produto encontrado</h3>
                <p className="mb-6 text-gray-600 max-w-md mx-auto">
                  Tente ajustar seus filtros, alterar os termos de busca ou explorar outras categorias
                </p>
                {hasFilters && (
                  <Button
                    onClick={handleClearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
