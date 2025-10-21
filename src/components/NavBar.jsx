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

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const handleLinkClick = () => setMenuOpen(false);

  // SVG Icons (inline, scalable)
  const SunIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbff00"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-sun-medium-icon lucide-sun-medium"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1" />
      <path d="M12 20v1" />
      <path d="M3 12h1" />
      <path d="M20 12h1" />
      <path d="m18.364 5.636-.707.707" />
      <path d="m6.343 17.657-.707.707" />
      <path d="m5.636 5.636.707.707" />
      <path d="m17.657 17.657.707.707" />
    </svg>
  );

  const MoonIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-moon-icon lucide-moon"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );

  return (
    <nav
      className={`navbar ${isScrolled ? "scrolled" : ""} ${
        menuOpen ? "menu-open" : ""
      }`}
    >
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link" onClick={handleLinkClick}>
          <img
            src="/movie_logo.jpg"
            alt="Movie App logo"
            className="brand-logo"
          />
          <span className="brand-text">Movie App</span>
        </NavLink>
      </div>

      {/* Hamburger for mobile */}
      <button
        className={`hamburger-btn ${menuOpen ? "open" : ""}`}
        onClick={handleMenuToggle}
        aria-expanded={menuOpen}
        aria-controls="nav-links"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Navigation links */}
      <div
        id="nav-links"
        className={`navbar-links ${menuOpen ? "active" : ""}`}
        role="navigation"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
          onClick={handleLinkClick}
        >
          Home
        </NavLink>

        <NavLink
          to="/trending"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
          onClick={handleLinkClick}
        >
          Trending
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
          onClick={handleLinkClick}
        >
          Favorites
        </NavLink>

        <NavLink
          to="/watchlater"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
          onClick={handleLinkClick}
        >
          <span className="watch-text">Watch Later</span>
          {watchLater && watchLater.length > 0 ? (
            <span className="badge" aria-hidden="true">
              {watchLater.length}
            </span>
          ) : null}
        </NavLink>
      </div>

      {/* Theme toggle button with SVG icons */}
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <span className={`icon theme-icon`} aria-hidden="true">
          {isDark ? SunIcon : MoonIcon}
        </span>
      </button>
    </nav>
  );
}

export default NavBar;
