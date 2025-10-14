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
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
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
  const searchWrapRef = useRef(null);

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
          catch{
            // keep silent
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
        const sliced = (results || []).slice(0, 8);
        setSuggestions(sliced);
        setShowSuggestions(sliced.length > 0);
        setActiveSuggestion(sliced.length ? 0 : -1);
      } catch (err) { // eslint-disable-line no-empty
        // keep silent for suggestions
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        if (fetchGuard.current) return;
        fetchGuard.current = true;
        setLoading(true);
        const { results, totalPages: apiTotalPages } = await getPopularMovies(page);
        setMovies((prev) => (page === 1 ? results : [...prev, ...results]));
        setTotalPages(apiTotalPages);
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
        const { results, totalPages: apiTotalPages } = await getPopularMovies(1);
        setMovies(results);
        setPage(1);
        setTotalPages(apiTotalPages ?? null);
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
      setPage(1);
      setTotalPages(1);
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

  const handleSuggestionSelect = async (suggestion) => {
    setSearchQuery(suggestion.title || "");
    setShowSuggestions(false);
    // If we have a numeric TMDB id, open details modal directly per enhancement
    if (typeof suggestion.id === "number") {
      setSelectedMovieId(suggestion.id);
      return;
    }
    // fallback: perform a normal search selection behavior
    setLoading(true);
    try {
      const results = await searchMovies(suggestion.title);
      if (results && results.length > 0) {
        const exact = results.find((m) => (m.title || "").toLowerCase() === (suggestion.title || "").toLowerCase());
        setMovies([exact || results[0]]);
      } else {
        const popular = await getPopularMovies(1);
        const matched = popular.filter((m) => (m.title || "").toLowerCase() === (suggestion.title || "").toLowerCase());
        const chosen = matched.length ? matched[0] : null;
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

  const onSearchKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[activeSuggestion]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const highlightMatch = (title, query) => {
    if (!title) return null;
    const q = (query || "").trim();
    if (!q) return title;
    const idx = title.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return title;
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + q.length);
    const after = title.slice(idx + q.length);
    return (
      <>
        {before}
        <span className="hl">{match}</span>
        {after}
      </>
    );
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
      <form ref={searchWrapRef} onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies"
          className="search-input"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setHasSearched(false); setShowSuggestions(true); }}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          onKeyDown={onSearchKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        <button type="submit" className="search-btn">Search</button>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((s, idx) => {
              const img = s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "";
              return (
                <li
                  key={s.id ?? s.title ?? idx}
                  className={`suggestion-item ${idx === activeSuggestion ? "active" : ""}`}
                  onMouseDown={() => handleSuggestionSelect(s)}
                >
                  <img className="suggestion-thumb" src={img} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                  <div className="suggestion-content">
                    <div className="suggestion-title">{highlightMatch(s.title, searchQuery)}</div>
                    {s.release_date ? (
                      <div className="suggestion-meta">{(s.release_date || "").split("-")[0]}</div>
                    ) : null}
                  </div>
                </li>
              );
            })}
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

      <>
        {loading && movies.length === 0 ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="movies-grid">
            {[...new Map(movies.map((m) => [ (m.title || m.id), m ])).values()].map((movie) => (
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
