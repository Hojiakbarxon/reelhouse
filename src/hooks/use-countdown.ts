import { useEffect, useRef, useState } from 'react';

// Ticks a countdown down to 0 in whole seconds. `restart()` resets it back
// to the initial `seconds` and starts ticking again — handy for "resend
// code" flows where the timer needs to restart after each send.
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restart(next: number = seconds) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(next);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return { remaining, formatted, isExpired: remaining <= 0, restart };
}
