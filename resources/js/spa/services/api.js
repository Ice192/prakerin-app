import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAccessToken = (token) => {
    if (!token) {
        delete api.defaults.headers.common.Authorization;
        return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const extractErrorMessage = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim() !== '') {
        return responseMessage;
    }

    const validationErrors = error.response?.data?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
        const firstError = Object.values(validationErrors).flat()[0];
        if (typeof firstError === 'string') {
            return firstError;
        }
    }

    if (typeof error.message === 'string' && error.message.trim() !== '') {
        return error.message;
    }

    return fallbackMessage;
};
