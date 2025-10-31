// src/pages/Favorites.jsx
import "../css/Favorites.css";
import "../css/Home.css"; // reuse the homepage search styles
import React, { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";

function Favorites() {
  const { favorites } = useMovieContext();

  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState([]);

  useEffect(() => {
    const fetchMovieData = async (movieId) => {
      try {
        const res = await fetch(`${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch movie");
        return res.json();
      } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error);
        return null;
      }
    };

    const fetchAllFavorites = async () => {
      if (favorites.length === 0) {
        setFavoriteMovies([]);
        return;
      }
      setIsLoading(true);
      const promises = favorites.map(id => fetchMovieData(id));
      const movies = await Promise.all(promises);
      setFavoriteMovies(movies.filter(movie => movie !== null));
      setIsLoading(false);
    };

    fetchAllFavorites();
  }, [favorites]);

  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setFilteredFavorites(favoriteMovies || []);
      return;
    }

    const results = (favoriteMovies || []).filter((m) => {
      const title = (m.title || "").toLowerCase();
      return title.includes(q);
    });

    setFilteredFavorites(results);
  }, [searchQuery, favoriteMovies]);


  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return <div className="favorites-loading"><h2>Loading Favorites...</h2></div>;
  }

  if (favoriteMovies.length > 0) {
    return (
      <div className="favs">
        <h2>Your Favorites</h2>
        <form onSubmit={handleSearch} className="search-form" style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}>
          <input
            type="text"
            placeholder="Search your favorites"
            className="search-input"
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="search-btn icon-only"
            aria-label="Search"
            title="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        <div className="movies-grid">
          {filteredFavorites.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              onClick={handleMovieClick}
            />
          ))}
        </div>

        {selectedMovieId && (
          <MovieDetails
            movieId={selectedMovieId}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    );
  }

  return (
    <div className="favorites-empty">
      <h2>No Favorites Yet</h2>
      <p>Start adding movies to your favorites!</p>
    </div>
  );
}

export default Favorites;