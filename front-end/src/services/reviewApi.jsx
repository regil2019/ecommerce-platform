import api from './api';

// Buscar reviews de um produto
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// Criar uma nova review
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Atualizar uma review
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// Deletar uma review
export const deleteReview = async (reviewId) => {
  await api.delete(`/reviews/${reviewId}`);
};