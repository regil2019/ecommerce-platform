import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from '../services/favoriteApi';
import { toast } from 'react-toastify';

const FavoriteButton = ({ productId, size = 'w-6 h-6', className = '' }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is logged in (either from hook or localStorage)
  const isLoggedIn = user || localStorage.getItem('token');



  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (user && productId) {
        try {
          const response = await checkFavoriteStatus(productId);
          if (isMounted) {
            setIsFavorite(response.isFavorite);
          }
        } catch (error) {
          console.error('Erro ao verificar status do favorito:', error);
          if (isMounted) {
            setIsFavorite(false);
          }
        }
      } else {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [user, productId]);



  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Você precisa estar logado para favoritar produtos');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(productId);
        setIsFavorite(false);
        toast.success('Produto removido dos favoritos');
      } else {
        await addToFavorites(productId);
        setIsFavorite(true);
        toast.success('Produto adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      toast.error('Erro ao alterar favorito');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Não mostrar botão se usuário não estiver logado
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 ${loading ? 'opacity-50' : ''} ${className}`}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={loading ? 'Carregando...' : (isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos')}
    >
      {loading ? (
        <div className={`${size} border-2 border-gray-300 border-t-red-500 rounded-full animate-spin`} />
      ) : isFavorite ? (
        <FaHeart className={`${size} text-red-500`} />
      ) : (
        <FaRegHeart className={`${size} text-gray-600 hover:text-red-500`} />
      )}
    </button>
  );
};

export default FavoriteButton;