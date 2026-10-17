import { Link } from "react-router-dom";
import { RoundAvatar } from "@/components/ui/RoundAvatar";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { MovieCastMember } from "@/api/types";

export function CastStrip({ actors }: { actors: MovieCastMember[] }) {
  if (actors.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl tracking-wide text-paper-100">
        Cast
      </h2>
      <div className="mt-4 flex gap-5 overflow-x-auto pb-3">
        {actors.map((cast, index) => {
          const inner = (
            <>
              <RoundAvatar
                src={tmdbImageUrl(cast.actor.profilePath)}
                alt={cast.actor.name}
                size="lg"
              />
              <p className="mt-2 w-full truncate text-sm font-medium text-paper-100">
                {cast.actor.name}
              </p>
              <p className="w-full truncate text-xs text-paper-500">
                {cast.characterName}
              </p>
            </>
          );
          return cast.actor.id ? (
            <Link
              key={`${cast.actor.id}-${index}`}
              to={`/actors/${cast.actor.id}`}
              className="flex w-32 shrink-0 flex-col items-center text-center transition-opacity hover:opacity-80"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={`${cast.actor.name}-${index}`}
              className="flex w-32 shrink-0 flex-col items-center text-center"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
