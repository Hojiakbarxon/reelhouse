import { useState } from 'react';
import {
  useAdminSubscriptions,
  useAdminUpdateSubscription,
  useAdminDeleteSubscription,
} from '@/hooks/use-admin-subscriptions';
import { Badge, Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/format';
import { SubscriptionStatus, type UserSubscription } from '@/api/types';

const statusTone: Record<SubscriptionStatus, 'neutral' | 'gold' | 'crimson' | 'emerald'> = {
  [SubscriptionStatus.ACTIVE]: 'emerald',
  [SubscriptionStatus.PENDING_PAYMENT]: 'gold',
  [SubscriptionStatus.EXPIRED]: 'neutral',
  [SubscriptionStatus.CANCELED]: 'crimson',
};

export function AdminSubscriptionsPage() {
  const { data: subs, isLoading, isError, refetch } = useAdminSubscriptions();
  const updateSub = useAdminUpdateSubscription();
  const deleteSub = useAdminDeleteSubscription();

  const [editing, setEditing] = useState<UserSubscription | null>(null);
  const [toDelete, setToDelete] = useState<UserSubscription | null>(null);
  const [draftStatus, setDraftStatus] = useState<SubscriptionStatus>(SubscriptionStatus.ACTIVE);
  const [draftAutoRenew, setDraftAutoRenew] = useState(false);

  function openEdit(sub: UserSubscription) {
    setDraftStatus(sub.status);
    setDraftAutoRenew(sub.auto_renew);
    setEditing(sub);
  }

  function handleSave() {
    if (!editing) return;
    updateSub.mutate(
      { id: editing.id, payload: { status: draftStatus, auto_renew: draftAutoRenew } },
      { onSuccess: () => setEditing(null) },
    );
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    deleteSub.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-wide text-paper-100">Subscriptions</h2>
        <p className="text-sm text-paper-500">Every subscriber, across every plan.</p>
      </div>

      {isLoading ? (
        <Spinner label="Loading subscriptions" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !subs || subs.length === 0 ? (
        <EmptyState title="No subscriptions yet" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-700 bg-ink-800 text-xs uppercase tracking-wide text-paper-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Auto-renew</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {subs.map((sub) => (
                <tr key={sub.id} className="hover:bg-ink-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-paper-100">{sub.user?.username ?? '—'}</p>
                    <p className="text-xs text-paper-500">{sub.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-paper-300">
                    {sub.plan.name} · {formatPrice(sub.plan.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[sub.status]}>{sub.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-paper-300">{sub.auto_renew ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-paper-500">
                    {sub.start_date ? `${formatDate(sub.start_date)} – ${formatDate(sub.end_date)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(sub)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setToDelete(sub)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit subscription">
        <div className="flex flex-col gap-4">
          <Select
            label="Status"
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value as SubscriptionStatus)}
          >
            {Object.values(SubscriptionStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-paper-300">
            <input type="checkbox" checked={draftAutoRenew} onChange={(e) => setDraftAutoRenew(e.target.checked)} />
            Auto-renew
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={updateSub.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete subscription"
        description={`Permanently delete this subscription for ${toDelete?.user?.username ?? 'this user'}? This can't be undone.`}
        isLoading={deleteSub.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
