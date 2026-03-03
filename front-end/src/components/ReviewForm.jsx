import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { useI18n } from "../i18n";

const StarRatingInput = ({ rating, onRatingChange, label }) => {
  return (
    <div className="flex items-center space-x-1">
      <span className="mr-2 text-sm font-medium text-foreground">{label}:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`h-8 w-8 ${star <= rating ? "fill-current text-yellow-400" : "text-muted-foreground/30"
              } transition-colors hover:text-yellow-400`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
    </div>
  );
};

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (rating < 1 || rating > 5) {
      setError(t("common.error"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/reviews", {
        productId,
        rating,
        comment: comment.trim() || null,
      });

      setRating(5);
      setComment("");

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (err) {
      console.error("Review submit error:", err);
      setError(err.response?.data?.error || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            <a href="/login" className="font-medium text-primary hover:text-primary/80">
              {t("auth.signIn")}
            </a>{" "}
            {t("product.beFirstToReview")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("product.writeReview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRatingInput
            rating={rating}
            onRatingChange={setRating}
            label={t("product.rating")}
          />

          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-foreground">
              {t("product.yourReview")}
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("product.reviewPlaceholder")}
              rows={4}
              maxLength={1000}
              className="w-full"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? t("common.loading") : t("product.submitReview")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;