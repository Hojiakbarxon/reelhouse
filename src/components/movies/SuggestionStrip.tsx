import { Link } from "react-router-dom";
import { Poster } from "@/components/ui/Poster";
import { useSuggestedMovies } from "@/hooks/use-movies";

// here movie ids are coming from database as a hardcoded.
const SUGGESTED_MOVIE_IDS: string[] = [
  "d6c2bca1-781b-4f75-8176-629da38203b7", // the incredible hulk,
  "041f149c-df79-48d3-babf-7ac443ed1c5a", //civil war
  "363d7d4d-6257-4210-a4b0-7d7cef1da8c8", //homecoming
  "ec14e840-a92c-44c6-aad2-54395014a82f", //infinity war
  "3838a160-ce4a-4198-b9c3-5692bd2cd721", //endgame
  "04b8871e-3462-4d7a-b765-e553b47559e1", //far from home
  "9088125d-a189-4de9-bb1c-6964d25fd2ca", //no way home
];

export function SuggestionStrip() {
  const { data, isLoading } = useSuggestedMovies(SUGGESTED_MOVIE_IDS);

  if (SUGGESTED_MOVIE_IDS.length === 0) return null;
  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-3 font-display text-xl tracking-wide text-paper-100">
        Get ready for Spider-Man: Brand New Day
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-28 shrink-0 animate-pulse rounded-card bg-ink-800 sm:w-32"
              />
            ))
          : data!.map((movie) => (
              <Link
                key={movie.id}
                to={`/movies/${movie.slug}`}
                className="group w-28 shrink-0 snap-start sm:w-32"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-card border border-ink-700 bg-ink-800 transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-gold-500/50">
                  <Poster
                    src={movie.poster_url}
                    alt={movie.title}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs text-paper-300">
                  {movie.title}
                </p>
              </Link>
            ))}
      </div>
    </div>
  );
}
