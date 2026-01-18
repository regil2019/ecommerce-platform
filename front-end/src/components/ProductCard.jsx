import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import useCart from "../hooks/useCart";
import FavoriteButton from "./FavoriteButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/badge";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/images/placeholder.jpg"];

  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <Link
        to={`/product/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={product.name}
      />

      <div className="relative aspect-square overflow-hidden">
        <Carousel className="h-full w-full">
          <CarouselContent>
            {images.map((img, idx) => (
              <CarouselItem key={idx}>
                <img
                  src={img || "/images/placeholder.jpg"}
                  alt={`${product.name} - imagem ${idx + 1}`}
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
            className="absolute top-3 left-3 z-20"
          >
            {product.category.name}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 flex-1 font-semibold leading-tight text-gray-800 dark:text-gray-100">
          {product.name}
        </h3>
        <p className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(product.price)}
        </p>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="relative z-20 mt-auto w-full"
          aria-label="Adicionar ao carrinho"
        >
          {isOutOfStock ? (
            "Indisponível"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;