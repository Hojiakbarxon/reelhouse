import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { planSchema, type PlanFormValues } from '../schemas';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/hooks/use-admin-plans';
import { useAuthStore } from '@/store/auth-store';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge, Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatPrice } from '@/lib/format';
import { UserRole, type SubscriptionPlan } from '@/api/types';

export function AdminPlansPage() {
  const isSuperAdmin = useAuthStore((s) => s.role) === UserRole.SUPERADMIN;
  const { data: plans, isLoading, isError, refetch } = useAdminPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [editing, setEditing] = useState<SubscriptionPlan | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<SubscriptionPlan | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({ resolver: zodResolver(planSchema) });

  function openCreate() {
    reset({ name: '', price: 0, duration_days: 30, featuresText: '', is_active: true });
    setEditing('new');
  }

  function openEdit(plan: SubscriptionPlan) {
    reset({
      name: plan.name,
      price: Number(plan.price) || 0,
      duration_days: plan.duration_days,
      featuresText: (plan.features ?? []).join('\n'),
      is_active: plan.is_active,
    });
    setEditing(plan);
  }

  function onSubmit(values: PlanFormValues) {
    const payload = {
      name: values.name,
      price: values.price,
      duration_days: values.duration_days,
      is_active: values.is_active,
      features: (values.featuresText ?? '')
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    if (editing === 'new') {
      createPlan.mutate(payload, { onSuccess: () => setEditing(null) });
    } else if (editing) {
      updatePlan.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    }
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deletePlan.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-paper-100">Subscription plans</h2>
          <p className="text-sm text-paper-500">Shown to users on the Plans page.</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            New plan
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <p className="mb-4 text-xs text-paper-500">
          Only superadmins can create, edit, or delete plans. You can still view them here.
        </p>
      )}

      {isLoading ? (
        <Spinner label="Loading plans" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !plans || plans.length === 0 ? (
        <EmptyState title="No plans yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-card border border-ink-700 bg-ink-800 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-paper-100">{plan.name}</p>
                  <Badge tone={plan.is_active ? 'emerald' : 'neutral'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-paper-500">
                  {formatPrice(plan.price)} / {plan.duration_days} days
                  {plan.features && plan.features.length > 0 && ` · ${plan.features.length} features`}
                </p>
              </div>
              {isSuperAdmin && (
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(plan)}
                    className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-gold-400"
                    aria-label={`Edit ${plan.name}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setToDelete(plan)}
                    className="rounded-md p-1.5 text-paper-500 hover:bg-ink-700 hover:text-crimson-400"
                    aria-label={`Delete ${plan.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New plan' : 'Edit plan'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min={0}
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
            <Input
              label="Duration (days)"
              type="number"
              min={1}
              error={errors.duration_days?.message}
              {...register('duration_days', { valueAsNumber: true })}
            />
          </div>
          <Textarea
            label="Features (one per line)"
            rows={4}
            placeholder={'4K streaming\nDownload for offline\nNo ads'}
            error={errors.featuresText?.message}
            {...register('featuresText')}
          />
          <label className="flex items-center gap-2 text-sm text-paper-300">
            <input type="checkbox" {...register('is_active')} />
            Active (visible to users on the Plans page)
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createPlan.isPending || updatePlan.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete plan"
        description={`Delete "${toDelete?.name}"? Users currently subscribed won't be affected, but no one will be able to subscribe to it again.`}
        isLoading={deletePlan.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}


