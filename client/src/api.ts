import axios from 'axios';

// Get API base URL. Uses environment variable if deployed separately (e.g., Netlify),
// otherwise falls back to relative '/api' for fullstack monolith deployments.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
