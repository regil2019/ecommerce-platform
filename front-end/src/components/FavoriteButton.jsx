import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "../services/favoriteApi";
import { toast } from "react-toastify";
import { useI18n } from "../i18n";

const FavoriteButton = ({ productId, size = "w-6 h-6", className = "" }) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = user || localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (user && productId) {
        try {
          const response = await checkFavoriteStatus(productId);
          if (isMounted) {
            setIsFavorite(response.isFavorite);
          }
        } catch (error) {
          console.error("Favorite status error:", error);
          if (isMounted) {
            setIsFavorite(false);
          }
        }
      } else {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    loadFavoriteStatus();
    return () => { isMounted = false; };
  }, [user, productId]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error(t("auth.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(productId);
        setIsFavorite(false);
        toast.success(t("product.removeFromFavorites"));
      } else {
        await addToFavorites(productId);
        setIsFavorite(true);
        toast.success(t("product.addToFavorites"));
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
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
      className={`absolute right-2 top-2 z-10 rounded-full bg-card/80 p-2 transition-colors duration-200 hover:bg-card ${loading ? "opacity-50" : ""} ${className}`}
      aria-label={isFavorite ? t("product.removeFromFavorites") : t("product.addToFavorites")}
      title={loading ? t("common.loading") : isFavorite ? t("product.removeFromFavorites") : t("product.addToFavorites")}
    >
      {loading ? (
        <div className={`${size} animate-spin rounded-full border-2 border-muted-foreground/30 border-t-destructive`} />
      ) : (
        <Heart
          className={`${size} transition-colors ${isFavorite ? "fill-current text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
        />
      )}
    </button>
  );
};

export default FavoriteButton;