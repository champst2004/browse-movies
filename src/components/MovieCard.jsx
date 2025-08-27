import "../css/MovieCard.css"
import { MovieProvider, useMovieContext } from "../contexts/MovieContext";

function MovieCard({movie}){
    const {favorites, isFavorite, addToFavorites, removeFromFavorites} = useMovieContext()
    const favorite = isFavorite(movie.id)

    function onFavoriteClick(e){
        e.preventDefault()
        if(favorite) removeFromFavorites(movie.id)
        else addToFavorites(movie)
    }
    return <div className="movie-card">
        <div className="movie-poster">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.tiele} />
            <div className="movie-overlay">
                <button className={`fav-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>♥</button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.release_date}</p>
        </div>
    </div>
    console.log(movie.poster_path)
}

export default MovieCard