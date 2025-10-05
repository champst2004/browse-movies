const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Failed to search movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`
    );
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const discoverMovies = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      sort_by: 'popularity.desc',
    });

    if (filters.genre) params.append('with_genres', filters.genre);
    if (filters.year) params.append('primary_release_year', filters.year);
    if (filters.rating) params.append('vote_average.gte', filters.rating);

    const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
    if (!response.ok) throw new Error('Failed to discover movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
};