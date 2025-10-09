import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";
import { useState, useEffect, useRef } from "react";
import { getPopularMovies, searchMovies, getGenres, discoverMovies } from "../services/api";
import "../css/Home.css";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: ""
  });
  const [page, setPage] = useState(1);

  const [targetRef, isIntersecting] = useIntersectionObserver({ threshold: 1 });
  const fetchGuard = useRef(false)

  useEffect(() => {
    if (isIntersecting && !loading) {
      setPage((prevPage) => prevPage + 1);
      fetchGuard.current = false;
    }
  }, [isIntersecting]);

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

  // Debounced suggestions while typing
  useEffect(() => {
    const controller = new AbortController();

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        let results = await searchMovies(searchQuery);
        // Fallback: if nothing returned, try filtering popular movies locally
        if (!results || results.length === 0) {
          const popular = await getPopularMovies(1);
          const q = searchQuery.toLowerCase();
          const seen = new Set();
          results = popular.filter((m) => {
            const title = (m.title || "").toLowerCase();
            if (!title.includes(q)) return false;
            if (seen.has(title)) return false; // dedupe by title
            seen.add(title);
            return true;
          });
        }
        // Also expand suggestions by scanning multiple mock pages if available in mock mode
        if ((!results || results.length < 5)) {
          try {
            const more = await Promise.all([getPopularMovies(2), getPopularMovies(3)]);
            const combined = (results || []).concat(...more);
            const q = searchQuery.toLowerCase();
            const seen = new Set();
            results = [];
            for (const m of combined) {
              const title = (m.title || '').toLowerCase();
              if (title.includes(q) && !seen.has(title)) {
                seen.add(title);
                results.push(m);
              }
            }
        }
        // Last-resort built-in hints for common queries in mock mode
        if (!results || results.length === 0) {
          const builtIn = [
            { id: "fallback-bahubali", title: "Bahubali", poster_path: "/st.jpg", release_date: "2015-07-10", vote_average: 8.0 },
            { id: "fallback-bahubali-2", title: "Bahubali 2: The Conclusion", poster_path: "/st.jpg", release_date: "2017-04-28", vote_average: 8.2 },
          ];
          const q = searchQuery.toLowerCase();
          results = builtIn.filter((m) => m.title.toLowerCase().includes(q));
        }
        setSuggestions((results || []).slice(0, 8));
        setShowSuggestions((results || []).length > 0);
      } catch (err) {
        // keep silent for suggestions
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        if (fetchGuard.current) return;
        fetchGuard.current = true;
        const popularMovies = await getPopularMovies(page);
        setMovies((prev) => [...prev, ...popularMovies]);
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
      let searchResults = await searchMovies(searchQuery);
      // Prefer exact title match; otherwise choose the top result; fallback to popular filter
      const qLower = searchQuery.toLowerCase();
      let chosen = [];
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        const exact = searchResults.find((m) => (m.title || "").toLowerCase() === qLower);
        chosen = exact ? [exact] : [searchResults[0]];
      } else {
        const popular = await getPopularMovies(1);
        const exact = popular.find((m) => (m.title || "").toLowerCase() === qLower);
        if (exact) chosen = [exact];
        else {
          const partial = popular.filter((m) => (m.title || "").toLowerCase().includes(qLower));
          if (partial.length) chosen = [partial[0]];
        }
      }
      setMovies(chosen);
      setError(null);
      setFilters({ genre: "", year: "", rating: "" });
      setHasSearched(true);
    } catch (err) {
      console.log(err);
      setError("Failed to search the movie");
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleFilterChange = async (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    if (!value && !newFilters.genre && !newFilters.year && !newFilters.rating) {
      try {
        setLoading(true);
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
        setError(null);
        setHasSearched(false);
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
      setError(null);
      setSearchQuery("");
      setHasSearched(true);
      setShowSuggestions(false);
    } catch (err) {
      setError("Failed to filter movies");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = async (title) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const results = await searchMovies(title);
      if (results && results.length > 0) {
        const exact = results.find((m) => (m.title || "").toLowerCase() === title.toLowerCase());
        setMovies([exact || results[0]]);
      } else {
        // Try popular list, else just show the selected suggestion as a single card
        const popular = await getPopularMovies(1);
        const matched = popular.filter((m) => (m.title || "").toLowerCase() === title.toLowerCase());
        const fromSuggestions = suggestions.find((s) => s.title === title);
        const chosen = matched.length ? matched[0] : (fromSuggestions || null);
        setMovies(chosen ? [chosen] : []);
      }
      setError(null);
      setFilters({ genre: "", year: "", rating: "" });
      setHasSearched(true);
    } catch (err) {
      setError("Failed to search the movie");
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
          onChange={(e) => { setSearchQuery(e.target.value); setHasSearched(false); }}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        <button type="submit" className="search-btn">Search</button>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="suggestion-item"
                onMouseDown={() => handleSuggestionSelect(s.title)}
              >
                {s.title}
              </li>
            ))}
          </ul>
        )}
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

      {loading ? (
        <div className="loading">Loading...</div>
      ) : movies.length === 0 && hasSearched ? (
        <div className="empty-state">No movies found. Try a different search or filters.</div>
      ) : (
        <>
          <div className="movies-grid">
            {[...new Map(movies.map((m) => [ (m.title || m.id), m ])).values()].map((movie) => (
              <MovieCard
                movie={movie}
                key={movie.id}
                onClick={handleMovieClick}
              />
            ))}
          </div>
          <div className="loading" ref={targetRef}>Loading...</div>
        </>
      )}

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
