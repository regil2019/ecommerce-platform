import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserFavorites, removeFromFavorites } from "../../services/favoriteApi";
import { toast } from "react-toastify";
import ProductCard from "../../components/ProductCard";
import { Button } from "../../components/ui/Button";
import { X } from "lucide-react";
import { useI18n } from "../../i18n";

export default function Favorites() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await getUserFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Favorites fetch error:", error);
      setError(t("common.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((fav) => fav.productId !== productId));
      toast.success(t("product.removeFromFavorites"));
    } catch (error) {
      console.error("Remove favorite error:", error);
      toast.error(t("common.error"));
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <h1 className="mb-4 text-3xl font-bold text-foreground">{t("favorites.title")}</h1>
        <p className="mb-6 text-muted-foreground">
          {t("favorites.loginRequired")}
        </p>
        <Link to="/login">
          <Button>{t("auth.signIn")}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">{t("favorites.title")}</h1>
        <div className="text-center text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">{t("favorites.title")}</h1>
        <div className="text-center text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-foreground">{t("favorites.title")}</h1>

      {favorites.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">❤️</div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">{t("favorites.empty")}</h2>
          <p className="mb-6 text-muted-foreground">
            {t("favorites.emptyDesc")}
          </p>
          <Link to="/">
            <Button>{t("favorites.explore")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="relative">
              <ProductCard product={favorite.product} />
              <button
                onClick={() => handleRemoveFavorite(favorite.productId)}
                className="absolute right-2 top-2 z-20 rounded-full bg-destructive p-2 text-destructive-foreground transition-colors duration-200 hover:bg-destructive/90"
                title={t("product.removeFromFavorites")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}