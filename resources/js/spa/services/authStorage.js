const AUTH_STORAGE_KEY = 'ims_auth';

export const readAuthStorage = () => {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed?.token || !parsed?.user) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};

export const writeAuthStorage = (auth) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearAuthStorage = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
};
