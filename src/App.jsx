import "./App.css";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import { Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar";

function App() {
  return (
    <div>
      <NavBar> </NavBar>
      <main className="main-content">
        <Routes>
          <Route path="/browse-movies" element={<Home />} />
          <Route path="/browse-movies/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>

  );
}

export default App; 