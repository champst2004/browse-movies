import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/NavBar.css";
import { useThemeContext } from "../contexts/ThemeContext";
import useScrollPosition from "../hooks/useScrollPosition";

function NavBar() {
  const { toggleTheme, isDark } = useThemeContext();
  const isScrolled = useScrollPosition(50); // Detect scroll past 50px
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu toggle

  const handleMenuToggle = () => setMenuOpen(prev => !prev);

  const handleLinkClick = () => setMenuOpen(false); // Close menu when a link is clicked

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Brand logo and name */}
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <img src="/movie_logo.jpg" alt="Movie App logo" className="brand-logo" />
          <span className="brand-text">Movie App</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/trending" className="nav-link">Trending</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
      </div>

      {/* Theme toggle button */}
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
