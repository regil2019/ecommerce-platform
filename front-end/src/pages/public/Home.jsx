import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard"; // Renomeado para evitar conflitos
import BannerCarousel from "../../components/BannerCarousel";
import Categories from "../../components/Categories";
import ProductSuggestions from "../../components/ProductSuggestions";
import Footer from "../../components/Footer";
import { FiX, FiFilter, FiSearch } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";

const Home = ({ searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
        setIsLoading(false);
      }
    };

    fetchProducts();
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

  const removeCategoryFilter = () => setSelectedCategory(null);

  const hasFilters = selectedCategory || searchTerm || sortOrder;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-20">
      <main className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <BannerCarousel />
        </section>

        {/* Seção de Recomendações */}
        <section className="mb-12">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <ProductSuggestions
              title="Recomendações Personalizadas"
              limit={8}
              showHeader={true}
            />
          </div>
        </section>

        {/* Seção de Destaques */}
        {!selectedCategory && !searchTerm && !sortOrder && (
          <section className="mb-12">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Produtos em Destaque</h2>
                  <p className="text-sm text-gray-600">Os mais populares da semana</p>
                </div>
              </div>
              {products.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mb-8 space-y-4"> {/* Corrigido: space-y-4p para space-y-4 */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
          <Categories 
              onSelectCategory={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-semibold">
                <FiFilter /> Filtros:
              </span>
              
              {selectedCategory && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  {selectedCategory}
                  <button 
                    onClick={removeCategoryFilter} 
                    className="focus:outline-none"
                    aria-label="Remover filtro de categoria"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
              
              {sortOrder === "price-asc" && (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                  Preço: Crescente
                  <button 
                    onClick={() => setSortOrder(null)} 
                    className="focus:outline-none"
                    aria-label="Remover ordenação"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
              
              {sortOrder === "price-desc" && (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                  Preço: Decrescente
                  <button 
                    onClick={() => setSortOrder(null)} 
                    className="focus:outline-none"
                    aria-label="Remover ordenação"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
              
              {sortOrder === "newest" && (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                  Mais Recentes
                  <button 
                    onClick={() => setSortOrder(null)} 
                    className="focus:outline-none"
                    aria-label="Remover ordenação"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
              
              {hasFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <FiX size={16} /> Limpar todos
                </button>
              )}
            </div>
            
            <div className="w-full sm:w-auto">
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="min-w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Preço: Crescente</SelectItem>
                  <SelectItem value="price-desc">Preço: Decrescente</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
                <Skeleton className="mb-4 aspect-square rounded-lg" />
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : currentProducts.length > 0 ? (
          <>
            {/* Header da seção de produtos */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory ? `Produtos em ${selectedCategory}` : searchTerm ? `Resultados para "${searchTerm}"` : 'Todos os Produtos'}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </main>

      <Footer />
    </div>
  );
};

export default Home;