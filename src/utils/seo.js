import { useEffect } from 'react';

export const SITE_NAME = 'Google Doodle';
export const SITE_URL  = 'https://doodlearcade.com';

/** Strip HTML tags and decode common entities to plain text. */
export function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Truncate to max chars on a word boundary, appending an ellipsis. */
export function truncate(str = '', max = 155) {
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/\s\S*$/, '').replace(/[,;:]$/, '') + '…';
}

// ── DOM helpers ──────────────────────────────────────────────

function setMeta(name, content, attr = 'name') {
  if (content == null || content === '') return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(str) {
  let el = document.querySelector('script[data-id="page-schema"]');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-id', 'page-schema');
    document.head.appendChild(el);
  }
  el.textContent = str;
}

function removeJsonLd() {
  const el = document.querySelector('script[data-id="page-schema"]');
  if (el) el.remove();
}

// ── Hook ─────────────────────────────────────────────────────

/**
 * useSEO — manages title, meta description, canonical, Open Graph,
 * Twitter Card, and JSON-LD structured data for the current page.
 *
 * Call at the top of every page component (before any early return).
 */
export function useSEO({
  title,
  description,
  canonical,
  image,
  type     = 'website',
  schema,
  noindex  = false,
}) {
  // Stringify schema so object identity changes don't cause extra effects
  const schemaStr = schema ? JSON.stringify(schema) : null;

  useEffect(() => {
    const url  = canonical || `${SITE_URL}${window.location.pathname}`;
    const desc = truncate(description || '', 155);

    document.title = title || SITE_NAME;

    setMeta('description', desc);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);

    // Open Graph
    setMeta('og:title',       title,      'property');
    setMeta('og:description', desc,       'property');
    setMeta('og:type',        type,       'property');
    setMeta('og:url',         url,        'property');
    setMeta('og:site_name',   SITE_NAME,  'property');
    if (image) {
      setMeta('og:image',        image,  'property');
      setMeta('og:image:width',  '300',  'property');
      setMeta('og:image:height', '225',  'property');
    }

    // Twitter Card
    setMeta('twitter:card',        image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title',       title);
    setMeta('twitter:description', desc);
    if (image) setMeta('twitter:image', image);

    // JSON-LD structured data
    if (schemaStr) setJsonLd(schemaStr);
    else           removeJsonLd();

    return () => removeJsonLd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, image, type, noindex, schemaStr]);
}
