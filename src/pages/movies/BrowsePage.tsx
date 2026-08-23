import { useState } from 'react';
import { Search } from 'lucide-react';
import { useMovies } from '@/hooks/use-movies';
import { useCategories } from '@/hooks/use-categories';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useAuthStore } from '@/store/auth-store';
import { MovieCard } from '@/components/movies/MovieCard';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { SubscriptionType } from '@/api/types';

export function BrowsePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | ''>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const isAuthed = useAuthStore((s) => s.isTokenValid());
  const { data: categories } = useCategories();

  const { data, isLoading, isError, refetch, isPlaceholderData } = useMovies({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    category: category || undefined,
    subscription_type: subscriptionType || undefined,
  });

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide text-paper-100">Browse the catalog</h1>
        <p className="mt-2 text-paper-500">Find your next watch.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <label htmlFor="movie-search" className="sr-only">
            Search titles
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-500" />
          <input
            id="movie-search"
            value={search}
            onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
            placeholder="Search titles…"
            className="w-full rounded-md border border-ink-600 bg-ink-800 py-2.5 pl-9 pr-3 text-paper-100 placeholder:text-ink-400 focus:border-gold-400"
          />
        </div>

        <Select
          value={subscriptionType}
          onChange={(e) => resetToFirstPage(setSubscriptionType)(e.target.value as SubscriptionType | '')}
          className="sm:w-44"
        >
          <option value="">All access</option>
          <option value={SubscriptionType.FREE}>Free</option>
          <option value={SubscriptionType.PREMIUM}>Premium</option>
        </Select>

        {isAuthed && categories && categories.length > 0 && (
          <Select
            value={category}
            onChange={(e) => resetToFirstPage(setCategory)(e.target.value)}
            className="sm:w-44"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {isLoading ? (
        <Spinner label="Loading catalog" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.movies.length === 0 ? (
        <EmptyState
          title="No movies found"
          description="Try a different search term or clear your filters."
        />
      ) : (
        <>
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}
          >
            {data.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <div className="mt-10">
            <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
