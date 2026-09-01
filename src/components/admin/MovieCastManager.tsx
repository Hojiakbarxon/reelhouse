import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { UserPlus, Users, Check, Link2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useTmdbSearch,
  useTmdbCast,
  useConnectTmdb,
  useAddCastMember,
  useAddCastMembersBulk,
} from "@/hooks/use-admin-cast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoundAvatar } from "@/components/ui/RoundAvatar";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { MovieCastMember } from "@/api/types";
import type { TmdbCastMember } from "@/api/movies";

function ConnectTmdbSection({
  movieId,
  slug,
  title,
}: {
  movieId: string;
  slug: string;
  title: string;
}) {
  const [query, setQuery] = useState(title);
  const debouncedQuery = useDebouncedValue(query);
  const { data: results, isFetching } = useTmdbSearch(debouncedQuery);
  const connectTmdb = useConnectTmdb(movieId, slug);

  return (
    <div>
      <p className="text-sm text-paper-500">
        This movie isn't linked to TMDB yet — search for it below to enable cast
        import.
      </p>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search TMDB for this movie"
        className="mt-3"
      />

      {isFetching && <p className="mt-3 text-sm text-paper-500">Searching…</p>}

      {results && results.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => connectTmdb.mutate(r.id)}
                disabled={connectTmdb.isPending}
                className="flex w-full flex-col overflow-hidden rounded-md border border-ink-700 bg-ink-800 text-left transition-colors hover:border-gold-400 disabled:opacity-60"
              >
                <div className="aspect-[2/3] w-full bg-ink-900">
                  {r.poster_path && (
                    <img
                      src={tmdbImageUrl(r.poster_path, "w342") ?? undefined}
                      alt={r.title}
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-paper-100">
                    {r.title}
                  </p>
                  <p className="text-xs text-paper-500">
                    {r.release_date?.slice(0, 4) ?? "—"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {results &&
        results.length === 0 &&
        debouncedQuery.trim().length > 1 &&
        !isFetching && (
          <p className="mt-3 text-sm text-paper-500">No matches on TMDB.</p>
        )}
    </div>
  );
}

function TmdbCastRow({
  member,
  movieId,
  slug,
  alreadyAdded,
  characterName,
  castOrder,
  onChangeCharacterName,
  onChangeCastOrder,
}: {
  member: TmdbCastMember;
  movieId: string;
  slug: string;
  alreadyAdded: boolean;
  characterName: string;
  castOrder: number;
  onChangeCharacterName: (value: string) => void;
  onChangeCastOrder: (value: number) => void;
}) {
  const addCastMember = useAddCastMember(movieId, slug);

  const isAdded = alreadyAdded || addCastMember.isSuccess;
  const isPending = addCastMember.isPending;
  const isLocked = isAdded || isPending;

  return (
    <li
      className={clsx(
        "flex flex-wrap items-center gap-3 rounded-md border border-ink-700 bg-ink-800 p-3",
        isAdded && "opacity-60",
      )}
    >
      <RoundAvatar
        src={tmdbImageUrl(member.profile_path)}
        alt={member.name}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-paper-100">
          {member.name}
        </p>
        <p className="truncate text-xs text-paper-500">TMDB #{member.id}</p>
      </div>
      <Input
        value={characterName}
        onChange={(e) => onChangeCharacterName(e.target.value)}
        placeholder="Character name"
        disabled={isLocked}
        className="w-40"
      />
      <Input
        type="number"
        min={0}
        value={castOrder}
        onChange={(e) => onChangeCastOrder(Number(e.target.value))}
        disabled={isLocked}
        className="w-20"
      />
      <Button
        type="button"
        size="sm"
        variant={isAdded ? "secondary" : "primary"}
        onClick={() =>
          addCastMember.mutate({ tmdbId: member.id, characterName, castOrder })
        }
        isLoading={isPending}
        disabled={isLocked}
        className="w-28 shrink-0 justify-center"
      >
        {!isPending &&
          (isAdded ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <UserPlus className="size-4" aria-hidden />
          ))}
        {isAdded ? "Added" : "Add"}
      </Button>
    </li>
  );
}

export function MovieCastManager({
  movieId,
  slug,
  title,
  tmdbId,
  currentCast,
}: {
  movieId: string;
  slug: string;
  title: string;
  tmdbId: number | null;
  currentCast: MovieCastMember[];
}) {
  const { data: tmdbCast, isLoading: isLoadingCast } = useTmdbCast(
    movieId,
    !!tmdbId,
  );
  const addCastMembersBulk = useAddCastMembersBulk(movieId, slug);

  // Per-row edits keyed by TMDB person id — seeded from TMDB's defaults the
  // first time a row is read, then kept here so "Add all" can read whatever
  // the admin actually typed instead of re-fetching fresh defaults.
  const [edits, setEdits] = useState<
    Record<number, { characterName: string; castOrder: number }>
  >({});

  const addedTmdbIds = useMemo(
    () =>
      new Set(
        currentCast
          .map((c) => c.actor.tmdbId)
          .filter((id): id is number => id != null),
      ),
    [currentCast],
  );

  function getRowValues(member: TmdbCastMember) {
    return (
      edits[member.id] ?? {
        characterName: member.character || "Unknown",
        castOrder: member.order,
      }
    );
  }

  function setRowValue(
    member: TmdbCastMember,
    patch: Partial<{ characterName: string; castOrder: number }>,
  ) {
    setEdits((prev) => ({
      ...prev,
      [member.id]: { ...getRowValues(member), ...prev[member.id], ...patch },
    }));
  }

  function handleAddAll() {
    if (!tmdbCast) return;
    const remaining = tmdbCast.filter((m) => !addedTmdbIds.has(m.id));
    if (remaining.length === 0) return;

    const payload = remaining.map((m) => {
      const values = getRowValues(m);
      return {
        tmdbId: m.id,
        characterName: values.characterName,
        castOrder: values.castOrder,
      };
    });

    addCastMembersBulk.mutate(payload);
  }

  const remainingCount = tmdbCast
    ? tmdbCast.filter((m) => !addedTmdbIds.has(m.id)).length
    : 0;

  return (
    <div>
      <h3 className="font-display text-lg tracking-wide text-paper-100">
        Cast
      </h3>

      {currentCast.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {currentCast.map((c, i) => (
            <li key={i} className="flex w-24 flex-col items-center text-center">
              <RoundAvatar
                src={tmdbImageUrl(c.actor.profilePath)}
                alt={c.actor.name}
                size="sm"
              />
              <p className="mt-1 w-full truncate text-xs font-medium text-paper-100">
                {c.actor.name}
              </p>
              <p className="w-full truncate text-xs text-paper-500">
                {c.characterName}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-paper-500">No cast added yet.</p>
      )}

      <div className="mt-5 border-t border-ink-700 pt-5">
        {!tmdbId ? (
          <ConnectTmdbSection movieId={movieId} slug={slug} title={title} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-sm text-paper-500">
                <Link2 className="size-4 text-emerald-400" aria-hidden />
                Connected to TMDB (ID {tmdbId})
              </p>

              {remainingCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddAll}
                  isLoading={addCastMembersBulk.isPending}
                  disabled={addCastMembersBulk.isPending}
                >
                  <Users className="size-4" aria-hidden />
                  Add all ({remainingCount})
                </Button>
              )}
            </div>

            {isLoadingCast && (
              <p className="mt-3 text-sm text-paper-500">Loading TMDB cast…</p>
            )}

            {tmdbCast && tmdbCast.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {tmdbCast.map((member) => {
                  const values = getRowValues(member);
                  return (
                    <TmdbCastRow
                      key={member.id}
                      member={member}
                      movieId={movieId}
                      slug={slug}
                      alreadyAdded={addedTmdbIds.has(member.id)}
                      characterName={values.characterName}
                      castOrder={values.castOrder}
                      onChangeCharacterName={(value) =>
                        setRowValue(member, { characterName: value })
                      }
                      onChangeCastOrder={(value) =>
                        setRowValue(member, { castOrder: value })
                      }
                    />
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
