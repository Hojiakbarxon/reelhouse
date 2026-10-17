import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { useAdminMovies, useDeleteMovie } from "@/hooks/use-admin-movies";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/Button";
import { buttonClass } from "@/components/ui/button-styles";
import { IconButton, IconLink } from "@/components/ui/IconButton";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Feedback";
import { Spinner, EmptyState, ErrorState } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { SubscriptionType, type AdminMovieListItem } from "@/api/types";
import type { AdminMovieSortField, SortOrder } from "@/api/movies";

const PAGE_SIZE = 10;

const MOBILE_SORTS: { value: string; label: string }[] = [
  { value: "created_at:DESC", label: "Sort: newest added" },
  { value: "created_at:ASC", label: "Sort: oldest added" },
  { value: "title:ASC", label: "Sort: title A–Z" },
  { value: "title:DESC", label: "Sort: title Z–A" },
  { value: "view_count:DESC", label: "Sort: most viewed" },
  { value: "review_count:DESC", label: "Sort: most reviewed" },
  { value: "release_year:DESC", label: "Sort: release year (newest)" },
  { value: "release_year:ASC", label: "Sort: release year (oldest)" },
];

export function AdminMoviesPage() {
  const [search, setSearch] = useState("");
  const [subscriptionType, setSubscriptionType] = useState<
    SubscriptionType | ""
  >("");
  const [sortBy, setSortBy] = useState<AdminMovieSortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, refetch, isPlaceholderData } =
    useAdminMovies({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      subscription_type: subscriptionType || undefined,
      sortBy,
      sortOrder,
    });
  const deleteMovie = useDeleteMovie();
  const [toDelete, setToDelete] = useState<AdminMovieListItem | null>(null);
  const isFiltering = !!debouncedSearch.trim() || !!subscriptionType;

  // Clicking the active column flips the direction; a new column starts
  // descending (ascending for the title, where A→Z is the natural default).
  function handleSort(field: AdminMovieSortField) {
    if (field === sortBy) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder(field === "title" ? "ASC" : "DESC");
    }
    setPage(1);
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteMovie.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        // Deleted the last row on this page — step back so we don't land on an empty page.
        if (data?.movies.length === 1 && page > 1) setPage(page - 1);
      },
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-paper-100">
            Movies
          </h2>
          <p className="text-sm text-paper-500">
            {data?.total ?? 0} titles in the catalog
          </p>
        </div>
        <Link to="/admin/movies/new" className={buttonClass()}>
          <Plus className="size-4" aria-hidden />
          New movie
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-sm">
          <label htmlFor="admin-movie-search" className="sr-only">
            Search movies
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-500" />
          <input
            id="admin-movie-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title…"
            className="w-full rounded-md border border-ink-600 bg-ink-800 py-2.5 pl-9 pr-3 text-paper-100 placeholder:text-ink-400 focus:border-gold-400"
          />
        </div>
        <Select
          aria-label="Filter by access"
          value={subscriptionType}
          onChange={(e) => {
            setSubscriptionType(e.target.value as SubscriptionType | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All access</option>
          <option value={SubscriptionType.FREE}>Free</option>
          <option value={SubscriptionType.PREMIUM}>Premium</option>
        </Select>
        {/* The sortable table headers are hidden on phones, so offer the same sorting here. */}
        <div className="sm:col-span-2 md:hidden">
          <Select
            aria-label="Sort movies"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":") as [
                AdminMovieSortField,
                SortOrder,
              ];
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          >
            {MOBILE_SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Loading movies" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.movies.length === 0 ? (
        isFiltering ? (
          <EmptyState
            title="No matches"
            description="Nothing matches your search or filter. Try a different term."
          />
        ) : (
          <EmptyState
            title="No movies yet"
            description="Add your first title to the catalog."
          />
        )
      ) : (
        <div
          style={{
            opacity: isPlaceholderData ? 0.6 : 1,
            transition: "opacity 150ms",
          }}
        >
          {/* Phones: one card per movie with big, labelled Edit / Delete buttons. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {data.movies.map((movie) => (
              <li
                key={movie.id}
                className="rounded-card border border-ink-700 bg-ink-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-paper-100">
                      {movie.title}
                    </p>
                    <p className="mt-0.5 text-xs text-paper-500">
                      {movie.release_year}
                      {movie.created_by
                        ? ` · added by ${movie.created_by}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    tone={
                      movie.subscription_type === SubscriptionType.PREMIUM
                        ? "gold"
                        : "neutral"
                    }
                  >
                    {movie.subscription_type}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-ink-900 p-3 text-center">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-paper-500">
                      Views
                    </dt>
                    <dd className="font-mono text-sm text-paper-100">
                      {movie.view_count}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-paper-500">
                      Reviews
                    </dt>
                    <dd className="font-mono text-sm text-paper-100">
                      {movie.review_count}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-paper-500">
                      Added
                    </dt>
                    <dd className="text-sm text-paper-100">
                      {formatDate(movie.created_at)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to={`/admin/movies/${movie.id}/edit`}
                    state={{ slug: movie.slug }}
                    className={buttonClass({ variant: "secondary" })}
                  >
                    <Pencil className="size-4" aria-hidden />
                    Edit
                  </Link>
                  <Button
                    variant="dangerOutline"
                    onClick={() => setToDelete(movie)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-card border border-ink-700 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-700 bg-ink-800 text-xs uppercase tracking-wide text-paper-500">
                <tr>
                  <SortableTh
                    field="title"
                    label="Title"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableTh
                    field="release_year"
                    label="Year"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 font-medium">Access</th>
                  <SortableTh
                    field="view_count"
                    label="Views"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableTh
                    field="review_count"
                    label="Reviews"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableTh
                    field="created_at"
                    label="Added"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 font-medium">By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {data.movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-ink-800/50">
                    <td className="px-4 py-3 font-medium text-paper-100">
                      {movie.title}
                    </td>
                    <td className="px-4 py-3 text-paper-300">
                      {movie.release_year}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          movie.subscription_type === SubscriptionType.PREMIUM
                            ? "gold"
                            : "neutral"
                        }
                      >
                        {movie.subscription_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-paper-300">
                      {movie.view_count}
                    </td>
                    <td className="px-4 py-3 font-mono text-paper-300">
                      {movie.review_count}
                    </td>
                    <td className="px-4 py-3 text-paper-500">
                      {formatDate(movie.created_at)}
                    </td>
                    <td className="px-4 py-3 text-paper-500">
                      {movie.created_by ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconLink
                          to={`/admin/movies/${movie.id}/edit`}
                          state={{ slug: movie.slug }}
                          icon={Pencil}
                          tone="edit"
                          label={`Edit ${movie.title}`}
                        />
                        <IconButton
                          icon={Trash2}
                          tone="danger"
                          label={`Delete ${movie.title}`}
                          onClick={() => setToDelete(movie)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && (
        <div className="mt-6">
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={setPage}
          />
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

function SortableTh({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  field: AdminMovieSortField;
  label: string;
  sortBy: AdminMovieSortField;
  sortOrder: SortOrder;
  onSort: (field: AdminMovieSortField) => void;
}) {
  const active = sortBy === field;
  const Icon = !active
    ? ArrowUpDown
    : sortOrder === "ASC"
      ? ArrowUp
      : ArrowDown;
  return (
    <th
      className="px-4 py-3 font-medium"
      aria-sort={
        active ? (sortOrder === "ASC" ? "ascending" : "descending") : "none"
      }
    >
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-paper-100 ${active ? "text-gold-400" : ""}`}
      >
        {label}
        <Icon className="size-3" aria-hidden />
      </button>
    </th>
  );
}
