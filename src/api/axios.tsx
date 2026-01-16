import axios from "axios";
import type { authData } from "../types/authType";

const BASE_URL = "http://localhost:3000";

//Public axios instance
export const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//Private axios instance
export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
privateAxios.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const authData: authData = JSON.parse(stored);
      if (config.headers) {
        config.headers["Authorization"] = `Bearer ${authData.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
