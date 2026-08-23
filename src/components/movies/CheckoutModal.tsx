import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePurchasePlan } from '@/hooks/use-user-subscriptions';
import { usePay } from '@/hooks/use-payments';
import { usePaymentsMap } from '@/store/payments-map';
import { extractErrorMessage } from '@/api/client';
import { PaymentMethod, type SubscriptionPlan } from '@/api/types';
import { formatPrice } from '@/lib/format';

// What we ask for, and what lands in payment_details, depends on the method —
// the backend just stores whatever object it's given (no schema on its side),
// so this is purely for a realistic-feeling demo checkout.
function buildDetailsFields(method: PaymentMethod) {
  switch (method) {
    case PaymentMethod.CARD:
      return [
        { key: 'card_number', label: 'Card number', placeholder: '4242 4242 4242 4242' },
        { key: 'expiry', label: 'Expiry (MM/YY)', placeholder: '12/28' },
      ];
    case PaymentMethod.PAYPAL:
      return [{ key: 'paypal_email', label: 'PayPal email', placeholder: 'you@example.com' }];
    case PaymentMethod.BANK_TRANSFER:
      return [
        { key: 'account_number', label: 'Account number', placeholder: '000123456789' },
        { key: 'bank_name', label: 'Bank name', placeholder: 'e.g. Kapitalbank' },
      ];
    case PaymentMethod.CRYPTO:
      return [{ key: 'wallet_address', label: 'Wallet address', placeholder: '0x…' }];
  }
}

export function CheckoutModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [autoRenew, setAutoRenew] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const purchase = usePurchasePlan();
  const pay = usePay();
  const record = usePaymentsMap((s) => s.record);

  useEffect(() => {
    setMethod(PaymentMethod.CARD);
    setDetails({});
    setAutoRenew(true);
    setError(null);
  }, [plan?.id]);

  const isProcessing = purchase.isPending || pay.isPending;
  const fields = buildDetailsFields(method);

  function handleMethodChange(next: PaymentMethod) {
    setMethod(next);
    setDetails({});
    setError(null);
  }

  async function handleConfirm() {
    if (!plan) return;

    const missing = fields.find((f) => !details[f.key]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setError(null);

    try {
      const purchaseRes = await purchase.mutateAsync({ planId: plan.id, autoRenew });
      const subscriptionId = purchaseRes.data.data.id;

      const payRes = await pay.mutateAsync({
        userSubscriptionId: subscriptionId,
        paymentMethod: method,
        paymentDetails: details,
      });
      record(subscriptionId, payRes.data.data.id);

      toast.success(`Subscribed to ${plan.name}!`);
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <Modal open={!!plan} onClose={onClose} title={plan ? `Subscribe to ${plan.name}` : ''}>
      {plan && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-paper-500">
            This is a demo checkout — no real payment gateway is connected, the backend simulates a
            successful charge. You'll be billed {formatPrice(plan.price)} for {plan.duration_days} days.
          </p>

          <Select
            label="Payment method"
            value={method}
            onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
          >
            <option value={PaymentMethod.CARD}>Card</option>
            <option value={PaymentMethod.PAYPAL}>PayPal</option>
            <option value={PaymentMethod.BANK_TRANSFER}>Bank transfer</option>
            <option value={PaymentMethod.CRYPTO}>Crypto</option>
          </Select>

          {fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={details[field.key] ?? ''}
              onChange={(e) => setDetails((d) => ({ ...d, [field.key]: e.target.value }))}
            />
          ))}
          {error && <p className="text-sm text-crimson-400">{error}</p>}

          <label className="flex items-center gap-2 text-sm text-paper-300">
            <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
            Auto-renew when this plan expires
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} isLoading={isProcessing}>
              Pay {formatPrice(plan.price)}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
