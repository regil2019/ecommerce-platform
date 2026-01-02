import React from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import { Button } from "./ui/Button";
import { FiShoppingCart } from "react-icons/fi";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={product.image || '/images/placeholder-product.jpg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-1 text-lg font-bold hover:text-blue-600">{product.name}</h3>
        </Link>
        
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Kz {product.price.toFixed(2)}</span>
          {product.stock > 0 ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
              Em estoque
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
              Esgotado
            </span>
          )}
        </div>
        
        <Button
          onClick={() => addToCart(product)}
          className="w-full"
          disabled={product.stock <= 0}
        >
          <FiShoppingCart className="mr-2" />
          {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </Button>
      </div>
    </div>
  );
}