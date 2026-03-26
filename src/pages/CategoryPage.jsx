import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import GameCard from '../components/GameCard';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';
import gameData from '../data/games.json';

const { games, categories, categoryGames } = gameData;

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categories[slug];
  const gameSlugs = (categoryGames[slug] || []).filter(s => s in games);

  /* ── SEO schema (before early return — rules of hooks) ── */
  const seoSchema = useMemo(() => {
    if (!category) return null;
    const title = `${category.name} Games — Play Free Online | ${SITE_NAME}`;
    const desc  = `Play all ${gameSlugs.length} ${category.name.toLowerCase()} Google Doodle games free in your browser. Instant play, no download or account needed.`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/${slug}/` },
          ],
        },
        {
          '@type': 'CollectionPage',
          name: title,
          description: desc,
          url: `${SITE_URL}/${slug}/`,
          isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
          numberOfItems: gameSlugs.length,
          itemListElement: gameSlugs.slice(0, 10).map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/${s}/`,
            name: games[s]?.title || s,
          })),
        },
      ],
    };
  }, [slug]);

  useSEO({
    title: category
      ? `${category.name} Games — Play Free Online | ${SITE_NAME}`
      : `Category Not Found — ${SITE_NAME}`,
    description: category
      ? `Play all ${gameSlugs.length} ${category.name.toLowerCase()} Google Doodle games free in your browser. Instant play, no download or account needed.`
      : '',
    canonical: `${SITE_URL}/${slug}/`,
    type: 'website',
    schema: seoSchema,
    noindex: !category,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!category) {
    return (
      <div className="cat-page" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Category Not Found</h1>
        <Link to="/" className="home-hero__cta" style={{ display: 'inline-flex' }}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="cat-page">
      <div className="cat-page__banner">
        <span className="cat-page__count">{gameSlugs.length} Games</span>
        <h1 className="cat-page__title">{category.name}</h1>
        <p className="cat-page__sub">Play all {gameSlugs.length} {category.name.toLowerCase()} free in your browser — instant, no account required.</p>
      </div>
      <section className="games-section">
        <div className="games-section__head">
          <h2 className="games-section__title">{category.name}</h2>
        </div>
        <div className="games-grid">
          {gameSlugs.map(s => <GameCard key={s} slug={s} variant="homepage" />)}
        </div>
      </section>
    </div>
  );
}
