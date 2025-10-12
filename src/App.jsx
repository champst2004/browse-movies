import "./css/App.css";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Trending from "./pages/Trending";
import { Routes, Route } from "react-router-dom"
import { MovieProvider } from "./contexts/MovieContext";
import NavBar from "./components/NavBar";
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton";

function App() {
  return (
    <ThemeProvider>
    <MovieProvider>
      <NavBar> </NavBar>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
      <Footer /> 
      <ScrollToTopButton />
    </MovieProvider>
    </ThemeProvider>
  );
}

export default App;