import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/NavBar.css";
import { useThemeContext } from "../contexts/ThemeContext";
import useScrollPosition from "../hooks/useScrollPosition";
import { useAuth } from "../contexts/AuthContext";

function NavBar() {
  const { toggleTheme, isDark } = useThemeContext();
  const { token, logout } = useAuth();
  const isScrolled = useScrollPosition(50);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => setMenuOpen(prev => !prev);

  const handleLinkClick = () => setMenuOpen(false);

  const handleLogout = () => {
    handleLinkClick();
    logout();
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/" className="brand-link" onClick={handleLinkClick}>
          <img src="/movie_logo.jpg" alt="Movie App logo" className="brand-logo" />
          <span className="brand-text">Movie App</span>
        </Link>
      </div>

      <button
        className="hamburger-btn"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" className="nav-link" onClick={handleLinkClick}>Home</Link>
        <Link to="/trending" className="nav-link" onClick={handleLinkClick}>Trending</Link>

        {token ? (
          <>
            <Link to="/favorites" className="nav-link" onClick={handleLinkClick}>Favorites</Link>
            <button onClick={handleLogout} className="nav-link-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="nav-link" onClick={handleLinkClick}>Login / Sign Up</Link>
          </>
        )}
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