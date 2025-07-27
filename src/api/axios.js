import axios from "axios";

export const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true, // Puedes dejar esto si usas cookies, pero no es necesario para Token Auth
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});
