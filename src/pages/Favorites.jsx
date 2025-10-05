import "../css/Favorites.css";
import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";

function Favorites() {
    const { favorites } = useMovieContext();
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const [movieTags, setMovieTags] = useState(() => {
        const savedTags = localStorage.getItem("movieTags");
        return savedTags ? JSON.parse(savedTags) : {};
    });

    const handleTagChange = (movieId, newTag) => {
        const updatedTags = { ...movieTags, [movieId]: newTag };
        setMovieTags(updatedTags);
        localStorage.setItem("movieTags", JSON.stringify(updatedTags)); // Save updated tags to localStorage
    };

    const handleMovieClick = (movieId) => {
        setSelectedMovieId(movieId);
    };

    const handleCloseDetails = () => {
        setSelectedMovieId(null);
    };

    const renderTagInput = (movieId) => {
        const currentTag = movieTags[movieId] || "";
        return (
            <div className="tag-input-container">
                <input
                    type="text"
                    value={currentTag}
                    placeholder="Add a tag..."
                    onChange={(e) => handleTagChange(movieId, e.target.value)}
                    className="tag-input"
                />
                {currentTag && <span className="movie-tag">{currentTag}</span>}
            </div>
        );
    };
    
    if (favorites && favorites.length > 0) {
        return (
            <div className="favs">
                <h2>Your Favorites</h2>
                <div className="movies-grid">
                    {favorites.map((movie) => (
                        <MovieCard 
                            movie={movie} 
                            key={movie.id} 
                            onClick={handleMovieClick}
                        />
                    ))}
                </div>
                {selectedMovieId && (
                    <MovieDetails 
                        movieId={selectedMovieId} 
                        onClose={handleCloseDetails}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="favorites-empty">
            <h2>No Favorites Yet</h2>
            <p>Start adding movies to your favorites!</p>
        </div>
    );
}

export default Favorites;