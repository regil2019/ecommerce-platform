import api from './api.jsx';

// Add product to favorites
export const addToFavorites = async (productId) => {
  const response = await api.post('/favorites', { productId });
  return response.data;
};

// Remove product from favorites
export const removeFromFavorites = async (productId) => {
  await api.delete(`/favorites/${productId}`);
};

// Fetch user favorites
export const getUserFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

// Toggle product favorite status
export const toggleFavorite = async (productId) => {
  const response = await api.post('/favorites/toggle', { productId });
  return response.data;
};

// Check if product is in favorites
export const checkFavoriteStatus = async (productId) => {
  const response = await api.get(`/favorites/check/${productId}`);
  return response.data;
};