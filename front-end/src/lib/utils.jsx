import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency.
 * Defaults to USD; will be overridden by locale/currency context where needed.
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a date string using the browser's locale by default.
 */
export const formatDate = (dateString, locale = 'en-US') => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate text to maxLength and append ellipsis.
 */
export const truncateText = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};

/**
 * Resolves an image path to a full URL based on the backend setting.
 */
export const getImageUrl = (path) => {
  if (!path) return "https://placehold.co/600x600?text=No+Image";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;

  let backendUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  backendUrl = backendUrl.replace(/(\/api)?\/?$/, "");

  // Fallback: se o backendUrl ficou vazio ou relativo (ex: /api), aponta pro servidor back-end local (porta 4000) usando o IP/host atual
  if (!backendUrl || backendUrl.startsWith("/")) {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    backendUrl = `${currentProtocol}//${currentHost}:4000`;
  }

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${backendUrl}/${cleanPath}`;
};
