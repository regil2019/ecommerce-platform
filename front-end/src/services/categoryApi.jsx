import api from './api';

// Category API calls
export const fetchCategories = () => api.get('/categories');

export const createCategory = (category) => api.post('/categories', category);

export const updateCategory = (id, category) => api.put('/categories/' + id, category);

export const deleteCategory = (id) => api.delete('/categories/' + id);
