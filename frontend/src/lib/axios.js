import Axios from 'axios';

const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Add an interceptor to automatically attach the token to every request
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axios;