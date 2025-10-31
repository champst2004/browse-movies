const API_URL = "https://browse-movies.onrender.com";

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const getFavorites = async (token) => {
    const response = await fetch(`${API_URL}/users/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch favorites');
    }

    return data;
};

const addFavorite = async (movieId, token) => {
    const response = await fetch(`${API_URL}/users/favorites/add`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ movieId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to add favorite');
    }

    return data;
};

const removeFavorite = async (movieId, token) => {
    const response = await fetch(`${API_URL}/users/favorites/remove`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ movieId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to remove favorite');
    }

    return data;
};

const movieService = {
    getFavorites,
    addFavorite,
    removeFavorite
};

export default movieService;