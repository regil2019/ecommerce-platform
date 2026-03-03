import api from './api';

const BASE = '/admin/promotions';

export const fetchPromotions = async (params = {}) => {
    const response = await api.get(BASE, { params });
    return response.data;
};

export const createPromotion = async (data) => {
    const response = await api.post(BASE, data);
    return response.data;
};

export const updatePromotion = async (id, data) => {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
};

export const deletePromotion = async (id) => {
    const response = await api.delete(`${BASE}/${id}`);
    return response.data;
};
