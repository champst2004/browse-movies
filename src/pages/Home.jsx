import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";
import { useState, useEffect, useRef } from "react";
import { getPopularMovies, searchMovies, getGenres, discoverMovies } from "../services/api";
import "../css/Home.css";
// Removed IntersectionObserver-based infinite scroll

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: ""
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const fetchGuard = useRef(false);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreList = await getGenres();
        setGenres(genreList);
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        if (fetchGuard.current) return;
        fetchGuard.current = true;
        setLoading(true);
        const { results, totalPages: apiTotalPages } = await getPopularMovies(page);
        setMovies((prev) => (page === 1 ? results : [...prev, ...results]));
        setTotalPages(apiTotalPages ?? null);
        setError(null);
      } catch (err) {
        console.log(err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };
    loadPopularMovies();
  }, [page]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;
    if (loading) return;

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setPage(1);
      setTotalPages(1);
      setError(null);
      setFilters({ genre: "", year: "", rating: "" });
    } catch (err) {
      console.log(err);
      setError("Failed to search the movie");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    if (!value && !newFilters.genre && !newFilters.year && !newFilters.rating) {
      try {
        setLoading(true);
        const { results, totalPages: apiTotalPages } = await getPopularMovies(1);
        setMovies(results);
        setPage(1);
        setTotalPages(apiTotalPages ?? null);
        setError(null);
      } catch (err) {
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const filteredMovies = await discoverMovies(newFilters);
      setMovies(filteredMovies);
      setPage(1);
      setTotalPages(1);
      setError(null);
      setSearchQuery("");
    } catch (err) {
      setError("Failed to filter movies");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">Genre</label>
          <select
            className="filter-select"
            value={filters.genre}
            onChange={(e) => handleFilterChange("genre", e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Year</label>
          <select
            className="filter-select"
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Rating</label>
          <select
            className="filter-select"
            value={filters.rating}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="7">7+ ⭐</option>
            <option value="8">8+ ⭐</option>
            <option value="9">9+ ⭐</option>
          </select>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <>
        {loading && movies.length === 0 ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                movie={movie}
                key={movie.id}
                onClick={handleMovieClick}
              />
            ))}
          </div>
        )}

        {/* Load More button appears only when browsing popular movies without active search/filters */}
        {(!searchQuery && !filters.genre && !filters.year && !filters.rating) && movies.length > 0 && (
          <div className="load-more-container">
            {(totalPages === null || totalPages === undefined || page < totalPages) ? (
              <button
                className="load-more-btn"
                disabled={loading}
                onClick={() => {
                  if (!loading) {
                    fetchGuard.current = false;
                    setPage((p) => p + 1);
                  }
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            ) : null}
          </div>
        )}
      </>

      {selectedMovieId && (
        <MovieDetails
          movieId={selectedMovieId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

export default Home;
