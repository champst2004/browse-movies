import { Link } from "react-router-dom"

function NavBar(){
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/browse-movies">Movie App</Link>
        </div>
        <div className="navbar-links">
            <Link to="/browse-movies" className="nav-link">Home</Link>
            <Link to="/browse-movies/favorites" className="nav-link">Favorites</Link>
        </div>
    </nav>
}

export default NavBar