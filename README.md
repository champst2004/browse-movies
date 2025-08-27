# 🎬 [Browse Movies](https://champst2004.github.io/browse-movies/)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

A fast, modern **React + Vite** web app scaffold for exploring and browsing movies.  
Designed for rapid iteration with HMR, ESLint integration, and a clean component-first structure.  
Perfect base for integrating public movie APIs like **TMDb** or **OMDb**.

---

## 🚀 Features
- ⚡ React + Vite with blazing-fast dev server & HMR  
- 🔎 Ready to integrate **TMDb/OMDb** for movie search, lists, and details  
- ✅ ESLint setup (extendable with TypeScript)  
- 🎨 Component-first project structure with dedicated CSS  

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite  
- **Styling:** CSS  
- **Linting:** ESLint (expandable with TypeScript rules)  

---

## 📦 Getting Started
### Prerequisites
- Node.js 18+  
- npm / yarn / pnpm  

### Installation
```bash
git clone https://github.com/champst2004/browse-movies
cd browse-movies
npm install
npm run dev
```
App runs at **http://localhost:5173**

---

## 🌍 Environment Variables
Create a `.env` file in the project root:

```env
# TMDb
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500${movie.poster_path}
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

---

## 📂 Project Structure
```
src/
 ├─ assets/        # Images, icons, static files
 ├─ components/    # Reusable components (MovieCard, NavBar, etc.)
 ├─ contexts/      # React Contexts (MovieContext)
 ├─ css/           # Component-specific CSS (App.css, Home.css, etc.)
 ├─ pages/         # Route-level pages (Home, Favorites)
 ├─ services/      # API clients (e.g., tmdb.js, omdb.js)
 ├─ App.jsx        # App shell and router
 └─ main.jsx       # Root entry point
```

---

## 📌 Roadmap
- 🔜 API integration (TMDb/OMDb)  
- 🎭 Responsive UI + Dark mode  
- 🔄 Pagination / Infinite scroll  
- ⭐ Favorites & Watchlist  
- 🎥 Trailers and Cast pages  

---

## 📜 License
MIT © [champst2004](https://github.com/champst2004/browse-movies?tab=MIT-1-ov-file#)
