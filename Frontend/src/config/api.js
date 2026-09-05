/**
 * Central API Configuration
 * ─────────────────────────
 * Single source of truth for the backend URL.
 * - In LOCAL dev:  reads VITE_API_URL from .env  →  http://localhost:3001
 * - In PRODUCTION: reads VITE_API_URL from Vercel env vars  →  https://divyayatra-tic.onrender.com
 *
 * Never hardcode localhost:3001 anywhere else. Always import from here.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export const API_V1 = `${API_BASE_URL}/api/v1`;

/** Helper: Resolve a relative image/upload path to a full URL */
export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default API_BASE_URL;
