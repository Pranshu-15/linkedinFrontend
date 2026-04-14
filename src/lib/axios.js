import axios from "axios";

const serverUrl = "https://linkedinbackend-jgbh.onrender.com";

const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
