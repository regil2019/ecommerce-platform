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
  
  // Se já for uma URL completa (Cloudinary), retorna ela mesma
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  // Se for um caminho relativo antigo (ex: /uploads/...), ignoramos ou usamos placeholder
  // Já que o plano é usar apenas URLs diretas do Cloudinary no banco
  return "https://placehold.co/600x600?text=Invalid+Image+Path";
};
