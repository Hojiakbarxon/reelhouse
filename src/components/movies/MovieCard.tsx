import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Poster } from '@/components/ui/Poster';
import { Badge } from '@/components/ui/Feedback';
import { MovieRatingStars } from '@/components/ui/StarRating';
import { SubscriptionType, type MovieListItem } from '@/api/types';

export function MovieCard({ movie }: { movie: MovieListItem }) {
  return (
    <Link
      to={`/movies/${movie.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-800 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Poster
          src={movie.poster_url}
          alt={movie.title}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Hover attraction layer: darkening gradient + play affordance */}
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
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 font-semibold text-paper-100">{movie.title}</h3>
        <p className="font-mono text-xs text-paper-500">
          {movie.release_year} · {movie.duration_minutes}m
        </p>
        <MovieRatingStars value={movie.rating} />
      </div>
    </Link>
  );
}


