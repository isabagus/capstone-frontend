import axios from "axios";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const getBaseUrl = () => {
  // Jika di browser (termasuk sub-path /nama-project via Nginx + Tailscale Funnel),
  // gunakan "${BASE_PATH}/api" agar otomatis diteruskan ke Laravel backend
  if (typeof window !== "undefined") {
    return `${BASE_PATH}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Interceptor: Tambahkan token dari localStorage ke setiap request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor: Handle 401 (token expired/invalid) -> redirect ke login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = `${BASE_PATH}/login`;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
