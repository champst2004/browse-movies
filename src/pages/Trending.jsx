import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";
import "../css/Trending.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        if (!TMDB_API_KEY) {
          throw new Error("API key not configured");
        }
        const res = await fetch(TMDB_TRENDING_URL);
        if (!res.ok) throw new Error('Failed to fetch trending movies');
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Failed to fetch trending movies:", err);
        setMovies([]);
      }
      setLoading(false);
    }
    fetchTrending();
  }, []);

  function handleMovieClick(movieId) {
    setSelectedMovieId(movieId);
  }

  function handleCloseModal() {
    setSelectedMovieId(null);
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🔥 Trending Now</h1>
        <p>Discover the most popular movies this week</p>
      </header>

      <main className="home-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-text">Loading trending movies...</div>
          </div>
        ) : movies.length === 0 ? (
          <div className="no-results">
            <p>No trending movies found</p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={handleMovieClick}
              />
            ))}
          </div>
        )}
      </main>

      {selectedMovieId && (
        <MovieDetails
          movieId={selectedMovieId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
