import { useState } from 'react';
import { StarRatingInput } from '@/components/ui/StarRating';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ReviewForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: { rating: number; comment: string }) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (rating < 1 || !comment.trim()) return;
    onSubmit({ rating, comment: comment.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-card border border-ink-700 bg-ink-800 p-4">
      <div>
        <p className="mb-1.5 text-sm font-medium text-paper-300">Your rating</p>
        <StarRatingInput value={rating} onChange={setRating} />
        {touched && rating < 1 && <p className="mt-1 text-sm text-crimson-400">Pick a star rating.</p>}
      </div>
      <Textarea
        label="Your review"
        rows={3}
        placeholder="What did you think?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        error={touched && !comment.trim() ? 'Write a few words about the movie.' : undefined}
      />
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Post review
      </Button>
    </form>
  );
}
