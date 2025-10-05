import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import {
  discoverMoviesByGenre,
  getGenres,
  getPopularMovies,
  searchMovies,
} from "../services/api";
import "../css/Home.css";
import CustomSelect from "../components/CustomSelect";

// prepare options

function Home() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load genres + popular movies on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        const [genreList, popular] = await Promise.all([
          getGenres(),
          getPopularMovies(),
        ]);
        if (!mounted) return;
        setGenres(genreList || []);
        setMovies(popular || []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // When selectedGenre changes, fetch movies for that genre (unless a search is active)
  useEffect(() => {
    // If there's an active search query, we don't automatically switch to genre results.
    // Remove this guard if you want genre selection to override search.
    if (searchQuery.trim()) return;

    const loadByGenre = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedGenre) {
          const popular = await getPopularMovies();
          setMovies(popular || []);
        } else {
          const data = await discoverMoviesByGenre(selectedGenre);
          // Accept either the full response or array; handle both shapes
          setMovies(Array.isArray(data) ? data : data?.results || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load movies for this genre");
      } finally {
        setLoading(false);
      }
    };

    loadByGenre();
  }, [selectedGenre, searchQuery]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;
    if (loading) return;

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults || []);
      setError(null);
      // Optionally clear genre when search runs:
      // setSelectedGenre("");
    } catch (err) {
      console.error(err);
      setError("Failed to search the movie");
    } finally {
      setLoading(false);
    }
  };

    const genreOptions = [
    { value: "", label: "All Genres" },
    ...genres.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  return (
    <div className="home">
      <div className="controls-row">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for movies"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="genre-filter">
          
          <CustomSelect
            options={genreOptions}
            value={selectedGenre}
            onChange={(v) => setSelectedGenre(v)}
            placeholder="Filter by genre"
          />
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : movies.length ? (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      ) : (
        <div className="no-results">No movies found.</div>
      )}
    </div>
  );
}

export default Home;
