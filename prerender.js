/**
 * Prerender script — generates a static HTML file for every route.
 *
 * Usage:
 *   npm run build          → SPA bundle in dist/ (works with any static host + SPA fallback)
 *   npm run build:static   → SPA bundle + prerendered HTML for every route (full SSG)
 *
 * Each prerendered file has per-page <title>, <meta description>, canonical,
 * Open Graph, Twitter Card, and JSON-LD structured data injected at build time
 * so crawlers see the correct meta even before JavaScript executes.
 */
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist      = path.join(__dirname, 'dist');
const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');

const gamesJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src', 'data', 'games.json'), 'utf-8')
);

const SITE_URL  = 'https://googledoodlegames.org';
const SITE_NAME = 'Google Doodle Games';
const TODAY     = new Date().toISOString().split('T')[0];

// ── Helpers ───────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str = '', max = 155) {
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/\s\S*$/, '').replace(/[,;:]$/, '') + '…';
}

// ── SEO block builder ─────────────────────────────────────────

function buildSeoBlock({ title, description, canonical, ogType = 'website', ogImage, schema, noindex = false }) {
  const lines = [
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${esc(description)}" />`,
    `  <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    `  <link rel="canonical" href="${canonical}" />`,
    `  <meta property="og:type" content="${ogType}" />`,
    `  <meta property="og:title" content="${esc(title)}" />`,
    `  <meta property="og:description" content="${esc(description)}" />`,
    `  <meta property="og:url" content="${canonical}" />`,
    `  <meta property="og:site_name" content="${SITE_NAME}" />`,
  ];
  if (ogImage) {
    lines.push(`  <meta property="og:image" content="${ogImage}" />`);
    lines.push(`  <meta name="twitter:card" content="summary_large_image" />`);
    lines.push(`  <meta name="twitter:image" content="${ogImage}" />`);
  } else {
    lines.push(`  <meta name="twitter:card" content="summary" />`);
  }
  lines.push(`  <meta name="twitter:title" content="${esc(title)}" />`);
  lines.push(`  <meta name="twitter:description" content="${esc(description)}" />`);
  if (schema) {
    lines.push(`  <script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }
  return lines.join('\n');
}

// ── Per-route SEO data ────────────────────────────────────────

