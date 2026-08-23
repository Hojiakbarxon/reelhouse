import { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useMySubscriptions, useUpdateSubscription } from '@/hooks/use-user-subscriptions';
import { useRefund, usePaymentDetail } from '@/hooks/use-payments';
import { usePaymentsMap } from '@/store/payments-map';
import { Badge } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatPrice, formatDate } from '@/lib/format';
import { extractErrorMessage } from '@/api/client';
import { SubscriptionStatus } from '@/api/types';

const statusTone: Record<SubscriptionStatus, 'neutral' | 'gold' | 'crimson' | 'emerald'> = {
  [SubscriptionStatus.ACTIVE]: 'emerald',
  [SubscriptionStatus.PENDING_PAYMENT]: 'gold',
  [SubscriptionStatus.EXPIRED]: 'neutral',
  [SubscriptionStatus.CANCELED]: 'crimson',
};

export function MySubscriptions() {
  const { data: subscriptions, isLoading, isError, refetch } = useMySubscriptions();
  const refund = useRefund();
  const updateSubscription = useUpdateSubscription();
  const paymentsBySub = usePaymentsMap((s) => s.bySubscriptionId);
  const [viewingPaymentFor, setViewingPaymentFor] = useState<string | null>(null);

  if (isLoading) return <Spinner label="Loading subscriptions" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (!subscriptions || subscriptions.length === 0) {
    return <EmptyState title="No subscriptions yet" description="Subscribe to a plan to unlock premium titles." />;
  }

  function handleRefund(subscriptionId: string) {
    const paymentId = paymentsBySub[subscriptionId];
    if (!paymentId) {
      toast.error("This subscription's payment wasn't made in this browser, so it can't be refunded from here.");
      return;
    }
    refund.mutate(paymentId, {
      onError: (error) => toast.error(extractErrorMessage(error)),
    });
  }

  function handleToggleAutoRenew(subscriptionId: string, next: boolean) {
    updateSubscription.mutate({ id: subscriptionId, payload: { auto_renew: next } });
  }

  function handleCancel(subscriptionId: string) {
    updateSubscription.mutate(
      { id: subscriptionId, payload: { status: SubscriptionStatus.CANCELED } },
      { onSuccess: () => toast.success('Subscription canceled') },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((sub) => {
        const hasKnownPayment = !!paymentsBySub[sub.id];
        const isCancelable = sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.PENDING_PAYMENT;

        return (
          <div key={sub.id} className="flex flex-col gap-3 rounded-card border border-ink-700 bg-ink-800 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-paper-100">{sub.plan.name}</p>
                  <Badge tone={statusTone[sub.status]}>{sub.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-1 text-sm text-paper-500">
                  {formatPrice(sub.plan.price)} ·{' '}
                  {sub.start_date ? `${formatDate(sub.start_date)} – ${formatDate(sub.end_date)}` : 'Not yet active'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {hasKnownPayment && (
                  <Button variant="ghost" size="sm" onClick={() => setViewingPaymentFor(sub.id)}>
                    View payment
                  </Button>
                )}
                {sub.status === SubscriptionStatus.ACTIVE && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRefund(sub.id)}
                    isLoading={refund.isPending}
                  >
                    Request refund
                  </Button>
                )}
                {isCancelable && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancel(sub.id)}
                    isLoading={updateSubscription.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <label className="flex w-fit items-center gap-2 text-sm text-paper-300">
              <input
                type="checkbox"
                checked={sub.auto_renew}
                disabled={updateSubscription.isPending}
                onChange={(e) => handleToggleAutoRenew(sub.id, e.target.checked)}
              />
              Auto-renew this plan when it expires
            </label>
          </div>
        );
      })}

      <PaymentDetailModal
        paymentId={viewingPaymentFor ? paymentsBySub[viewingPaymentFor] ?? null : null}
        onClose={() => setViewingPaymentFor(null)}
      />
    </div>
  );
}

function PaymentDetailModal({ paymentId, onClose }: { paymentId: string | null; onClose: () => void }) {
  const { data: payment, isLoading, isError } = usePaymentDetail(paymentId);

  return (
    <Modal open={!!paymentId} onClose={onClose} title="Payment details">
      {isLoading ? (
        <Spinner label="Loading payment" />
      ) : isError || !payment ? (
        <p className="text-sm text-crimson-400">Couldn't load this payment.</p>
      ) : (
        <dl className="flex flex-col gap-3 text-sm">
          <Row label="Amount" value={formatPrice(payment.amount)} />
          <Row label="Method" value={payment.payment_method.replace('_', ' ')} />
          <Row label="Status" value={payment.status} />
          <Row label="Transaction ID" value={payment.external_transaction_id ?? '—'} mono />
          <Row label="Date" value={formatDate(payment.created_at)} />
          {payment.payment_details && Object.keys(payment.payment_details).length > 0 && (
            <div>
              <dt className="mb-1 text-paper-500">Submitted details</dt>
              <dd className="flex flex-col gap-1 rounded-md bg-ink-900 p-3 font-mono text-xs text-paper-300">
                {Object.entries(payment.payment_details).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-paper-500">{key}</span>
                    <span className="truncate">{String(value)}</span>
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          <X className="size-4" aria-hidden />
          Close
        </Button>
      </div>
    </Modal>
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
