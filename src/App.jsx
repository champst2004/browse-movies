import "./App.css";
import MovieCard from "./components/MovieCard";

function App() {
  return (
    <>
    <MovieCard movie={{title: "ST's movie", release_date: "2025"}} />
    </>
  );
}

export default App;
