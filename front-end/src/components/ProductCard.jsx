import { Link } from "react-router-dom"; // Force Rebuild
import { ShoppingCart } from "lucide-react";
import { formatCurrency, getImageUrl } from "../lib/utils";
import useCart from "../hooks/useCart";
import { useI18n } from "../i18n";
import FavoriteButton from "./FavoriteButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import { RainbowButton } from "./magicui/RainbowButton";
import { MagicCard } from "./magicui/MagicCard";
import { Badge } from "./ui/badge";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useI18n();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };


  const images =
    product.images && product.images.length > 0
      ? product.images.map(img => getImageUrl(img))
      : [getImageUrl(product.main_image)];

  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <MagicCard
      className="group relative flex h-full flex-col overflow-hidden"
      spotlightColor="rgba(59, 130, 246, 0.1)" // Primary color spotlight
    >
      <Link
        to={`/product/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={product.name}
      />

      <div className="relative aspect-square overflow-hidden bg-white/50 dark:bg-black/20">
        <Carousel className="h-full w-full">
          <CarouselContent>
            {images.map((img, idx) => (
              <CarouselItem key={idx}>
                <img
                  src={img || "/images/placeholder-product.jpg"}
                  alt={`${product.name} - ${idx + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 z-20 -translate-y-1/2 scale-75 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" />
              <CarouselNext className="absolute right-2 top-1/2 z-20 -translate-y-1/2 scale-75 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" />
            </>
          )}
        </Carousel>
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton productId={product.id} />
        </div>
        {product.category?.name && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 z-20 opacity-90 backdrop-blur-sm"
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 flex-1 font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="mb-3 text-2xl font-bold text-foreground">
          {formatCurrency(product.price)}
        </p>

        <RainbowButton
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="relative z-20 mt-auto w-full"
          aria-label={t('product.addToCart')}
        >
          {isOutOfStock ? (
            t('product.outOfStock')
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('product.addToCart')}
            </>
          )}
        </RainbowButton>
      </div>
    </MagicCard>
  );
};

export default ProductCard;