import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toggleFavorite } from "../services/favoriteApi";
import { toast } from "react-toastify";
import { useI18n } from "../i18n";

const FavoriteButton = ({ productId, initialIsFavorite = false, size = "w-6 h-6", className = "" }) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = user || localStorage.getItem("token");

  // Sync with prop changes (when products are re-fetched)
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error(t("auth.fillAllFields"));
      return;
    }

    const previousState = isFavorite;
    
    // Optimistic Update
    setIsFavorite(!previousState);
    setLoading(true);

    try {
      const response = await toggleFavorite(productId);
      // Optional: sync with server response if needed (isFavorite from response)
      if (typeof response.isFavorite !== 'undefined') {
        setIsFavorite(response.isFavorite);
      }
      
      if (response.isFavorite) {
        toast.success(t("product.addToFavorites"));
      } else {
        toast.success(t("product.removeFromFavorites"));
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      // Rollback
      setIsFavorite(previousState);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`absolute right-2 top-2 z-10 rounded-full glass-morphism p-2 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm ${loading ? "opacity-50" : ""} ${className}`}
      aria-label={isFavorite ? t("product.removeFromFavorites") : t("product.addToFavorites")}
      title={isFavorite ? t("product.removeFromFavorites") : t("product.addToFavorites")}
    >
      <Heart
        className={`${size} transition-all duration-300 ${isFavorite ? "fill-destructive text-destructive scale-110" : "text-foreground/60 hover:text-destructive"
          }`}
      />
    </button>
  );
};

export default FavoriteButton;