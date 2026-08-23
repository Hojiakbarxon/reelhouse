import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Film className="size-12 text-ink-500" aria-hidden />
      <h1 className="font-display text-5xl tracking-wide text-paper-100">404</h1>
      <p className="text-paper-500">This reel isn't in our catalog. It may have been pulled or never existed.</p>
      <Link to="/">
        <Button variant="primary">Back to browsing</Button>
      </Link>
    </div>
  );
}
