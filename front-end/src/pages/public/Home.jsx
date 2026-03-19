import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import BannerCarousel from "../../components/BannerCarousel";
import ProductSuggestions from "../../components/ProductSuggestions";
import { BentoGrid, BentoGridItem } from "../../components/magicui/BentoGrid";
import { Button } from "../../components/ui/Button";
import { useI18n } from "../../i18n";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { t } = useI18n();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        // Fetch newest products for the homepage
        const response = await api.get("/products", {
          params: { limit: 4, sort: 'newest' }
        });

        if (response.data && response.data.products) {
          setFeaturedProducts(response.data.products);
        } else if (Array.isArray(response.data)) {
          setFeaturedProducts(response.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading home products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background animate-in fade-in duration-500">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="mb-12">
          <BannerCarousel />
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12 sm:space-y-16">

          {/* Features / Bento Grid */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">{t('home.explore')}</h2>
              <p className="text-muted-foreground">{t('home.exploreDesc')}</p>
            </div>
            <BentoGrid className="max-w-6xl mx-auto px-2">
              <BentoGridItem
                title={t('home.newArrivals')}
                description={t('home.newArrivalsDesc')}
                header={
                  <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-xl overflow-hidden relative group">
                    <img
                      src="https://images.unsplash.com/photo-1441984966674-70af963f4509?q=80&w=800&auto=format&fit=crop"
                      alt="New Arrivals"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Spring Collection 2025
                      </span>
                    </div>
                  </div>
                }
                icon={<Sparkles className="h-4 w-4 text-white drop-shadow-md" />}
                className="md:col-span-2"
                onClick={() => window.location.href = '/products?sort=newest'}
              />
              <BentoGridItem
                title={t('home.categories')}
                description={t('home.categoriesDesc')}
                header={
                  <div className="grid grid-cols-2 gap-1 w-full h-full min-h-[10rem] rounded-xl overflow-hidden bg-muted group">
                    {[
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1491633194176-2df2f017409f?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=300&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop"
                    ].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Category ${i}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ))}
                  </div>
                }
                icon={<Zap className="h-4 w-4 text-white drop-shadow-md" />}
                className="md:col-span-1"
                onClick={() => window.location.href = '/categories'}
              />
              <BentoGridItem
                title={t('home.discounts')}
                description={t('home.discountsDesc')}
                header={
                  <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-xl overflow-hidden relative group">
                    <img
                      src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop"
                      alt="Discounts"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      -70% OFF
                    </div>
                  </div>
                }
                icon={<ArrowRight className="h-4 w-4 text-white drop-shadow-md" />}
                className="md:col-span-1"
                onClick={() => window.location.href = '/products?sort=price_asc'}
              />
              <BentoGridItem
                title={t('home.support')}
                description={t('footer.helpCenter')}
                header={
                  <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-xl overflow-hidden relative group">
                    <img
                      src="https://images.unsplash.com/photo-1521791136064-7986c2959213?q=80&w=800&auto=format&fit=crop"
                      alt="Support"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                      <p className="text-white text-sm font-medium">Suporte Personalizado 24/7</p>
                    </div>
                  </div>
                }
                icon={<ShieldCheck className="h-4 w-4 text-white drop-shadow-md" />}
                className="md:col-span-2"
                onClick={() => window.location.href = '/about'}
              />
            </BentoGrid>
          </section>

          {/* Featured / Key Products */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">{t('home.trending')}</h2>
              <Link to="/products">
                <Button variant="ghost" className="gap-2">
                  {t('home.viewAll')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    {t('common.noResults')}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Recommendations Slider */}
          <section className="rounded-2xl border border-border/50 bg-card/30 p-4 sm:p-6 backdrop-blur-sm">
            <ProductSuggestions limit={8} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;