import "./App.css";
import MovieCard from "./components/MovieCard";

function App() {
  return (
    <>
    <MovieCard movie={{title: "movie2", release_date: "2025"}} />
    </>
  );
}

export default App;
