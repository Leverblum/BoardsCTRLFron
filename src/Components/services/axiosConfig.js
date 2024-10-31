import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7289',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el token en las cabeceras
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;