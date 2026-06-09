const API_URL = 'https://recipebook-production-fcde.up.railway.app';

const getToken = () => localStorage.getItem('token');

export const request = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong!');
    }

    return data;
};
