import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPopularMovies, searchMovies, getGenres, discoverMovies } from "../services/api";
import "../css/Home.css";
// Removed IntersectionObserver-based infinite scroll

function Home() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
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
  
  // Open modal if /movie/:id route is active
  useEffect(() => {
    if (params.movieId) {
      setSelectedMovieId(Number(params.movieId));
    } else {
      setSelectedMovieId(null);
    }
  }, [params.movieId]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const history = localStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
    }
  }, []);

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
        setSuggestions((results || []).slice(0, 6));
        setShowSuggestions((results || []).length > 0);
      } catch (err) { // eslint-disable-line no-empty
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

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
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

    // Save search text to history
    addToSearchHistory(searchQuery.trim());

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

  const addToSearchHistory = (item) => {
    try {
      const isText = typeof item === 'string';
      const newItem = isText 
        ? { type: 'text', value: item, timestamp: Date.now() }
        : { type: 'movie', value: item, timestamp: Date.now() };
      
      // Remove duplicates based on type and value
      const filtered = searchHistory.filter(h => {
        if (h.type === 'text' && isText) {
          return h.value.toLowerCase() !== item.toLowerCase();
        } else if (h.type === 'movie' && !isText) {
          return h.value.id !== item.id;
        }
        return true;
      });
      
      const newHistory = [newItem, ...filtered].slice(0, 5); // Keep last 5
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to save search history:", err);
    }
  };

  const handleSuggestionSelect = async (item) => {
    // Check if it's a text query or a movie object
    if (typeof item === "string") {
      // It's a search text - perform search
      setSearchQuery(item);
      setShowSuggestions(false);
      // Trigger search programmatically
      const fakeEvent = { preventDefault: () => {} };
      await handleSearch(fakeEvent);
    } else {
      // It's a movie object
      setSearchQuery(item.title);
      setShowSuggestions(false);
      
      // Add to search history
      addToSearchHistory(item);
      
      // Open detail page if movie has numeric ID
      if (typeof item.id === "number") {
        setSelectedMovieId(item.id);
      } else {
        // Log ID if not implemented
        console.log("Movie ID:", item.id, "Title:", item.title);
      }
    }
  };

  const handleMovieClick = (movieId) => {
    setSelectedMovieId(movieId);
    navigate(`/movie/${movieId}`);
    // Add clicked movie to search history
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      addToSearchHistory(movie);
    }
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
    navigate("/");
    setSearchQuery("");
    setShowSuggestions(false);
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
          onChange={(e) => { 
            setSearchQuery(e.target.value); 
            setHasSearched(false); 
          }}
          onFocus={() => { 
            // Show search history if query is empty, otherwise show suggestions
            if (searchQuery.trim().length === 0 && searchHistory.length > 0) {
              setSuggestions(searchHistory);
              setShowSuggestions(true);
            } else if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button type="submit" className="search-btn">Search</button>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="search-suggestions">
            {searchQuery.trim().length === 0 && (
              <li className="suggestion-header">Recent Searches</li>
            )}
            {suggestions.map((s, idx) => {
              // Handle both text searches and movie objects
              const isText = s.type === 'text' || typeof s === 'string';
              const item = isText ? s.value || s : s.value || s;
              
              if (isText) {
                // Text search item
                return (
                  <li
                    key={`text-${idx}`}
                    className="suggestion-item suggestion-text"
                    onMouseDown={() => handleSuggestionSelect(item)}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-title">{item}</span>
                  </li>
                );
              } else {
                // Movie object
                const posterUrl = item.poster_path 
                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}` 
                  : null;
                
                return (
                  <li
                    key={item.id || `movie-${idx}`}
                    className="suggestion-item"
                    onMouseDown={() => handleSuggestionSelect(item)}
                  >
                    {posterUrl && (
                      <img 
                        src={posterUrl} 
                        alt={item.title}
                        className="suggestion-poster"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="suggestion-title">{item.title}</span>
                  </li>
                );
              }
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
