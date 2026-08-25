import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { movieSchema, type MovieFormValues } from '../schemas';
import { useAdminMovies, useCreateMovie, useUpdateMovie } from '@/hooks/use-admin-movies';
import { useAdminCategories } from '@/hooks/use-admin-categories';
import { useMovieDetail } from '@/hooks/use-movie-detail';
import { PosterPicker } from '@/components/admin/PosterPicker';
import { CategoryCheckboxList } from '@/components/admin/CategoryCheckboxList';
import { MovieFilesManager } from '@/components/admin/MovieFilesManager';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner, ErrorState } from '@/components/ui/Feedback';
import { SubscriptionType } from '@/api/types';

export function AdminMovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { data: adminMovies, isLoading: isLoadingAdminList, isError: isErrorAdminList, refetch: refetchAdminList } = useAdminMovies();
  const listItem = useMemo(() => adminMovies?.movies.find((m) => m.id === id), [adminMovies, id]);
  const { data: movie, isLoading: isLoadingMovie, isError: isErrorMovie, refetch: refetchMovie } = useMovieDetail(listItem?.slug);
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories, refetch: refetchCategories } = useAdminCategories();

  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      description: '',
      release_year: new Date().getFullYear(),
      duration_minutes: 90,
      subscription_type: SubscriptionType.FREE,
      category_ids: [],
    },
  });

  const selectedCategoryIds = watch('category_ids');

  // Prefill the form once the movie + category list have both loaded. The
  // detail endpoint returns category NAMES, not ids, so map them back to ids
  // against the full category list to drive the checkbox selection.
  useEffect(() => {
    if (!isEditing || !movie || !categories) return;
    const categoryIds = categories.filter((c) => movie.categories.includes(c.name)).map((c) => c.id);
    reset({
      title: movie.title,
      description: movie.description ?? '',
      release_year: movie.release_year,
      duration_minutes: movie.duration_minutes,
      subscription_type: movie.subscription_type,
      rating: Number(movie.rating) || undefined,
      category_ids: categoryIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, movie, categories]);

  function toggleCategory(categoryId: string) {
    const current = selectedCategoryIds ?? [];
    setValue(
      'category_ids',
      current.includes(categoryId) ? current.filter((c) => c !== categoryId) : [...current, categoryId],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: MovieFormValues) {
    const payload = {
      ...values,
      description: values.description || undefined,
      poster: posterFile ?? undefined,
    };

    if (isEditing && listItem) {
      updateMovie.mutate(
        { id: listItem.id, payload },
        { onSuccess: () => navigate('/admin/movies') },
      );
    } else {
      createMovie.mutate(payload, {
        onSuccess: () => navigate('/admin/movies'),
      });
    }
  }

  if (isEditing && (isLoadingAdminList || isLoadingCategories || (listItem && isLoadingMovie))) {
    return <Spinner label="Loading movie" />;
  }

  if (isEditing && (isErrorAdminList || isErrorCategories)) {
    return (
      <ErrorState
        onRetry={() => {
          refetchAdminList();
          refetchCategories();
        }}
      />
    );
  }

  if (isEditing && !isLoadingAdminList && !listItem) {
    return <ErrorState title="Movie not found" description="It may have been deleted." />;
  }

  if (isEditing && isErrorMovie) {
    return <ErrorState onRetry={() => refetchMovie()} />;
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-paper-100">
        {isEditing ? `Edit "${movie?.title ?? listItem?.title}"` : 'New movie'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex max-w-2xl flex-col gap-5">
        <PosterPicker currentUrl={movie?.poster_url} onSelect={setPosterFile} />

        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Description" rows={4} error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Release year"
            type="number"
            error={errors.release_year?.message}
            {...register('release_year', { valueAsNumber: true })}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            error={errors.duration_minutes?.message}
            {...register('duration_minutes', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Access tier" {...register('subscription_type')}>
            <option value={SubscriptionType.FREE}>Free</option>
            <option value={SubscriptionType.PREMIUM}>Premium</option>
          </Select>
          <Input
            label="Base rating (0–10, optional)"
            type="number"
            step="0.1"
            min={0}
            max={10}
            error={errors.rating?.message}
            {...register('rating', { valueAsNumber: true })}
          />
        </div>

        <CategoryCheckboxList
          categories={categories ?? []}
          selected={selectedCategoryIds ?? []}
          onToggle={toggleCategory}
          error={errors.category_ids?.message}
        />

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting || createMovie.isPending || updateMovie.isPending}>
            {isEditing ? 'Save changes' : 'Create movie'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/movies')}>
            Cancel
          </Button>
        </div>
      </form>

      {isEditing && listItem && movie && Array.isArray(movie.files) && (
        <div className="mt-10 max-w-2xl border-t border-ink-700 pt-8">
          <MovieFilesManager movieId={listItem.id} slug={listItem.slug} files={movie.files} />
        </div>
      )}
    </div>
  );
}


