import { Link } from "react-router-dom"
import "../css/NavBar.css"
import { useThemeContext } from "../contexts/ThemeContext";

function NavBar(){
     const { theme, toggleTheme } = useThemeContext();
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">Movie App</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/favorites" className="nav-link">Favorites</Link>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {/* simple icon: sun / moon */}
          {theme === "dark" ? "🌞" : "🌙"}
        </button>
      
    </nav>
}

export default NavBar