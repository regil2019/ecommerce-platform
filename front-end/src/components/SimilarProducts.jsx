// components/SimilarProducts.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Skeleton } from './ui/skeleton';
import ProductCard from './ProductCard';
import api from '../services/api';

const SimilarProducts = ({
  productId,
  title = "Produtos Similares",
  limit = 4
}) => {
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
      console.error('Erro ao buscar produtos similares:', err);
      setError('Não foi possível carregar produtos similares');
    } finally {
      setLoading(false);
    }
  };

  const refreshSimilar = () => fetchSimilarProducts();

  return (
    <section className="w-full py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4 sm:px-6 lg:px-8">{title}</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error || similarProducts.length === 0 ? (
        <div className="w-full text-center text-gray-500 dark:text-gray-400 py-6">
          {error || 'Nenhum produto similar encontrado.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
          {similarProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
