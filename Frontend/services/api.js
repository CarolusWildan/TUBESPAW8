import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL : API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchEvents = async () => {
    try {
        const response = await api.get('/event');
        return response.data;
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

export default api;