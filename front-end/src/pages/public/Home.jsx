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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-20">

          {/* Features / Bento Grid */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t('home.explore')}</h2>
              <p className="text-muted-foreground">{t('home.exploreDesc')}</p>
            </div>
            <BentoGrid className="max-w-7xl mx-auto">
              <BentoGridItem
                title={t('home.newArrivals')}
                description={t('home.newArrivalsDesc')}
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden">
                    <img
                      src="/images/banners/banner1.jpg"
                      alt="New Arrivals"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
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
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden">
                    <img
                      src="/images/banners/banner2.jpg"
                      alt="Categories"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
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
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden">
                    <img
                      src="/images/banners/banner11.jpg"
                      alt="Discounts"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
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
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden">
                    <img
                      src="/images/lumo-logo.png"
                      alt="Support"
                      className="w-full h-full object-contain p-4 bg-primary/5 transition-transform duration-300 group-hover:scale-105"
                    />
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{t('home.trending')}</h2>
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
          <section className="rounded-3xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <ProductSuggestions limit={8} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;