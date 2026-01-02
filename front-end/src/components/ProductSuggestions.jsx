// components/ProductSuggestions.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Skeleton } from './ui/skeleton';
import ProductCard from './ProductCard';
import api from '../services/api';

const ProductSuggestions = ({
  title = "Recomendações para Você",
  limit = 6,
  showHeader = true
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca recomendações personalizadas
      const response = await api.get('/recommendations/personalized', { params: { limit } });

      if (response.data.success && response.data.data.length > 0) {
        setSuggestions(response.data.data);
      } else {
        // fallback para produtos populares
        await fetchPopularProducts();
      }
    } catch (err) {
      console.error('Erro ao buscar recomendações personalizadas:', err);
      await fetchPopularProducts();
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const response = await api.get('/recommendations/popular', { params: { limit } });
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos populares:', err);
      setError('Não foi possível carregar recomendações');
    }
  };

  const refreshSuggestions = () => fetchSuggestions();

  return (
    <section className="w-full py-8">
      {showHeader && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4 sm:px-6 lg:px-8">{title}</h2>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
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
      ) : error || suggestions.length === 0 ? (
        <div className="w-full text-center text-gray-500 dark:text-gray-400 py-6">
          {error || 'Nenhuma recomendação disponível no momento.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
          {suggestions.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSuggestions;
