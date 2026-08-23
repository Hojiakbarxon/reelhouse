import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdminMovies, useDeleteMovie } from '@/hooks/use-admin-movies';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Feedback';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/format';
import { SubscriptionType, type AdminMovieListItem } from '@/api/types';

export function AdminMoviesPage() {
  const { data, isLoading, isError, refetch } = useAdminMovies();
  const deleteMovie = useDeleteMovie();
  const [toDelete, setToDelete] = useState<AdminMovieListItem | null>(null);

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteMovie.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-paper-100">Movies</h2>
          <p className="text-sm text-paper-500">{data?.total ?? 0} titles in the catalog</p>
        </div>
        <Link to="/admin/movies/new">
          <Button>
            <Plus className="size-4" aria-hidden />
            New movie
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Spinner label="Loading movies" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.movies.length === 0 ? (
        <EmptyState title="No movies yet" description="Add your first title to the catalog." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-700 bg-ink-800 text-xs uppercase tracking-wide text-paper-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Reviews</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">By</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {data.movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-ink-800/50">
                  <td className="px-4 py-3 font-medium text-paper-100">{movie.title}</td>
                  <td className="px-4 py-3 text-paper-300">{movie.release_year}</td>
                  <td className="px-4 py-3">
                    <Badge tone={movie.subscription_type === SubscriptionType.PREMIUM ? 'gold' : 'neutral'}>
                      {movie.subscription_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-paper-300">{movie.view_count}</td>
                  <td className="px-4 py-3 font-mono text-paper-300">{movie.review_count}</td>
                  <td className="px-4 py-3 text-paper-500">{formatDate(movie.created_at)}</td>
                  <td className="px-4 py-3 text-paper-500">{movie.created_by ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/movies/${movie.id}/edit`}
                        state={{ slug: movie.slug }}
                        className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-gold-400"
                        aria-label={`Edit ${movie.title}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => setToDelete(movie)}
                        className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-crimson-400"
                        aria-label={`Delete ${movie.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete movie"
        description={`This permanently deletes "${toDelete?.title}" and its files. This can't be undone.`}
        isLoading={deleteMovie.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
