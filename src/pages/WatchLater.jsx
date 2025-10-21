import "../css/Favorites.css";
import "../css/Home.css"; // reuse styles
import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";

function WatchLater() {
  const { watchLater } = useMovieContext();
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState(watchLater || []);

  useEffect(() => {
    setFilteredList(watchLater || []);
  }, [watchLater]);

  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setFilteredList(watchLater || []);
      return;
    }
    const results = (watchLater || []).filter((m) =>
      (m.title || "").toLowerCase().includes(q),
    );
    setFilteredList(results);
  }, [searchQuery, watchLater]);

  const handleMovieClick = (movieId) => setSelectedMovieId(movieId);
  const handleCloseDetails = () => setSelectedMovieId(null);

  if (watchLater && watchLater.length > 0) {
    return (
      <div className="favs">
        <h2>Watch Later</h2>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="search-form"
          style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}
        >
          <input
            type="text"
            placeholder="Search your watch later list"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="search-btn icon-only"
            aria-label="Search"
            title="Search"
          >
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
            ...new Map((filteredList || []).map((m) => [m.id, m])).values(),
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
      <h2>No items in Watch Later</h2>
      <p>Add movies to your watch later list from the movie details or card.</p>
    </div>
  );
}

export default WatchLater;
