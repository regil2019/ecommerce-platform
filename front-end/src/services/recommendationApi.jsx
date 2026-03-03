import api from './api';

const BASE = '/recommendations';

export const fetchPopularProducts = async (limit = 8) => {
    const response = await api.get(`${BASE}/popular`, { params: { limit } });
    return response.data;
};

export const fetchPersonalizedRecommendations = async (limit = 10) => {
    const response = await api.get(`${BASE}/personalized`, { params: { limit } });
    return response.data;
};

export const fetchSimilarProducts = async (productId, limit = 4) => {
    const response = await api.get(`${BASE}/similar/${productId}`, { params: { limit } });
    return response.data;
};
