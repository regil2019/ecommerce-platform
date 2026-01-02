import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserFavorites, removeFromFavorites } from '../../services/favoriteApi';
import { toast } from 'react-toastify';
import ProductCard from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await getUserFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      setError('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFromFavorites(productId);
      setFavorites(prev => prev.filter(fav => fav.productId !== productId));
      toast.success('Produto removido dos favoritos');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Meus Favoritos</h1>
        <p className="text-gray-600 mb-6">
          Você precisa estar logado para ver seus favoritos.
        </p>
        <Link to="/login">
          <Button>Fazer Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Meus Favoritos</h1>
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Meus Favoritos</h1>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meus Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-semibold mb-4">Nenhum favorito ainda</h2>
          <p className="text-gray-600 mb-6">
            Explore nossos produtos e adicione seus favoritos para fácil acesso.
          </p>
          <Link to="/">
            <Button>Explorar Produtos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="relative">
              <ProductCard product={favorite.product} />
              <button
                onClick={() => handleRemoveFavorite(favorite.productId)}
                className="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                title="Remover dos favoritos"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}