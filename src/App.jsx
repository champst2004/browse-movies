import "./css/App.css";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Trending from "./pages/Trending";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./components/MainLayout";

import { Routes, Route } from "react-router-dom"
import { MovieProvider } from "./contexts/MovieContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTopButton from "./components/ScrollToTopButton";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MovieProvider>
          <ScrollToTopButton />

          <Routes>
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/favorites" element={<Favorites />} />
            </Route>

          </Routes>
        </MovieProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;