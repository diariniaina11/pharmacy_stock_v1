import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('pharma_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.endsWith('/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('pharma_user');
            localStorage.removeItem('pharma_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
