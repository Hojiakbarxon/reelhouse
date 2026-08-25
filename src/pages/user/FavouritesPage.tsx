import { Link } from 'react-router-dom';
import { Heart, Play } from 'lucide-react';
import { useFavourites, useToggleFavourite } from '@/hooks/use-favourites';
import { Poster } from '@/components/ui/Poster';
import { Badge } from '@/components/ui/Feedback';
import { MovieRatingStars } from '@/components/ui/StarRating';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { SubscriptionType } from '@/api/types';

export function FavouritesPage() {
  const { data, isLoading, isError, refetch } = useFavourites();
  const { remove } = useToggleFavourite();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl tracking-wide text-paper-100">My List</h1>
      <p className="mt-2 text-paper-500">Movies you've saved to watch later.</p>

      <div className="mt-8">
        {isLoading ? (
          <Spinner label="Loading your list" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data || data.movies.length === 0 ? (
          <EmptyState
            title="Your list is empty"
            description="Browse the catalog and tap the heart on any title to save it here."
            action={
              <Link to="/" className="text-sm font-medium text-gold-400 hover:text-gold-300">
                Browse movies
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.movies.map((movie) => (
              <div key={movie.id} className="group relative overflow-hidden rounded-card border border-ink-700 bg-ink-800">
                <Link to={`/movies/${movie.slug}`} className="block">
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <Poster
                      src={movie.poster_url}
                      alt={movie.title}
                      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                      aria-hidden
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-gold-400/90 text-ink-950 shadow-lg">
                        <Play className="size-5 translate-x-0.5 fill-current" />
                      </div>
                    </div>
                    {movie.subscription_type === SubscriptionType.PREMIUM && (
                      <Badge tone="gold" className="absolute right-2 top-2">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-3">
                    <h3 className="line-clamp-1 font-semibold text-paper-100">{movie.title}</h3>
                    <p className="font-mono text-xs text-paper-500">{movie.release_year}</p>
                    <MovieRatingStars value={movie.rating} />
                  </div>
                </Link>
                <button
                  onClick={() => remove.mutate(movie.id)}
                  disabled={remove.isPending}
                  className="absolute left-2 top-2 rounded-full bg-ink-950/70 p-1.5 text-crimson-400 backdrop-blur hover:bg-ink-950"
                  aria-label={`Remove ${movie.title} from My List`}
                >
                  <Heart className="size-4 fill-crimson-400" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


