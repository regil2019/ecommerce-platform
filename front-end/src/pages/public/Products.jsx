import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { fetchCategories } from "../../services/categoryApi";
import api from "../../services/api";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/Button";
import { Filter, X, Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { useI18n } from "../../i18n";
import { Pagination } from "../../components/Pagination";

const Products = ({ searchTerm }) => {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read params
  const selectedCategory = searchParams.get("category") || "";
  const sortOrder = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 12;

  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        // API returns array directly in response.data
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Categories load error", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          page,
          limit,
          category: selectedCategory,
          sort: sortOrder,
          search: searchTerm
        };

        const response = await api.get("/products", { params });

        // Handle new response structure { products, total, page, totalPages }
        if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages);
          setTotalProducts(response.data.total);
        } else if (Array.isArray(response.data)) {
          // Fallback for old API if something goes wrong
          setProducts(response.data);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Products load error:", err);
        setError(t("common.errorLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search if needed, but for now direct call
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, selectedCategory, sortOrder, searchTerm]);

  const handleCategorySelect = (category) => {
    updateParams({
      category: category === selectedCategory ? "" : category,
      page: 1, // Reset to page 1 on filter change
    });
  };

  const handleSortChange = (value) => {
    updateParams({ sort: value, page: 1 });
  };

  const handleClearFilters = () => {
    updateParams({ category: "", sort: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = selectedCategory || sortOrder || searchTerm;

  return (
    <div className="flex min-h-screen flex-col bg-background animate-in fade-in duration-500">
      <main className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Filter className="h-5 w-5" />
                    {t("common.filters")}
                  </h3>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-primary hover:text-primary/80 h-8 px-2"
                    >
                      {t("common.clear")}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground">{t("home.categories")}</h4>
                  <div className="flex flex-col gap-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.name)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${selectedCategory === category.name
                          ? "bg-primary text-primary-foreground font-medium shadow-md"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-foreground">{t("common.sortBy")}</h3>
                <Select value={sortOrder || ""} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue placeholder={t("common.selectOption")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("home.newest")}</SelectItem>
                    <SelectItem value="price_asc">{t("home.priceAsc")}</SelectItem>
                    <SelectItem value="price_desc">{t("home.priceDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="md:col-span-3">
            {error ? (
              <div className="py-24 text-center rounded-3xl border border-border/50 bg-card/30">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <X size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{t("common.errorLoad")}</h3>
                <p className="mb-6 text-muted-foreground max-w-md mx-auto">{error}</p>
                <Button onClick={() => window.location.reload()} variant="default" size="lg" className="rounded-xl">
                  {t("common.retry")}
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-4 rounded-2xl border border-border p-4">
                    <Skeleton className="aspect-square rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl mt-auto" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="mb-8 flex items-baseline justify-between border-b border-border/40 pb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-1">
                      {selectedCategory || (searchTerm ? `"${searchTerm}"` : t("home.allProducts"))}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("home.productCount", { count: totalProducts })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-12">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="py-24 text-center rounded-3xl border border-dashed border-border/60 bg-muted/5">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
                  <Search size={40} />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">{t("home.noProducts")}</h3>
                <p className="mb-8 text-muted-foreground max-w-md mx-auto text-lg">
                  {t("home.noProductsDesc")}
                </p>
                {hasFilters && (
                  <Button
                    onClick={handleClearFilters}
                    size="lg"
                    className="rounded-xl"
                  >
                    {t("home.clearFilters")}
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
