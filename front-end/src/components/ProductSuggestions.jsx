import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import api from "../services/api";
import { useI18n } from "../i18n";

function NextArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -top-12 right-0 z-10 rounded-full bg-accent p-2 text-foreground shadow-md transition-colors hover:bg-accent/80"
      aria-label="Next slide"
    >
      <ChevronRight size={24} />
    </button>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -top-12 right-12 z-10 rounded-full bg-accent p-2 text-foreground shadow-md transition-colors hover:bg-accent/80"
      aria-label="Previous slide"
    >
      <ChevronLeft size={24} />
    </button>
  );
}

const ProductSuggestions = ({ limit = 8 }) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await api.get("/recommendations/popular", {
          params: { limit },
        });
        if (response.data.success) {
          setSuggestions(response.data.data);
        }
      } catch (err) {
        console.error("Popular products error:", err);
        setError(t("common.errorLoad"));
      }
    };

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only call personalized endpoint if user is authenticated
        if (user) {
          const response = await api.get("/recommendations/personalized", {
            params: { limit },
          });
          if (response.data.success && response.data.data.length > 0) {
            setSuggestions(response.data.data);
            return;
          }
        }

        // Fallback / public: popular products
        await fetchPopularProducts();
      } catch (err) {
        console.error("Recommendations error:", err);
        await fetchPopularProducts();
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [limit, user]);


  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false, dots: true } },
    ],
  };

  return (
    <section className="w-full py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("home.recommendations")}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <Skeleton className="mb-4 aspect-square w-full rounded-md" />
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error || suggestions.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
            <p className="text-center text-muted-foreground">
              {error || t("common.noResults")}
            </p>
          </div>
        ) : (
          <Slider {...settings} className="-mx-2">
            {suggestions.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
};

export default ProductSuggestions;