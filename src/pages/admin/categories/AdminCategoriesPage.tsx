import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormValues } from '../schemas';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-admin-categories';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import type { Category } from '@/api/types';

export function AdminCategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  function openCreate() {
    reset({ name: '', description: '' });
    setEditing('new');
  }

  function openEdit(category: Category) {
    reset({ name: category.name, description: category.description ?? '' });
    setEditing(category);
  }

  function onSubmit(values: CategoryFormValues) {
    const payload = { name: values.name, description: values.description || undefined };
    if (editing === 'new') {
      createCategory.mutate(payload, { onSuccess: () => setEditing(null) });
    } else if (editing) {
      updateCategory.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteCategory.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wide text-paper-100">Categories</h2>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          New category
        </Button>
      </div>

      {isLoading ? (
        <Spinner label="Loading categories" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !categories || categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create one to start tagging movies." />
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-card border border-ink-700 bg-ink-800 px-4 py-3"
            >
              <div>
                <p className="font-medium text-paper-100">{category.name}</p>
                {category.description && <p className="text-sm text-paper-500">{category.description}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(category)}
                  className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-gold-400"
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setToDelete(category)}
                  className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-crimson-400"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New category' : 'Edit category'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" rows={3} error={errors.description?.message} {...register('description')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createCategory.isPending || updateCategory.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category"
        description={`Delete "${toDelete?.name}"? Movies tagged with it will lose this category.`}
        isLoading={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
