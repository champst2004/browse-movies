const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
import mockData from "./mockData.json";

const isMockMode = !API_KEY;

const mockDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const withFallback = async (requestFn, fallbackFn) => {
  if (isMockMode) return fallbackFn();
  try {
    return await requestFn();
  } catch (error) {
    console.error("Falling back to mock due to error:", error);
    return fallbackFn();
  }
};

export const getPopularMovies = async (page = 1) => {
  return withFallback(
    async () => {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch popular movies');
      const data = await response.json();
      return data.results;
    },
    async () => {
      await mockDelay();
      return mockData.results;
    }
  );
};

export const searchMovies = async (query) => {
  const normalizedQuery = (query || '').toLowerCase();
  return withFallback(
    async () => {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Failed to search movies');
      const data = await response.json();
      return data.results;
    },
    async () => {
      await mockDelay();
      return mockData.results.filter((m) => m.title.toLowerCase().includes(normalizedQuery));
    }
  );
};

export const getMovieDetails = async (movieId) => {
  return withFallback(
    async () => {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`
      );
      if (!response.ok) throw new Error('Failed to fetch movie details');
      const data = await response.json();
      return data;
    },
    async () => {
      await mockDelay();
      const movie = mockData.results.find((m) => m.id === Number(movieId));
      return movie || null;
    }
  );
};

export const getGenres = async () => {
  return withFallback(
    async () => {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      return data.genres;
    },
    async () => {
      await mockDelay();
      return mockData.genres;
    }
  );
};

export const discoverMovies = async (filters = {}) => {
  return withFallback(
    async () => {
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
    },
    async () => {
      await mockDelay();
      let results = [...mockData.results];
      if (filters.genre) {
        // Genre filtering is not supported in mock mode because mockData.results does not include genre information per movie.
        // As a result, movies will not be filtered by genre when using mock data.
        // To support genre filtering in mock mode, consider extending mockData.results to include a genres field for each movie,
        // and update this filter accordingly.
      }
      if (filters.year) {
        results = results.filter((m) => (m.release_date || '').startsWith(String(filters.year)));
      }
      if (filters.rating) {
        const min = Number(filters.rating);
        results = results.filter((m) => Number(m.vote_average || 0) >= min);
      }
      return results;
    }
  );
};
