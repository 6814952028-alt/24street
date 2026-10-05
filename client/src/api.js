const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://two4street.onrender.com")).replace(/\/+$/, "");
export default API_URL;

