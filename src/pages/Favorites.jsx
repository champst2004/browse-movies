import "../css/Favorites.css"
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
    const { favorites } = useMovieContext()

    if (favorites) {
        return (
            <div className="favs">
                <h2>Your Favorites</h2>
                <div className="movies-grid">
                    {favorites.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div>
            </div>)
    }

    return <div className="favorites-empty">
        <h2>no fav yet</h2>
        <p>hehehehehe</p>
    </div>
}

export default Favorites