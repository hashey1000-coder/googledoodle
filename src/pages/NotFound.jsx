import { Link } from 'react-router-dom';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';

export default function NotFound() {
  useSEO({
    title: `404 — Page Not Found | ${SITE_NAME}`,
    description: 'Page not found. Return to Google Doodle Games to play free Google Doodle games.',
    canonical: `${SITE_URL}/`,
    noindex: true,
  });

  return (
    <section className="page-categories">
      <div className="page-categories__header header-categories" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 className="header-categories__title page-title" style={{ fontSize: 64, marginBottom: 16 }}>404</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#94a3b8', marginBottom: 24 }}>
          Page not found
        </p>
        <Link className="b-game__back" to="/" style={{ display: 'inline-flex' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Games
        </Link>
      </div>
    </section>
  );
}
