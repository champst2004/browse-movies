import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/NavBar.css";
import { useThemeContext } from "../contexts/ThemeContext";
import useScrollPosition from "../hooks/useScrollPosition";
import { useMovieContext } from "../contexts/MovieContext";

function NavBar() {
  const { toggleTheme, isDark } = useThemeContext();
  const isScrolled = useScrollPosition(50);
  const [menuOpen, setMenuOpen] = useState(false);
  const { watchLater } = useMovieContext();

  const handleMenuToggle = () => setMenuOpen(prev => !prev);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link" onClick={handleLinkClick}>
          <img src="/movie_logo.jpg" alt="Movie App logo" className="brand-logo" />
          <span className="brand-text">Movie App</span>
        </NavLink>
      </div>

      <button className="hamburger-btn" onClick={handleMenuToggle}>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
          onClick={handleLinkClick}
        >
          Home
        </NavLink>

        <NavLink
          to="/trending"
          className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
          onClick={handleLinkClick}
        >
          Trending
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
          onClick={handleLinkClick}
        >
          Favorites
        </NavLink>

        <NavLink
          to="/watchlater"
          className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
          onClick={handleLinkClick}
        >
          Watch Later{watchLater && watchLater.length > 0 ? ` (${watchLater.length})` : ""}
        </NavLink>
      </div>

      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <span className={`icon ${isDark ? "icon-sun" : "icon-moon"}`} aria-hidden="true">
          {isDark ? "🌞" : "🌙"}
        </span>
      </button>
    </nav>
  );
}

export default NavBar;
