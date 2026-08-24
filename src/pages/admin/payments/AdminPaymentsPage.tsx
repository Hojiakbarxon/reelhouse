import { useMemo, useState } from 'react';
import { useAdminPayments, useAdminRefund } from '@/hooks/use-admin-payments';
import { useAdminSubscriptions } from '@/hooks/use-admin-subscriptions';
import { Badge, Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/format';
import { PaymentStatus, type Payment } from '@/api/types';

const statusTone: Record<PaymentStatus, 'neutral' | 'gold' | 'crimson' | 'emerald'> = {
  [PaymentStatus.PENDING]: 'gold',
  [PaymentStatus.COMPLETED]: 'emerald',
  [PaymentStatus.FAILED]: 'crimson',
  [PaymentStatus.REFUNDED]: 'neutral',
};

export function AdminPaymentsPage() {
  const { data: payments, isLoading, isError, refetch } = useAdminPayments();
  // payments.findAll() only loads the user_subscription relation, not its
  // nested user — so cross-reference against the subscriptions list (which
  // does load user) by user_subscription id to show who paid.
  const { data: subs } = useAdminSubscriptions();
  const refund = useAdminRefund();
  const [viewing, setViewing] = useState<Payment | null>(null);

  const userBySubId = useMemo(() => {
    const map = new Map<string, { username: string; email: string }>();
    subs?.forEach((sub) => {
      if (sub.user) map.set(sub.id, { username: sub.user.username, email: sub.user.email });
    });
    return map;
  }, [subs]);

  function subscriptionIdOf(payment: Payment): string {
    return typeof payment.user_subscription === 'string' ? payment.user_subscription : payment.user_subscription.id;
  }

  function handleRefund(paymentId: string) {
    refund.mutate(paymentId, { onSuccess: () => setViewing(null) });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-wide text-paper-100">Payments</h2>
        <p className="text-sm text-paper-500">Every payment, across every subscriber.</p>
      </div>

      {isLoading ? (
        <Spinner label="Loading payments" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !payments || payments.length === 0 ? (
        <EmptyState title="No payments yet" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-700 bg-ink-800 text-xs uppercase tracking-wide text-paper-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {payments.map((payment) => {
                const user = userBySubId.get(subscriptionIdOf(payment));
                return (
                  <tr key={payment.id} className="hover:bg-ink-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-paper-100">{user?.username ?? '—'}</p>
                      {user && <p className="text-xs text-paper-500">{user.email}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-paper-300">{formatPrice(payment.amount)}</td>
                    <td className="px-4 py-3 text-paper-300">{payment.payment_method.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[payment.status]}>{payment.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-paper-500">{formatDate(payment.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setViewing(payment)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Payment details">
        {viewing && (
          <div className="flex flex-col gap-4">
            <dl className="flex flex-col gap-3 text-sm">
              <Row label="Amount" value={formatPrice(viewing.amount)} />
              <Row label="Method" value={viewing.payment_method.replace('_', ' ')} />
              <Row label="Status" value={viewing.status} />
              <Row label="Transaction ID" value={viewing.external_transaction_id ?? '—'} mono />
              <Row label="Date" value={formatDate(viewing.created_at)} />
              {viewing.payment_details && Object.keys(viewing.payment_details).length > 0 && (
                <div>
                  <dt className="mb-1 text-paper-500">Submitted details</dt>
                  <dd className="flex flex-col gap-1 rounded-md bg-ink-900 p-3 font-mono text-xs text-paper-300">
                    {Object.entries(viewing.payment_details).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <span className="text-paper-500">{key}</span>
                        <span className="truncate">{String(value)}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setViewing(null)}>
                Close
              </Button>
              {viewing.status === PaymentStatus.COMPLETED && (
                <Button variant="danger" onClick={() => handleRefund(viewing.id)} isLoading={refund.isPending}>
                  Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-paper-500">{label}</dt>
      <dd className={mono ? 'font-mono text-xs text-paper-100' : 'text-paper-100'}>{value}</dd>
    </div>
  );
}
