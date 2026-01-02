import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from './ui/carousel';
import { formatCurrency } from '../lib/utils';
import useCart from '../hooks/useCart';
import FavoriteButton from './FavoriteButton';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const images =
    product?.images?.length > 0
      ? product.images
      : [product?.image || '/images/placeholder.jpg'];

  const isOutOfStock = !product?.stock || product.stock <= 0;

  return (
    <Card className="group h-full overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-md">
      
      {/* IMAGEM */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Carousel className="h-full w-full">
          <CarouselContent>
            {images.map((img, idx) => (
              <CarouselItem key={idx} className="h-full w-full">
                <Link to={`/product/${product.id}`} aria-label={product.name}>
                  <img
                    src={img || '/images/placeholder.jpg'}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="size-6 opacity-0 transition-opacity group-hover:opacity-100" />
              <CarouselNext className="size-6 opacity-0 transition-opacity group-hover:opacity-100" />
            </>
          )}
        </Carousel>

        <FavoriteButton productId={product.id} />
      </div>

      {/* CONTEÚDO */}
      <CardContent className="space-y-1 p-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          <Link
            to={`/product/${product.id}`}
            className="transition-colors hover:text-blue-600"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>

          {product.category?.name && (
            <span className="text-[10px] uppercase tracking-wide text-gray-500">
              {product.category.name}
            </span>
          )}
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="h-8 w-full rounded-md bg-blue-600 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isOutOfStock ? 'Indisponível' : 'Adicionar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
