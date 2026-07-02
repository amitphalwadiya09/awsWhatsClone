export const parseJwt = (token) => {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
    }
};

export const isJwtExpired = (token) => {
    const payload = parseJwt(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    return Math.floor(Date.now() / 1000) >= payload.exp;
};

export const clearExpiredAuthTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && isJwtExpired(accessToken)) {
        localStorage.removeItem('accessToken');
    }

    const idToken = localStorage.getItem('idToken');
    if (idToken && isJwtExpired(idToken)) {
        localStorage.removeItem('idToken');
    }
};

export const getStoredAuthToken = () => {
    clearExpiredAuthTokens();

    const idToken = localStorage.getItem('idToken');
    if (idToken && !isJwtExpired(idToken)) {
        return idToken;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isJwtExpired(accessToken)) {
        return accessToken;
    }

    return null;
};
