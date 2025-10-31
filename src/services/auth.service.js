
const API_URL = "https://browse-movies.onrender.com";

const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};

const signup = async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok) {
        if (Array.isArray(data.message)) {
            throw new Error(data.message.join(', '));
        }
        throw new Error(data.message || 'Sign up failed');
    }

    return data;
};

const authService = {
    login,
    signup,
};

export default authService;