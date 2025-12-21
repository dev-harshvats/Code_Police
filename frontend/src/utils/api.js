import axios from 'axios';
import Cookies from 'js-cookie';

// Express Backend URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Automatically add the Token to every request
api.interceptors.request.use((config) => {
    const token = Cookies.get('token'); // Get token from browser cookies
    if(token){
        config.headers['x-auth-token'] = token; // Attach to header
    }
    return config;
}, (error) =>{
    return Promise.reject(error);
});

export default api;