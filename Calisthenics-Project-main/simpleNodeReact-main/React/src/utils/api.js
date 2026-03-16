/**
 * API utility - adds JWT token to requests.
 * Use for all authenticated API calls.
 */

import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "";

function getAuthHeaders(extraHeaders = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function handle401(res) {
  if (res?.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.setItem("session_expired", "1");
    window.location.href = "/";
  }
}

export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const headers = getAuthHeaders(options.headers || {});
  const res = await fetch(fullUrl, { ...options, headers });
  handle401(res);
  return res;
}

/** Axios instance with auth - use for axios-based components */
export const apiAxios = axios.create();
apiAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiAxios.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.setItem("session_expired", "1");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

/** Extract error message from API response - returns Hebrew-friendly message */
export async function getErrorMessage(res) {
  try {
    const data = await res.json();
    return data?.error || "אירעה שגיאה. נסה שוב.";
  } catch {
    return "אירעה שגיאה. נסה שוב.";
  }
}

export { getAuthHeaders };
