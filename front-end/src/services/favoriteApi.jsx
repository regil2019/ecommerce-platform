import api from './api.jsx';

// Adicionar produto aos favoritos
export const addToFavorites = async (productId) => {
  const response = await api.post('/favorites', { productId });
  return response.data;
};

// Remover produto dos favoritos
export const removeFromFavorites = async (productId) => {
  await api.delete(`/favorites/${productId}`);
};

// Buscar favoritos do usuário
export const getUserFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

// Verificar se produto está nos favoritos
export const checkFavoriteStatus = async (productId) => {
  const response = await api.get(`/favorites/check/${productId}`);
  return response.data;
};