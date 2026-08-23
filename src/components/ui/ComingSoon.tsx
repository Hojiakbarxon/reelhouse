import { Clapperboard } from 'lucide-react';

export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <Clapperboard className="size-10 text-gold-400" aria-hidden />
      <h1 className="font-display text-3xl tracking-wide text-paper-100">{title}</h1>
      <p className="text-sm text-paper-500">
        This screen ships in <span className="text-gold-400">{phase}</span>. The route, layout, and
        guards are already wired — the real screen drops in next.
      </p>
    </div>
  );
}
