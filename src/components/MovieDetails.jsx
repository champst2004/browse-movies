import { useEffect, useState, useRef } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MovieDetails.css";
import {
  getMovieDetails,
  getSimilarMovies,
  getRecommendedMovies,
} from "../services/api";

function MovieDetails({ movieId, onClose }) {
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isInWatchLater,
    addToWatchLater,
    removeFromWatchLater,
  } = useMovieContext();
  // Removed unused isDark from ThemeContext
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("similar");

  // Navigation history
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const isNavigating = useRef(false);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Initialize history with the first movie
  useEffect(() => {
    if (movieId && navigationHistory.length === 0) {
      setNavigationHistory([movieId]);
      setCurrentHistoryIndex(0);
    }
  }, [movieId]);

  const favorite = movie ? isFavorite(movie.id) : false;
  const inWatchLater = movie ? isInWatchLater(movie.id) : false;

  function onFavoriteClick(e) {
    e.stopPropagation();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  function onWatchLaterClick(e) {
    e.stopPropagation();
    if (!movie) return;
    if (inWatchLater) removeFromWatchLater(movie.id);
    else addToWatchLater(movie);
  }

  const loadMovieDetails = async (targetMovieId) => {
    try {
      setLoading(true);
      const data = await getMovieDetails(targetMovieId);
      setMovie(data);
      setError(null);
    } catch (err) {
      setError("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetails(movieId);
  }, [movieId]);

  useEffect(() => {
    const fetchRelatedMovies = async () => {
      try {
        setSimilarLoading(true);
        const [similar, recommended] = await Promise.all([
          getSimilarMovies(movieId),
          getRecommendedMovies(movieId),
        ]);
        setSimilarMovies(similar);
        setRecommendedMovies(recommended);
      } catch (err) {
        console.error("Failed to load movie details", err);
        setError("Failed to load movie details");
      } finally {
        setSimilarLoading(false);
      }
    };

    if (movieId) {
      fetchRelatedMovies();
    }
  }, [movieId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSimilarMovieClick = (clickedMovieId) => {
    if (isNavigating.current) return;

    // Add to history
    const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(clickedMovieId);
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);

    // Load the movie
    setMovie(null);
    setLoading(true);
    window.history.pushState({}, "", `/movie/${clickedMovieId}`);

    loadMovieDetails(clickedMovieId);

    // Scroll to top
    const modalContent = document.querySelector(".modal-content");
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  };

  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      isNavigating.current = true;
      const previousIndex = currentHistoryIndex - 1;
      const previousMovieId = navigationHistory[previousIndex];

      setCurrentHistoryIndex(previousIndex);
      setMovie(null);
      setLoading(true);
      window.history.pushState({}, "", `/movie/${previousMovieId}`);

      loadMovieDetails(previousMovieId).then(() => {
        isNavigating.current = false;
      });

      // Scroll to top
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      isNavigating.current = true;
      const nextIndex = currentHistoryIndex + 1;
      const nextMovieId = navigationHistory[nextIndex];

      setCurrentHistoryIndex(nextIndex);
      setMovie(null);
      setLoading(true);
      window.history.pushState({}, "", `/movie/${nextMovieId}`);

      loadMovieDetails(nextMovieId).then(() => {
        isNavigating.current = false;
      });

      // Scroll to top
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }
  };

  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < navigationHistory.length - 1;

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content">
          <div className="error-msg">{error}</div>
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const releaseYear = movie.release_date?.split("-")[0] || "N/A";

  const displayedMovies =
    activeTab === "similar" ? similarMovies : recommendedMovies;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="top-controls">
          {/* Navigation buttons */}
          <div className="nav-controls">
            <button
              className={`nav-btn ${!canGoBack ? "disabled" : ""}`}
              onClick={handleBack}
              disabled={!canGoBack}
              title="Go back to previous movie"
            >
              ←
            </button>
            <button
              className={`nav-btn ${!canGoForward ? "disabled" : ""}`}
              onClick={handleForward}
              disabled={!canGoForward}
              title="Go forward to next movie"
            >
              →
            </button>
          </div>

          <button
            className={`fav-btn-det ${favorite ? "active" : ""}`}
            onClick={onFavoriteClick}
          >
            ♥
          </button>
          <button
            className={`watchlater-btn ${inWatchLater ? "active" : ""}`}
            onClick={onWatchLaterClick}
            title={
              inWatchLater ? "Remove from Watch Later" : "Add to Watch Later"
            }
          >
            ⏱
          </button>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="movie-details">
          <div className="details-header">
            {movie.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="backdrop-image"
              />
            )}
            <div className="header-overlay">
              <h1>{movie.title}</h1>
              <div className="meta-info">
                <span className="year">{releaseYear}</span>
                <span className="rating">
                  ⭐ {movie.vote_average?.toFixed(1)}/10
                </span>
                <span className="runtime">{movie.runtime} min</span>
              </div>
            </div>
          </div>

          <div className="details-body">
            <div className="details-section">
              <h2>Overview</h2>
              <p>{movie.overview || "No overview available."}</p>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="details-section">
                <h2>Genres</h2>
                <div className="genres-list">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cast.length > 0 && (
              <div className="details-section">
                <h2>Cast</h2>
                <div className="cast-list">
                  {cast.map((actor) => (
                    <div key={actor.id} className="cast-member">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <div className="cast-info">
                        <p className="actor-name">{actor.name}</p>
                        <p className="character-name">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trailer && (
              <div className="details-section">
                <h2>Trailer</h2>
                <div className="trailer-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {(similarMovies.length > 0 || recommendedMovies.length > 0) && (
              <div className="details-section similar-section">
                <div className="similar-header">
                  <div className="similar-tabs">
                    <button
                      className={`tab-btn ${activeTab === "similar" ? "active" : ""}`}
                      onClick={() => setActiveTab("similar")}
                    >
                      Similar Movies ({similarMovies.length})
                    </button>
                    <button
                      className={`tab-btn ${activeTab === "recommended" ? "active" : ""}`}
                      onClick={() => setActiveTab("recommended")}
                    >
                      Recommended ({recommendedMovies.length})
                    </button>
                  </div>
                </div>

                {similarLoading ? (
                  <div className="similar-loading">Loading...</div>
                ) : displayedMovies.length > 0 ? (
                  <div className="similar-movies-grid">
                    {displayedMovies.map((similarMovie) => (
                      <div
                        key={similarMovie.id}
                        className="similar-movie-card"
                        onClick={() => handleSimilarMovieClick(similarMovie.id)}
                      >
                        <div className="similar-poster">
                          {similarMovie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${similarMovie.poster_path}`}
                              alt={similarMovie.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="similar-no-image">
                              <span>🎬</span>
                            </div>
                          )}
                          <div className="similar-overlay">
                            <div className="similar-rating">
                              ⭐ {similarMovie.vote_average?.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="similar-info">
                          <h4>{similarMovie.title}</h4>
                          <p>
                            {similarMovie.release_date?.split("-")[0] || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-similar">No {activeTab} movies found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
