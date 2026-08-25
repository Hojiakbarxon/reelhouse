import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RouteErrorBoundary() {
  const error = useRouteError();

  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const message =
    isRouteErrorResponse(error) ? error.statusText
    : error instanceof Error ? error.message
    : 'An unexpected error occurred.';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertOctagon className="size-12 text-crimson-400" aria-hidden />
      <h1 className="font-display text-3xl tracking-wide text-paper-100">
        {status ? `Error ${status}` : 'Something broke'}
      </h1>
      <p className="text-sm text-paper-500">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden />
          Reload
        </Button>
        <Link to="/">
          <Button variant="primary">Back to browsing</Button>
        </Link>
      </div>
    </div>
  );
}


