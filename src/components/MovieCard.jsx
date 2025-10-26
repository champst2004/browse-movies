import React, { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MovieCard.css";

function MovieCard({ movie, onClick }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
    const favorite = isFavorite(movie.id);
    const releaseYear = movie.release_date?.split("-")[0] || "N/A";

    const [movieLabels, setMovieLabels] = useState(() => {
        const savedLabels = localStorage.getItem("movieLabels");
        return savedLabels ? JSON.parse(savedLabels) : {};
    });

    const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useMovieContext();
    const [selectedLabel, setSelectedLabel] = useState(movieLabels[movie.id] || "");

    const handleLabelChange = (movieId, label) => {
        const updatedLabels = { ...movieLabels, [movieId]: label };
        setMovieLabels(updatedLabels);
        localStorage.setItem("movieLabels", JSON.stringify(updatedLabels));
        setSelectedLabel(label);
        // Sync watch-later context when label changes
        try {
            if (label === "watch-later") {
                addToWatchLater(movie);
            } else {
                // if user removed watch-later label, ensure it's removed from context
                if (isInWatchLater(movie.id)) removeFromWatchLater(movie.id);
            }
        } catch (error) {
            // defensive: ignore if context not available, but log for debugging
            console.error("Error updating watch-later context in handleLabelChange:", error);
        }
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
        e.currentTarget.style.display = "none";
        const posterDiv = e.currentTarget.parentElement;
        posterDiv.classList.add("img-error");

        const fallback = document.createElement("div");
        fallback.className = "poster-fallback";

        const fallbackContent = document.createElement("div");
        fallbackContent.className = "fallback-content";

        const fallbackIcon = document.createElement("div");
        fallbackIcon.className = "fallback-icon";
        fallbackIcon.textContent = "🎬";

        const fallbackTitle = document.createElement("div");
        fallbackTitle.className = "fallback-title";
        fallbackTitle.textContent = movie.title;

        fallbackContent.appendChild(fallbackIcon);
        fallbackContent.appendChild(fallbackTitle);
        fallback.appendChild(fallbackContent);
        posterDiv.appendChild(fallback);
    }

    async function handleShareClick(e) {
        e.stopPropagation();
        const movieUrl = `${window.location.origin}/movie/${movie.id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: movie.title,
                    text: `Check out this movie: ${movie.title}`,
                    url: movieUrl,
                });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(movieUrl);
                showToast("Link copied to clipboard!");
            } 
            else {
                showToast("Share functionality is not available.");
            }
        }
        catch (err) {
            console.error("Share or clipboard operation failed:", err);
            showToast("An error occurred while trying to share.");
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.padding = '10px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = 1000;
        toast.style.fontSize = '14px';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
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
                    <button className="share-btn" onClick={handleShareClick}>
                        Share
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
                    onClick={(e) => e.stopPropagation()}
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
