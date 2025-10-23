/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [watchLater, setWatchLater] = useState([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    const storedWatchLater = localStorage.getItem("watchLater");
    if (storedWatchLater) setWatchLater(JSON.parse(storedWatchLater));
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("watchLater", JSON.stringify(watchLater));
  }, [watchLater]);

  const addToFavorites = (movie) => {
    setFavorites((prev) => [...prev, movie]);
  };

  const removeFromFavorites = (movieID) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieID));
  };

  const isFavorite = (movieID) => {
    return favorites.some((movie) => movie.id === movieID);
  };

  // Watch Later helpers
  const addToWatchLater = (movie) => {
    setWatchLater((prev) => {
      if (!movie) return prev;
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  };

  const removeFromWatchLater = (movieID) => {
    setWatchLater((prev) => prev.filter((movie) => movie.id !== movieID));
  };

  const isInWatchLater = (movieID) => {
    return watchLater.some((movie) => movie.id === movieID);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    watchLater,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};