function getRouteSeoBlock(route) {
  const slug = route.replace(/^\/|\/$/g, '');

  /* Home */
  if (route === '/') {
    return buildSeoBlock({
      title:       `${SITE_NAME} — Play Google Doodle Games Free Online`,
      description: 'Play 107 iconic Google Doodle mini-games free online. Pac-Man, Snake, Magic Cat Academy, Cricket and more — instant play in your browser, no download.',
      canonical:   `${SITE_URL}/`,
      ogImage:     `${SITE_URL}/assets/images/logo.svg`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id':   `${SITE_URL}/#website`,
            name:    SITE_NAME,
            url:     `${SITE_URL}/`,
            description: 'Play 107 iconic Google Doodle mini-games free online.',
            potentialAction: {
              '@type':      'SearchAction',
              target:       { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/all/?q={search_term_string}` },
              'query-input':'required name=search_term_string',
            },
          },
          {
            '@type': 'Organization',
            '@id':   `${SITE_URL}/#org`,
            name:    SITE_NAME,
            url:     `${SITE_URL}/`,
            logo:    { '@type': 'ImageObject', url: `${SITE_URL}/assets/images/logo.svg` },
          },
        ],
      },
    });
  }

  /* Privacy */
  if (route === '/privacy/') {
    return buildSeoBlock({
      title:       `Privacy Policy — ${SITE_NAME}`,
      description: `Read the Google Doodle Games privacy policy. We do not collect personal data, use tracking cookies, or share your information with third parties.`,
      canonical:   `${SITE_URL}/privacy/`,
      schema: {
        '@context': 'https://schema.org',
        '@type':    'WebPage',
        name:       `Privacy Policy — ${SITE_NAME}`,
        url:        `${SITE_URL}/privacy/`,
        isPartOf:   { '@type': 'WebSite', url: `${SITE_URL}/` },
      },
    });
  }

  /* About */
  if (route === '/about/') {
    return buildSeoBlock({
      title:       `About Us — ${SITE_NAME}`,
      description: `Learn about Google Doodle Games — your home for 107 free Google Doodle games. Discover our mission, the history of Doodle games, and why we built this collection.`,
      canonical:   `${SITE_URL}/about/`,
      schema: {
        '@context': 'https://schema.org',
        '@type':    'AboutPage',
        name:       `About Us — ${SITE_NAME}`,
        url:        `${SITE_URL}/about/`,
        isPartOf:   { '@type': 'WebSite', url: `${SITE_URL}/` },
      },
    });
  }

  /* Contact */
  if (route === '/contact/') {
    return buildSeoBlock({
      title:       `Contact Us — ${SITE_NAME}`,
      description: `Get in touch with the Google Doodle Games team. Report a broken game, suggest a missing Doodle, or just say hello.`,
      canonical:   `${SITE_URL}/contact/`,
      schema: {
        '@context': 'https://schema.org',
        '@type':    'ContactPage',
        name:       `Contact — ${SITE_NAME}`,
        url:        `${SITE_URL}/contact/`,
        isPartOf:   { '@type': 'WebSite', url: `${SITE_URL}/` },
      },
    });
  }
  /* Terms of Service */
  if (route === '/terms/') {
    return buildSeoBlock({
      title:       `Terms of Service — ${SITE_NAME}`,
      description: `Read the Google Doodle Games terms of service. Understand the rules, disclaimers, and intellectual-property notices that govern the use of this site.`,
      canonical:   `${SITE_URL}/terms/`,
      schema: {
        '@context': 'https://schema.org',
        '@type':    'WebPage',
        name:       `Terms of Service — ${SITE_NAME}`,
        url:        `${SITE_URL}/terms/`,
        isPartOf:   { '@type': 'WebSite', url: `${SITE_URL}/` },
      },
    });
  }
  /* Category pages */
  if (slug in gamesJson.categories) {
    const cat       = gamesJson.categories[slug];
    const gameSlugs = (gamesJson.categoryGames?.[slug] || []).filter(s => s in gamesJson.games);
    const title     = `${cat.name} Games — Play Free Online | ${SITE_NAME}`;
    const desc      = `Play all ${gameSlugs.length} ${cat.name.toLowerCase()} Google Doodle games free in your browser. Instant play, no download or account needed.`;
    return buildSeoBlock({
      title, description: desc, canonical: `${SITE_URL}/${slug}/`,
      ogType: 'website',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home',     item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: cat.name,   item: `${SITE_URL}/${slug}/` },
            ],
          },
          {
            '@type':         'CollectionPage',
            name:            title,
            description:     desc,
            url:             `${SITE_URL}/${slug}/`,
            isPartOf:        { '@type': 'WebSite', url: `${SITE_URL}/` },
            numberOfItems:   gameSlugs.length,
            itemListElement: gameSlugs.slice(0, 10).map((s, i) => ({
              '@type':   'ListItem',
              position:  i + 1,
              url:       `${SITE_URL}/${s}/`,
              name:      gamesJson.games[s]?.title || s,
            })),
          },
        ],
      },
    });
  }

  /* Game pages */
  if (slug in gamesJson.games) {
    const game     = gamesJson.games[slug];
    let   title    = `Play ${game.title} Free Online — ${SITE_NAME}`;
    if (title.length > 60) title = `Play ${game.title} — ${SITE_NAME}`;
    if (title.length > 60) title = `${game.title} — ${SITE_NAME}`;
    const rawDesc  = (game.intro || []).join(' ') || stripHtml(game.description || '');
    const desc     = truncate(rawDesc, 155);
    const imageUrl = game.thumbnail
      ? `${SITE_URL}/assets/images/${game.thumbnail}`
      : `${SITE_URL}/assets/images/logo.svg`;
    const genre    = (game.categories || [])
      .map(c => gamesJson.categories[c]?.name || c).join(', ') || 'Casual';

    return buildSeoBlock({
      title, description: desc, canonical: `${SITE_URL}/${slug}/`,
      ogType: 'article', ogImage: imageUrl,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home',       item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: game.title,   item: `${SITE_URL}/${slug}/` },
            ],
          },
          {
            '@type':              'VideoGame',
            name:                 game.title,
            description:          desc,
            url:                  `${SITE_URL}/${slug}/`,
            image:                imageUrl,
            genre,
            operatingSystem:      'Browser',
            applicationCategory:  'Game',
            offers: {
              '@type':       'Offer',
              price:         '0',
              priceCurrency: 'USD',
              availability:  'https://schema.org/InStock',
            },
          },
        ],
      },
    });
  }

  return null;
}

