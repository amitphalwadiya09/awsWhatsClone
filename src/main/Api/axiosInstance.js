import axios from "axios";
import { getStoredAuthToken } from '../Utils/tokenUtils';

export const apiUrl = import.meta.env.VITE_AWS_BASE_API;

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
})
axiosInstance.interceptors.request.use(config => {
    const token = getStoredAuthToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
},
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;