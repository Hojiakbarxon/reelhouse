import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { usePurchasePlan } from '@/hooks/use-user-subscriptions';
import { usePay } from '@/hooks/use-payments';
import { usePaymentsMap } from '@/store/payments-map';
import { extractErrorMessage } from '@/api/client';
import { PaymentMethod, type SubscriptionPlan } from '@/api/types';
import { formatPrice } from '@/lib/format';

// What we ask for, and what lands in payment_details, depends on the method —
// the backend just stores whatever object it's given (no schema on its side).
// This is a demo checkout with no real payment gateway, so every field here
// is optional window-dressing — nothing is required to complete "payment".

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
  
  const [autoRenew, setAutoRenew] = useState(true);

  const purchase = usePurchasePlan();
  const pay = usePay();
  const record = usePaymentsMap((s) => s.record);

  useEffect(() => {
    setMethod(PaymentMethod.CARD);
    setAutoRenew(true);
  }, [plan?.id]);

  const isProcessing = purchase.isPending || pay.isPending;
  

  function handleMethodChange(next: PaymentMethod) {
    setMethod(next);
  }

  async function handleConfirm() {
    if (!plan) return;

    // Demo checkout — no real payment gateway is connected, so nothing here
    // is ever required before "paying".
    try {
      const purchaseRes = await purchase.mutateAsync({ planId: plan.id, autoRenew });
      const subscriptionId = purchaseRes.data.data.id;

      const payRes = await pay.mutateAsync({
        userSubscriptionId: subscriptionId,
        paymentMethod: method
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
          <div className="flex items-start gap-2 rounded-md border border-gold-500/30 bg-gold-400/10 px-3 py-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
            <p className="text-sm text-paper-300">
              <span className="font-semibold text-gold-300">Demo checkout</span> — no real payment
              gateway is connected, nothing is charged, and none of the fields below are required.
              You'll be billed {formatPrice(plan.price)} for {plan.duration_days} days.
            </p>
          </div>

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