// ── HTML injection ────────────────────────────────────────────

function injectSeo(html, seoBlock) {
  if (!seoBlock) return html;
  return html.replace(
    /<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/,
    `<!-- SEO_META_START -->\n${seoBlock}\n  <!-- SEO_META_END -->`
  );
}

// ── Sitemap ───────────────────────────────────────────────────

function generateSitemap(routes) {
  const entries = routes.map(route => {
    const slug = route.replace(/^\/|\/$/g, '');
    let priority   = '0.7';
    let changefreq = 'monthly';
    if (route === '/')             { priority = '1.0'; changefreq = 'weekly';  }
    else if (slug in gamesJson.categories) { priority = '0.8'; changefreq = 'weekly';  }
    else if (route === '/privacy/')        { priority = '0.2'; changefreq = 'yearly';  }
    else if (route === '/terms/')         { priority = '0.2'; changefreq = 'yearly';  }
    return [
      '  <url>',
      `    <loc>${SITE_URL}${route}</loc>`,
      `    <lastmod>${TODAY}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');
}

// ── Main ──────────────────────────────────────────────────────

const routes = [
  '/',
  '/privacy/',
  '/terms/',
  '/about/',
  '/contact/',
  ...Object.keys(gamesJson.categories).map(c => `/${c}/`),
  ...Object.keys(gamesJson.games).map(g => `/${g}/`),
];

console.log(`Pre-rendering ${routes.length} routes...`);

let created = 0;
for (const route of routes) {
  const dir      = path.join(dist, route);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'index.html');
  const seoBlock = getRouteSeoBlock(route);
  fs.writeFileSync(filePath, injectSeo(indexHtml, seoBlock));
  created++;
}

// Sitemap
const sitemap = generateSitemap(routes);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`✅ Generated sitemap.xml (${routes.length} URLs)`);

// 404.html
const notFoundBlock = buildSeoBlock({
  title:       `404 — Page Not Found | ${SITE_NAME}`,
  description: 'Page not found. Return to Google Doodle Games to play free Google Doodle games.',
  canonical:   `${SITE_URL}/`,
  noindex:     true,
});
fs.writeFileSync(path.join(dist, '404.html'), injectSeo(indexHtml, notFoundBlock));
console.log(`✅ Created 404.html`);

// ── Redirect pages ────────────────────────────────────────────
// Generate lightweight HTML files that redirect old/alias URLs to their
// canonical destinations. These fire a <meta refresh> + JS redirect so
// they work on any static host without server-side rewrite rules.

const REDIRECTS = {
  '/pac-man/':          '/pacman/',
  '/pac-man':           '/pacman/',
  '/privacy-policy/':   '/privacy/',
  '/privacy-policy':    '/privacy/',
  '/terms-of-service/': '/terms/',
  '/terms-of-service':  '/terms/',
};

let redirectCount = 0;
for (const [from, to] of Object.entries(REDIRECTS)) {
  const dest    = `${SITE_URL}${to}`;
  const dirPath = path.join(dist, from.endsWith('/') ? from : `${from}/`);
  fs.mkdirSync(dirPath, { recursive: true });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="refresh" content="0;url=${dest}"/>
  <link rel="canonical" href="${dest}"/>
  <meta name="robots" content="noindex, follow"/>
  <title>Redirecting…</title>
  <script>window.location.replace("${dest}");</script>
</head>
<body><p>Redirecting to <a href="${dest}">${dest}</a>…</p></body>
</html>`;
  fs.writeFileSync(path.join(dirPath, 'index.html'), html);
  redirectCount++;
}
console.log(`✅ Created ${redirectCount} redirect pages`);

console.log(`✅ Pre-rendered ${created} route files`);
console.log(`   Total routes : ${routes.length}`);
console.log(`\nDeploy the dist/ folder to any static host.`);
