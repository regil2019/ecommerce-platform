import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import ReviewList from "../../components/ReviewList";
import ReviewForm from "../../components/ReviewForm";
import FavoriteButton from "../../components/FavoriteButton";
import SimilarProducts from "../../components/SimilarProducts";
import { getProductReviews } from "../../services/reviewApi";
import { formatCurrency } from "../../lib/utils";
import { Star, Truck, Shield, RotateCcw, AlertCircle } from "lucide-react";
import { useI18n } from "../../i18n";
import { StickyAddToCart } from "../../components/StickyAddToCart";
import { RainbowButton } from "../../components/magicui/RainbowButton";
import { Button } from "../../components/ui/Button";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { addToCart } = useCart();

  const mainButtonRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(t("common.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Intersection Observer for Sticky Add To Cart
  useEffect(() => {
    if (!mainButtonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when main button is NOT intersecting (scrolled past)
        // Check if bounding client rect top is negative (scrolled past up)
        const isPast = entry.boundingClientRect.top < 0;
        setShowSticky(!entry.isIntersecting && isPast);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" } // Adjust margin as needed
    );

    observer.observe(mainButtonRef.current);

    return () => {
      if (mainButtonRef.current) observer.unobserve(mainButtonRef.current);
    };
  }, [loading, product]);

  const handleReviewSubmitted = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  const hasSizes = product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      toast.error(t("product.sizeRequired"));
      return false;
    }
    if (product && quantity > 0) {
      addToCart({ ...product, quantity, selectedSize });
    }
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (added) navigate("/cart");
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground animate-pulse">
        {t("common.loading")}
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-destructive">
        {error}
      </div>
    );

  const images = product.images?.length
    ? product.images
    : [product.main_image || "/images/placeholder-product.jpg"];

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border/50 bg-muted/30 shadow-sm">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${selectedImage === idx
                    ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                    : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">{product.name}</h1>
              <FavoriteButton
                productId={product.id}
                initialIsFavorite={product.isFavorite}
                size="w-10 h-10"
                className="static bg-transparent p-0 hover:bg-transparent text-muted-foreground hover:text-red-500 transition-colors"
              />
            </div>

            {/* Rating */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= averageRating
                      ? "fill-current text-yellow-400"
                      : "text-muted-foreground/20"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                ({t("product.reviewCount", { count: reviews.length })})
              </span>
            </div>

            {/* Price */}
            <div className="inline-block rounded-lg bg-primary/5 px-4 py-2">
              <span className="text-2xl sm:text-4xl font-bold text-primary tracking-tight">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="leading-relaxed text-muted-foreground text-base sm:text-lg">{product.description}</p>
          </div>

          {/* Size Selector */}
          {hasSizes && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {t("product.selectSize")}
                  {selectedSize && (
                    <span className="ml-2 text-primary font-bold">{selectedSize}</span>
                  )}
                </label>
                {!selectedSize && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t("product.sizeRequired")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    className={`min-w-[3rem] px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-accent"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Buttons */}
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                {t("product.quantity")}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-border bg-background">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-lg text-foreground transition-colors hover:bg-accent hover:text-accent-foreground rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-lg text-foreground transition-colors hover:bg-accent hover:text-accent-foreground rounded-r-xl"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.stock > 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      {t("product.inStock")}
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      {t("product.outOfStock")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2" ref={mainButtonRef}>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                variant="outline"
                className="h-14 w-full rounded-xl border-2 text-base font-semibold hover:bg-accent"
              >
                {t("product.buyNow")}
              </Button>
              <RainbowButton
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="h-14 w-full rounded-xl text-base font-bold shadow-lg shadow-primary/20"
              >
                {t("product.addToCart")}
              </RainbowButton>
            </div>

            {/* Stock Scarcity Status */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                  {t("product.stock", { count: product.stock })}
                </p>
              </div>
            )}
          </div>

          {/* Shipping & Guarantee */}
          <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-8">
            <div className="flex flex-col items-center gap-2 text-center p-4 rounded-xl bg-muted/20">
              <div className="p-2 rounded-full bg-background border border-border">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t("product.secureDelivery")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center p-4 rounded-xl bg-muted/20">
              <div className="p-2 rounded-full bg-background border border-border">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t("product.guarantee")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center p-4 rounded-xl bg-muted/20">
              <div className="p-2 rounded-full bg-background border border-border">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t("product.freeReturns")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <SimilarProducts productId={id} />

      {/* Reviews Section */}
      <div className="mt-16 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">{t('product.reviews')}</h2>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <ReviewForm
                productId={parseInt(id)}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          </div>
          <div className="lg:col-span-8">
            <ReviewList reviews={reviews} loading={reviewsLoading} />
          </div>
        </div>
      </div>

      {/* Sticky Add To Cart */}
      <StickyAddToCart
        product={product}
        quantity={quantity}
        onIncrement={() => setQuantity(q => q + 1)}
        onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
        onAddToCart={handleAddToCart}
        isVisible={showSticky}
      />
    </div>
  );
}