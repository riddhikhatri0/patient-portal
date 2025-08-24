// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  // This reads the REACT_APP_API_URL variable you set in Vercel
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;