import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import movieService from "../services/movie.service";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [watchLater, setWatchLater] = useState([]);

    // --- YOUR AUTH LOGIC ---
    const { token, logout } = useAuth();

    useEffect(() => {
        const storedWatchLater = localStorage.getItem("watchLater");
        if (storedWatchLater) setWatchLater(JSON.parse(storedWatchLater));
    }, []);

    useEffect(() => {
        if (token) {
            const fetchFavorites = async () => {
                try {
                    const favoriteIds = await movieService.getFavorites(token);
                    setFavorites(favoriteIds);
                } catch (error) {
                    console.error("Failed to fetch favorites:", error);
                    setFavorites([]);
                    if (error.message === "Unauthorized") {
                        logout();
                    }
                }
            };
            fetchFavorites();
        } else {
            setFavorites([]);
        }
    }, [token, logout]);

    useEffect(() => {
        localStorage.setItem("watchLater", JSON.stringify(watchLater));
    }, [watchLater]);

    const addToFavorites = async (movie) => {
        try {
            const movieIdString = String(movie.id);
            await movieService.addFavorite(movieIdString, token);
            setFavorites(prev => [...prev, movieIdString]);
        } catch (error) {
            console.error("Failed to add favorite:", error);
            if (error.message === "Unauthorized") {
                logout();
            }
        }
    };

    const removeFromFavorites = async (movieID) => {
        try {
            const movieIdString = String(movieID);
            await movieService.removeFavorite(movieIdString, token);
            setFavorites(prev => prev.filter(id => id !== movieIdString));
        } catch (error) {
            console.error("Failed to remove favorite:", error);
            if (error.message === "Unauthorized") {
                logout();
            }
        }
    };

    const isFavorite = (movieID) => {
        return favorites.some(id => String(id) === String(movieID));
    };


    const addToWatchLater = (movie) => {
        setWatchLater(prev => {
            if (!movie) return prev;
            if (prev.some(m => m.id === movie.id)) return prev;
            return [movie, ...prev];
        });
    };

    const removeFromWatchLater = (movieID) => {
        setWatchLater(prev => prev.filter(movie => movie.id !== movieID));
    };

    const isInWatchLater = (movieID) => {
        return watchLater.some(movie => movie.id === movieID);
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

    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>;
};