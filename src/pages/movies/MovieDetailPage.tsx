import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Lock, Eye, Trash2 } from 'lucide-react';
import { useMovieDetail } from '@/hooks/use-movie-detail';
import { useCreateReview, useDeleteReview } from '@/hooks/use-reviews';
import { useFavourites, useToggleFavourite } from '@/hooks/use-favourites';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Poster } from '@/components/ui/Poster';
import { Badge } from '@/components/ui/Feedback';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner, ErrorState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { MoviePlayer } from '@/components/movies/MoviePlayer';
import { ReviewForm } from '@/components/movies/ReviewForm';
import { ReviewsList } from '@/components/movies/ReviewsList';
import { SubscriptionType, type Review } from '@/api/types';

export function MovieDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: movie, isLoading, isError, refetch } = useMovieDetail(slug);
  const { data: me } = useCurrentUser();
  const { data: favourites } = useFavourites();
  const { add, remove } = useToggleFavourite();

  // Fallback for before the backend embeds reviews.items on GET /movies/:slug —
  // once it does, the real list below takes over and this is never used.
  const [localMyReview, setLocalMyReview] = useState<Review | null>(null);

  const createReview = useCreateReview(movie?.id ?? '', slug ?? '');
  const deleteReview = useDeleteReview(movie?.id ?? '', slug ?? '');

  if (isLoading) return <Spinner label="Loading movie" />;
  if (isError || !movie) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState
          title="Movie not found"
          description="This title may have been removed, or the link is broken."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isFavourited = favourites?.movies.some((m) => m.id === movie.id) ?? false;
  const movieFiles = Array.isArray(movie.files) ? movie.files : null;
  const reviewItems = movie.reviews.items;
  const alreadyReviewed = reviewItems?.some((r) => r.user.id === me?.id) ?? !!localMyReview;

  function handleToggleFavourite() {
    if (isFavourited) remove.mutate(movie!.id);
    else add.mutate(movie!.id);
  }

  function handlePostReview(values: { rating: number; comment: string }) {
    createReview.mutate(values, {
      onSuccess: (response) => setLocalMyReview(response.data.data),
    });
  }

  function handleDeleteReview(reviewId: string) {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        if (reviewId === localMyReview?.id) setLocalMyReview(null);
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <Poster src={movie.poster_url} alt={movie.title} className="aspect-[2/3] w-full rounded-card" />

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {movie.subscription_type === SubscriptionType.PREMIUM && <Badge tone="gold">Premium</Badge>}
            <Badge tone="neutral">
              <Eye className="mr-1 inline size-3" aria-hidden />
              {movie.view_count.toLocaleString()} views
            </Badge>
          </div>

          <h1 className="font-display text-4xl tracking-wide text-paper-100 text-balance">{movie.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-paper-500">
            <span>{movie.release_year}</span>
            <span>·</span>
            <span>{movie.duration_minutes} min</span>
            <span>·</span>
            <StarRating value={movie.reviews.average_rating} count={movie.reviews.count} />
          </div>

          {movie.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {movie.categories.map((c) => (
                <Badge key={c} tone="neutral">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          {movie.description && <p className="mt-4 max-w-2xl text-paper-300">{movie.description}</p>}

          <div className="mt-6">
            <Button
              variant={isFavourited ? 'secondary' : 'primary'}
              onClick={handleToggleFavourite}
              isLoading={add.isPending || remove.isPending}
            >
              <Heart className={isFavourited ? 'fill-crimson-400 text-crimson-400' : ''} />
              {isFavourited ? 'In My List' : 'Add to My List'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {!movieFiles ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-ink-600 py-12 text-center">
            <Lock className="size-8 text-gold-400" aria-hidden />
            <p className="text-paper-300">
              {(movie.files as { message: string }).message}
            </p>
            <Link to="/plans">
              <Button variant="primary">View plans</Button>
            </Link>
          </div>
        ) : movieFiles.length > 0 ? (
          <MoviePlayer files={movieFiles} />
        ) : (
          <p className="text-sm text-paper-500">No playable files have been uploaded for this title yet.</p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl tracking-wide text-paper-100">Reviews</h2>
        <p className="mt-1 text-sm text-paper-500">
          {movie.reviews.count > 0
            ? `${movie.reviews.count} review${movie.reviews.count === 1 ? '' : 's'}, averaging ${movie.reviews.average_rating.toFixed(1)} stars.`
            : 'No reviews yet — be the first.'}
        </p>

        <div className="mt-4 max-w-xl">
          {reviewItems && reviewItems.length > 0 && (
            <div className="mb-4">
              <ReviewsList
                reviews={reviewItems}
                currentUserId={me?.id}
                currentUserRole={me?.role ?? null}
                onDelete={handleDeleteReview}
                isDeleting={deleteReview.isPending}
              />
            </div>
          )}

          {/* Fallback panel for a review just posted this session, only used
              when the backend hasn't started returning reviews.items yet. */}
          {!reviewItems && localMyReview && (
            <div className="mb-4 flex items-start justify-between gap-4 rounded-card border border-ink-700 bg-ink-800 p-4">
              <div>
                <p className="text-sm font-medium text-paper-100">{localMyReview.user.username} (you)</p>
                <StarRating value={localMyReview.rating} />
                <p className="mt-2 text-sm text-paper-300">{localMyReview.comment}</p>
              </div>
              <button
                onClick={() => handleDeleteReview(localMyReview.id)}
                className="p-1 text-paper-500 hover:text-crimson-400"
                aria-label="Delete your review"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          {!me ? (
            <p className="text-sm text-paper-500">
              <Link to="/login" className="font-medium text-gold-400 hover:text-gold-300">
                Sign in
              </Link>{' '}
              to leave a review.
            </p>
          ) : alreadyReviewed ? null : (
            <ReviewForm onSubmit={handlePostReview} isSubmitting={createReview.isPending} />
          )}
        </div>
      </div>
    </div>
  );
}