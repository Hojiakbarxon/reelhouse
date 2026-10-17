import { AlertTriangle, ShieldAlert, TimerReset, KeyRound } from 'lucide-react';
import { clsx } from 'clsx';
import type { ClassifiedError } from '@/lib/errors';

const presentation: Record<
  ClassifiedError['kind'],
  { icon: typeof AlertTriangle; title: string; tone: string }
> = {
  'invalid-credentials': {
    icon: ShieldAlert,
    title: 'Incorrect email or password',
    tone: 'border-crimson-500/40 bg-crimson-500/10 text-crimson-400',
  },
  otp: {
    icon: KeyRound,
    title: 'Verification code issue',
    tone: 'border-crimson-500/40 bg-crimson-500/10 text-crimson-400',
  },
  throttle: {
    icon: TimerReset,
    title: 'Slow down a little',
    tone: 'border-gold-500/40 bg-gold-400/10 text-gold-300',
  },
  conflict: {
    icon: AlertTriangle,
    title: 'That already exists',
    tone: 'border-gold-500/40 bg-gold-400/10 text-gold-300',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    tone: 'border-crimson-500/40 bg-crimson-500/10 text-crimson-400',
  },
};

export function AuthAlert({ error }: { error: ClassifiedError }) {
  const { icon: Icon, title, tone } = presentation[error.kind];

  return (
    <div role="alert" className={clsx('flex items-start gap-2.5 rounded-md border px-3 py-2.5', tone)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-paper-300">{error.message}</p>
      </div>
    </div>
  );
}
