import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Cake, Skull } from "lucide-react";
import { useActorDetail } from "@/hooks/use-actor-detail";
import { RoundAvatar } from "@/components/ui/RoundAvatar";
import { Spinner, ErrorState } from "@/components/ui/Feedback";
import { tmdbImageUrl } from "@/lib/tmdb";
import { formatDate } from "@/lib/format";

export function ActorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: actor, isLoading, isError, refetch } = useActorDetail(id);

  if (isLoading) return <Spinner label="Loading actor" />;
  if (isError || !actor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState
          title="Actor not found"
          description="This actor may have been removed, or the link is broken."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-paper-500 hover:text-paper-100"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
        <RoundAvatar
          src={tmdbImageUrl(actor.profilePath, "h632")}
          alt={actor.name}
          size="xl"
          className="mx-auto sm:mx-0"
        />

        <div>
          <h1 className="font-display text-3xl tracking-wide text-paper-100 text-balance">
            {actor.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-paper-500">
            {actor.birthday && (
              <span className="inline-flex items-center gap-1.5">
                <Cake className="size-4" aria-hidden />
                {formatDate(actor.birthday)}
              </span>
            )}
            {actor.deathday && (
              <span className="inline-flex items-center gap-1.5">
                <Skull className="size-4" aria-hidden />
                {formatDate(actor.deathday)}
              </span>
            )}
            {actor.placeOfBirth && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {actor.placeOfBirth}
              </span>
            )}
          </div>

          {actor.biography && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-paper-300">
              {actor.biography}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
