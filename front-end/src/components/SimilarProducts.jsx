import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/Card";
import { Skeleton } from "./ui/skeleton";
import ProductCard from "./ProductCard";
import api from "../services/api";
import { useI18n } from "../i18n";

const SimilarProducts = ({ productId, limit = 4 }) => {
  const { t } = useI18n();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) fetchSimilarProducts();
  }, [productId]);

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/recommendations/similar/${productId}`, { params: { limit } });
      if (response.data.success) {
        setSimilarProducts(response.data.data);
      }
    } catch (err) {
      console.error("Similar products error:", err);
      setError(t("common.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-8">
      <h2 className="mb-6 px-4 text-2xl font-bold text-foreground sm:px-6 lg:px-8">
        {t("product.similarProducts")}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error || similarProducts.length === 0 ? (
        <div className="w-full py-6 text-center text-muted-foreground">
          {error || t("common.noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {similarProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
