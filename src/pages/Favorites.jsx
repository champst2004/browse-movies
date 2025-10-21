import "../css/Favorites.css";
import "../css/Home.css"; // reuse the homepage search styles
import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";

function Favorites() {
  const { favorites } = useMovieContext();
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState(favorites || []);
  const [showSuggestions, setShowSuggestions] = useState(false); // kept for parity if you add suggestions later

  useEffect(() => {
    // when favorites update (from context), refresh filtered list
    setFilteredFavorites(favorites || []);
  }, [favorites]);

  // keep filtered list synced with search query
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setFilteredFavorites(favorites || []);
      return;
    }

    const results = (favorites || []).filter((m) => {
      const title = (m.title || "").toLowerCase();
      return title.includes(q);
    });

    setFilteredFavorites(results);
  }, [searchQuery, favorites]);

  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering is already handled by searchQuery effect; this prevents default form submit.
    // If you want to collapse suggestions or do other actions on submit, add here.
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // if you plan to show suggestions later, you can compute/show them here
    if (e.target.value.trim().length > 0) setShowSuggestions(false);
  };

  if (favorites && favorites.length > 0) {
    return (
      <div className="favs">
        <h2>Your Favorites</h2>

        {/* Search form re-used from Home but button has no text (icon-only) */}
        <form
          onSubmit={handleSearch}
          className="search-form"
          style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}
        >
          <input
            type="text"
            placeholder="Search your favorites"
            className="search-input"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (filteredFavorites.length) setShowSuggestions(false);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {/* Icon-only button (no visible label). Uses same .search-btn styles */}
          <button
            type="submit"
            className="search-btn icon-only"
            aria-label="Search"
            title="Search"
          >
            {/* inline SVG magnifier so it shows even if Homepage's ::before differs */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <div className="movies-grid">
          {[
            ...new Map(
              (filteredFavorites || []).map((m) => [m.title || m.id, m]),
            ).values(),
          ].map((movie) => (
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
