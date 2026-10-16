import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length);
}

// The session stays in an HttpOnly cookie. The readable CSRF token is sent only
// with state-changing requests and verified by the API.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && config.method && ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())) {
      const csrfToken = getCookie("prescription_csrf");
      if (csrfToken) config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("authentication-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
