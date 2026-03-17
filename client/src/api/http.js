import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, 
});

export const tokenStore = {
  accessToken: localStorage.getItem("accessToken") || null,
  set(t) {
    this.accessToken = t;
    localStorage.setItem("accessToken", t);
  },
  clear() {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
  },
};

api.interceptors.request.use((config) => {
  if (tokenStore.accessToken) {
    config.headers.Authorization = `Bearer ${tokenStore.accessToken}`;
  }
  return config;
});