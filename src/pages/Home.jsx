import MovieCard from "../components/MovieCard";
import { useState } from "react"

function Home() {
    const [searchQuery, setSearchQuesry] = useState("");
    const movies = [
        { id: 1, title: "ST's movie", release_data: 2020 },
        { id: 2, title: "Cutie's movie", release_data: 2021 },
        { id: 3, title: "Pookie's movie", release_data: 2022 },
    ];

    const handleSearch = (e) => {
        e.preventDefault()
        alert(searchQuery)
        setSearchQuesry("")
     };
    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input type="text" placeholder="Search for movies" className="search-input" value={searchQuery}
                    onChange={(e) => setSearchQuesry(e.target.value)} />
                <button type="submit" className="search-btn">Search</button>
            </form>
            <div className="movies-grid">
                {movies.map((movie) => movie.title.toLowerCase().startsWith(searchQuery) && (
                    <MovieCard movie={movie} key={movie.id} />
                ))}
            </div>
        </div>
    );
}

export default Home;
