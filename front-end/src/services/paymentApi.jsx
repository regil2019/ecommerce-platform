import api from './api';

export const createCheckoutSession = async ({ currency = 'EUR', promo_code } = {}) => {
    const payload = { currency };
    if (promo_code) payload.promo_code = promo_code;

    const response = await api.post('/payment/create-checkout-session', payload);
    return response.data;
};

export const validatePromoCode = async (code, amount) => {
    const response = await api.get(`/promotions/validate/${code}`, {
        params: { amount },
    });
    return response.data;
};
