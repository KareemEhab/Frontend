import axios from "axios";
import { getAuthToken } from "../auth/token";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set("x-auth-token", token);
  }
  return config;
});
