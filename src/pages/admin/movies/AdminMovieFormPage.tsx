import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { movieSchema, type MovieFormValues } from "@/pages/admin/schemas";
import { SubscriptionType } from "@/api/types";
import { useAdminCategories } from "@/hooks/use-admin-categories";
import { useMovieDetail } from "@/hooks/use-movie-detail";
import { useCreateMovie, useUpdateMovie } from "@/hooks/use-admin-movies";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner, EmptyState, ErrorState } from "@/components/ui/Feedback";
import { PosterPicker } from "@/components/admin/PosterPicker";
import { CategoryCheckboxList } from "@/components/admin/CategoryCheckboxList";
import { MovieFilesManager } from "@/components/admin/MovieFilesManager";
import { MovieCastManager } from "@/components/admin/MovieCastManager";
import { useDocumentMeta } from "@/hooks/use-document-meta";

// A blank number input yields "" — turn it into undefined so zod's optional()
// applies instead of failing on NaN.
const optionalNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

export function AdminMovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  // The list page passes the slug along because the backend only exposes
  // movie details by slug (GET /movies/:slug), not by id.
  const slug = (location.state as { slug?: string } | null)?.slug;

  useDocumentMeta({
    title: isEdit ? "Edit movie" : "New movie",
    noindex: true,
  });

  const { data: categories = [], isLoading: loadingCategories } = useAdminCategories();
  const {
    data: movie,
    isLoading: loadingMovie,
    isError: movieError,
    refetch,
  } = useMovieDetail(isEdit ? slug : undefined);

  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const [poster, setPoster] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      description: "",
      release_year: new Date().getFullYear(),
      duration_minutes: 90,
      subscription_type: SubscriptionType.FREE,
      rating: undefined,
      category_ids: [],
    },
  });

  // Edit mode: GET /movies/:slug returns category *names*, but the update
  // endpoint wants category *ids* — map them through the categories list.
  const movieCategoryIds = useMemo(() => {
    if (!movie) return [];
    return categories.filter((c) => movie.categories.includes(c.name)).map((c) => c.id);
  }, [movie, categories]);

  useEffect(() => {
    if (!movie || loadingCategories) return;
    reset({
      title: movie.title,
      description: movie.description ?? "",
      release_year: movie.release_year,
      duration_minutes: movie.duration_minutes,
      subscription_type: movie.subscription_type,
      rating: movie.rating === null ? undefined : Number(movie.rating),
      category_ids: movieCategoryIds,
    });
  }, [movie, loadingCategories, movieCategoryIds, reset]);

  const selectedCategories = useWatch({ control, name: "category_ids" }) ?? [];

  function toggleCategory(categoryId: string) {
    const next = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];
    setValue("category_ids", next, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: MovieFormValues) {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      release_year: values.release_year,
      duration_minutes: values.duration_minutes,
      subscription_type: values.subscription_type,
      rating: values.rating,
      category_ids: values.category_ids,
      poster: poster ?? undefined,
    };

    if (isEdit && id) {
      updateMovie.mutate(
        { id, payload },
        {
          onSuccess: (res) => {
            // A renamed title changes the slug — keep the page pointed at the new one.
            const newSlug = res.data?.data?.slug ?? slug;
            setPoster(null);
            navigate(location.pathname, { replace: true, state: { slug: newSlug } });
          },
        },
      );
    } else {
      createMovie.mutate(payload, {
        onSuccess: (res) => {
          const created = res.data?.data as { id?: string; slug?: string } | undefined;
          // Land on the edit page so the admin can attach video files and cast next.
          if (created?.id) {
            navigate(`/admin/movies/${created.id}/edit`, {
              replace: true,
              state: { slug: created.slug },
            });
          } else {
            navigate("/admin/movies");
          }
        },
      });
    }
  }

  const isSaving = createMovie.isPending || updateMovie.isPending;

  if (isEdit && !slug) {
    return (
      <EmptyState
        title="Open this movie from the list"
        description="The movie's details are looked up by slug, which is passed along when you click Edit in the movies table."
        action={
          <Link to="/admin/movies">
            <Button variant="secondary">Back to movies</Button>
          </Link>
        }
      />
    );
  }
  if (isEdit && (loadingMovie || loadingCategories)) return <Spinner label="Loading movie" />;
  if (isEdit && (movieError || !movie)) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <Link
        to="/admin/movies"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-paper-500 hover:text-paper-100"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All movies
      </Link>
      <h2 className="mb-6 font-display text-2xl tracking-wide text-paper-100">
        {isEdit ? `Edit “${movie?.title}”` : "New movie"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-2xl flex-col gap-5">
        <PosterPicker currentUrl={movie?.poster_url} onSelect={setPoster} />

        <Input label="Title" {...register("title")} error={errors.title?.message} />
        <Textarea
          label="Description"
          rows={4}
          {...register("description")}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Release year"
            type="number"
            {...register("release_year", { valueAsNumber: true })}
            error={errors.release_year?.message}
          />
          <Input
            label="Duration (min)"
            type="number"
            {...register("duration_minutes", { valueAsNumber: true })}
            error={errors.duration_minutes?.message}
          />
          <Input
            label="Rating (0–10)"
            type="number"
            step="0.1"
            {...register("rating", { setValueAs: optionalNumber })}
            error={errors.rating?.message}
          />
        </div>

        <Select
          label="Access"
          {...register("subscription_type")}
          error={errors.subscription_type?.message}
        >
          <option value={SubscriptionType.FREE}>Free</option>
          <option value={SubscriptionType.PREMIUM}>Premium</option>
        </Select>

        <CategoryCheckboxList
          categories={categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
          error={errors.category_ids?.message}
        />

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSaving}>
            {isEdit ? "Save changes" : "Create movie"}
          </Button>
          <Link to="/admin/movies">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {isEdit && movie && (
        <div className="mt-12 flex max-w-2xl flex-col gap-10 border-t border-ink-700 pt-8">
          <MovieFilesManager
            movieId={movie.id}
            slug={movie.slug}
            files={Array.isArray(movie.files) ? movie.files : []}
          />
          <MovieCastManager
            movieId={movie.id}
            slug={movie.slug}
            title={movie.title}
            tmdbId={movie.tmdbId ?? null}
            currentCast={movie.actors}
          />
        </div>
      )}
    </div>
  );
}
