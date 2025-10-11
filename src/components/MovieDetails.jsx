import { useEffect, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MovieDetails.css";
import { getMovieDetails } from "../services/api";

function MovieDetails({ movieId, onClose }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const favorite = movie ? isFavorite(movie.id) : false;

  function onFavoriteClick(e) {
    e.stopPropagation(); // prevent backdrop click from closing modal
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }


  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetails(movieId);
        setMovie(data);
        setError(null);
      } catch (err) {
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const releaseYear = movie.release_date?.split("-")[0] || "N/A";

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="top-controls">
          <button
              className={`fav-btn-det ${favorite ? "active" : ""}`}
              onClick={onFavoriteClick}
          >
              ♥
          </button>
          <button onClick={onClose} className="close-btn">✕</button>

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
                <span className="rating">⭐ {movie.vote_average?.toFixed(1)}/10</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
