import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isGithubPages = process.env.GITHUB_REPOSITORY?.includes("browse-movies")

export default defineConfig({
  plugins: [react()],
  base: isGithubPages ? "/browse-movies/" : "/",
})