import "../css/MovieCard.css"
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie, onClick }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
    const favorite = isFavorite(movie.id);
    const releaseYear = movie.release_date?.split("-")[0] || "N/A";

    function onFavoriteClick(e) {
        e.stopPropagation();
        if (favorite) removeFromFavorites(movie.id);
        else addToFavorites(movie);
    }

    function handleCardClick() {
        if (onClick) onClick(movie.id);
    }

    return (
        <div className="movie-card" onClick={handleCardClick}>
            <div className="movie-poster">
                <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title} 
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
                <div className="movie-rating">⭐ {movie.vote_average?.toFixed(1)}/10</div>
            </div>
        </div>
    );
}

export default MovieCard;