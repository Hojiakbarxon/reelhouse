import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';
import { useAuthStore } from '@/store/auth-store';
import { CheckoutModal } from '@/components/movies/CheckoutModal';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatPrice } from '@/lib/format';
import type { SubscriptionPlan } from '@/api/types';

export function PlansPage() {
  const isAuthed = useAuthStore((s) => s.isTokenValid());
  const navigate = useNavigate();
  const { data: plans, isLoading, isError, refetch } = useSubscriptionPlans();
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);

  function handleSubscribe(plan: SubscriptionPlan) {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    setCheckoutPlan(plan);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl tracking-wide text-paper-100">Choose your plan</h1>
        <p className="mt-3 text-paper-500">
          Unlock premium titles and higher-quality streams. Demo checkout — no real charges.
        </p>
      </div>

      {!isAuthed && (
        <p className="mt-6 text-center text-sm text-paper-500">
          <button onClick={() => navigate('/login')} className="font-medium text-gold-400 hover:text-gold-300">
            Sign in
          </button>{' '}
          to view and subscribe to plans.
        </p>
      )}

      {isAuthed && (
        <div className="mt-12">
          {isLoading ? (
            <Spinner label="Loading plans" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !plans || plans.length === 0 ? (
            <EmptyState title="No plans available" description="Check back soon." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-card border border-ink-700 bg-ink-800 p-6"
                >
                  <h3 className="font-display text-2xl tracking-wide text-paper-100">{plan.name}</h3>
                  <p className="mt-2">
                    <span className="font-display text-3xl text-gold-400">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-paper-500"> / {plan.duration_days} days</span>
                  </p>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-4 flex flex-1 flex-col gap-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-paper-300">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button className="mt-6 w-full" onClick={() => handleSubscribe(plan)}>
                    Subscribe
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CheckoutModal
        plan={checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        onSuccess={() => {
          setCheckoutPlan(null);
          navigate('/account');
        }}
      />
    </div>
  );
}
