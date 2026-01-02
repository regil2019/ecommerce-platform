import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const StarRatingInput = ({ rating, onRatingChange }) => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm font-medium text-gray-700 mr-2">Avaliação:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-8 h-8 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
    </div>
  );
};

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Você precisa estar logado para avaliar este produto');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Por favor, selecione uma avaliação válida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/reviews', {
        productId,
        rating,
        comment: comment.trim() || null
      });

      // Reset form
      setRating(5);
      setComment('');

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setError(
        err.response?.data?.error ||
        'Erro ao enviar avaliação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Faça login
            </a>
            {' '}para avaliar este produto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Escrever Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRatingInput rating={rating} onRatingChange={setRating} />

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentário (opcional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos sua opinião sobre este produto..."
              rows={4}
              maxLength={1000}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 caracteres
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;