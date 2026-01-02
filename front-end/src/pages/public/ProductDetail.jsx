import React, { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../../components/ui/carousel";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import ReviewList from "../../components/ReviewList";
import ReviewForm from "../../components/ReviewForm";
import FavoriteButton from "../../components/FavoriteButton";
import SimilarProducts from "../../components/SimilarProducts";
import { getProductReviews } from "../../services/reviewApi";
import { formatCurrency } from "../../lib/utils";
import { Star, Truck, Shield, RotateCcw, Heart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { addToCart } = useCart();

  // Dados mock para variações (até implementar no backend)
  const colors = ['Preto', 'Branco', 'Azul', 'Vermelho'];
  const sizes = ['P', 'M', 'G', 'GG', 'XG'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setSelectedColor(colors[0]); // Default para primeira cor
        setSelectedSize(sizes[1]); // Default para M
      } catch (err) {
        setError('Produto não encontrado');
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
        console.error('Erro ao buscar reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const handleAddToCart = () => {
    if(product && quantity > 0) {
      addToCart({
        ...product,
        quantity,
        selectedColor,
        selectedSize
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="text-center p-8">Carregando...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  const images = product.images?.length ? product.images : [product.image || '/images/placeholder-product.jpg'];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Galeria de Imagens */}
        <div className="space-y-4">
          {/* Imagem Principal */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          {/* Título e Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <FavoriteButton
                productId={product.id}
                size="w-8 h-8"
                className="static bg-transparent hover:bg-transparent p-0"
              />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({reviews.length} avaliações)
              </span>
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </div>
            {product.price > 100 && (
              <div className="text-sm text-green-600">
                💰 Save ${(product.price * 0.1).toFixed(2)} (10% off)
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Variações - Cor */}
          <div>
            <h3 className="font-semibold mb-3">Cor: <span className="font-normal">{selectedColor}</span></h3>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Variações - Tamanho */}
          <div>
            <h3 className="font-semibold mb-3">Tamanho: <span className="font-normal">{selectedSize}</span></h3>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade e Botões */}
          <div className="space-y-4">
            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comprar Agora
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Status do Estoque */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Últimas {product.stock} unidades disponíveis!
                </p>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  ❌ Produto esgotado
                </p>
              </div>
            )}
          </div>

          {/* Informações de Frete e Garantia */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="w-5 h-5" />
              <span>Free shipping for orders over $25</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5" />
              <span>Garantia de 30 dias</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw className="w-5 h-5" />
              <span>Devolução gratuita em até 7 dias</span>
            </div>
          </div>

          {/* Calculadora de Frete Simples */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3"></h3>
            <div className="flex gap-2">
              <input
                type="text"
                
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Calcular
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Prazo de entrega: 3-5 dias úteis
            </p>
          </div>
        </div>
      </div>

      {/* Produtos Similares */}
      <SimilarProducts productId={id} />

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ReviewForm
              productId={parseInt(id)}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
          <div>
            <ReviewList reviews={reviews} loading={reviewsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}