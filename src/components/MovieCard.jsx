import "../css/MovieCard.css"
import React, { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie, onClick }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
    const favorite = isFavorite(movie.id);
    const releaseYear = movie.release_date?.split("-")[0] || "N/A";

    const [movieLabels, setMovieLabels] = useState(() => {
        const savedLabels = localStorage.getItem("movieLabels");
        return savedLabels ? JSON.parse(savedLabels) : {};
    });

    const [selectedLabel, setSelectedLabel] = useState(movieLabels[movie.id] || "");
    // Handle the tag change
    const handleLabelChange = (movieId, label) => {
        const updatedLabels = { ...movieLabels, [movieId]: label };
        setMovieLabels(updatedLabels);
        localStorage.setItem("movieLabels", JSON.stringify(updatedLabels)); // Save to localStorage
        setSelectedLabel(label);
    };

    function onFavoriteClick(e) {
        e.stopPropagation();
        if (favorite) removeFromFavorites(movie.id);
        else addToFavorites(movie);
    }

    function handleCardClick() {
        if (onClick) onClick(movie.id);
    }

    const posterUrl = movie.poster_path
        ? movie.poster_path.startsWith("http")
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/st.jpg";

    function handleImgError(e) {
        // Create a more attractive fallback when image fails
        e.currentTarget.style.display = 'none';
        const posterDiv = e.currentTarget.parentElement;
        posterDiv.classList.add('img-error');
        
        // Create a fallback with movie title
        const fallback = document.createElement('div');
        fallback.className = 'poster-fallback';
        fallback.innerHTML = `
            <div class="fallback-content">
                <div class="fallback-icon">🎬</div>
                <div class="fallback-title">${movie.title}</div>
            </div>
        `;
        posterDiv.appendChild(fallback);
    }

    return (
        <div className="movie-card" onClick={handleCardClick}>
            <div className="movie-poster">
                <img
                    src={posterUrl}
                    alt={movie.title}
                    loading="lazy"
                    onError={handleImgError}
                />
                <div className="movie-overlay">
                    <button
                        className={`fav-btn ${favorite ? "active" : ""}`}
                        onClick={onFavoriteClick}
                    >
                        ♥
                    </button>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{releaseYear}</p>
                <div className="movie-rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{movie.vote_average?.toFixed(1)}</span>
                    <span className="rating-max">/10</span>
                </div>
            </div>
            <div className="movie-label">
                <label htmlFor={`label-dropdown-${movie.id}`}>Label: </label>
                <select
                    id={`label-dropdown-${movie.id}`}
                    value={selectedLabel}
                    onChange={(e) => handleLabelChange(movie.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}   // ⬅ prevent modal from opening
                    className="label-dropdown"
                >
                    <option value="">Select Label</option>
                    <option value="watched">Watched</option>
                    <option value="watch-later">Watch Later</option>
                    <option value="must-watch">Must Watch</option>
                    <option value="dont-watch">Don't Watch</option>
                </select>
            </div>


        </div>
    );
}

export default MovieCard;