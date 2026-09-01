// TMDB only ever gives you a relative path (e.g. "/abc123.jpg") — every
// place that shows a photo has to prefix it with TMDB's image CDN.
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function tmdbImageUrl(
    path: string | null | undefined,
    size: 'w185' | 'w342' | 'h632' = 'w185',
): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
}