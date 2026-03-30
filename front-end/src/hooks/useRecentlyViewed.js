import { useEffect, useState } from 'react';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed(currentProductId) {
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setRecentIds(stored);
  }, []);

  useEffect(() => {
    if (!currentProductId) return;
    const id = String(currentProductId);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = stored.filter(sid => sid !== id);
    const updated = [id, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecentIds(updated);
  }, [currentProductId]);

  const getRecentIds = (excludeId) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return stored.filter(id => String(id) !== String(excludeId));
  };

  return { recentIds, getRecentIds };
}
