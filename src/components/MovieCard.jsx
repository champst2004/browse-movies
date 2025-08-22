function MovieCard({movie}){
    function onFavoriteClick(){
        alert("Added to favorites");
    }
    return <div className="movie-card">
        <div className="movie-poster">
            <img src={movie.url} alt={movie.tiele} />
            <div className="movie-overlay">
                <button className="fav-btn" onClick={onFavoriteClick}>❤️</button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.release_date}</p>
        </div>
    </div>
}

export default MovieCard