import { useEffect } from 'react';

const SITE_NAME = 'Reelhouse';
// Set VITE_SITE_URL (e.g. https://reelhouse.example.com) in your deploy env so
// canonical + Open Graph URLs are absolute. Falls back to the current origin.
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? '';

interface DocumentMeta {
  title: string;
  description?: string;
  /** Path such as "/movies/inception"; defaults to the current location. */
  path?: string;
  image?: string | null;
  type?: 'website' | 'video.movie' | 'profile';
  /** Keep private/utility pages (admin, auth, account) out of search results. */
  noindex?: boolean;
  /** Optional schema.org JSON-LD object (e.g. a Movie). */
  jsonLd?: Record<string, unknown> | null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Per-page <title>, description, canonical, Open Graph, Twitter and JSON-LD tags. */
export function useDocumentMeta({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd = null,
}: DocumentMeta) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const origin = SITE_URL || window.location.origin;
    const url = `${origin}${path ?? window.location.pathname}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);

    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image ?? undefined);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image ?? undefined);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = jsonLdText;
      document.head.appendChild(script);
    }
    return () => {
      script?.remove();
    };
  }, [title, description, path, image, type, noindex, jsonLdText]);
}