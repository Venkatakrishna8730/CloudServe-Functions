import axios from "axios";

const api = axios.create({
  baseURL: window.env?.VITE_API_URL || import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY: "/auth/verify",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REGENERATE_API_KEY: "/apikey/regenerate",
    GOOGLE_LOGIN: "/auth/google",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },
  FUNCTIONS: {
    LIST: "/functions",
    DEPLOY: "/functions/deploy",
    DETAILS: (id) => `/functions/${id}`,
    UPDATE: (id) => `/functions/${id}`,
    DELETE: (id) => `/functions/${id}`,
  },
  LOGS: {
    GET: (id) => `/logs/${id}`,
    CLEAR: (id) => `/logs/${id}`,
  },
  USAGE: {
    GET: (id) => `/usages/${id}`,
    ALL: "/usages",
  },
};

export default api;
