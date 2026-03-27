import { Link } from 'react-router-dom';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';

const ABOUT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About Us — ${SITE_NAME}`,
  url: `${SITE_URL}/about/`,
  isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
};

export default function About() {
  useSEO({
    title: `About Us — ${SITE_NAME}`,
    description: `Learn about Google Doodle Games — your home for 100+ free Google Doodle games. Discover our mission, the history of Doodle games, and why we built this collection.`,
    canonical: `${SITE_URL}/about/`,
    schema: ABOUT_SCHEMA,
  });

  return (
    <div className="inner-page">
      <div className="inner-page__header">
        <h1>About Google Doodle Games</h1>
        <p>Your free, forever home for every playable Google Doodle game.</p>
      </div>

      <div className="inner-page__body">
        <h2>Our Mission</h2>
        <p>
          Google Doodles are tiny masterpieces — mini-games built to celebrate a birthday, a world cup,
          or a historical moment, then quietly retired when the day ends. Google Doodle Games exists so none
          of them are lost. We've collected every playable Google Doodle and made them available here,
          free, instantly, forever.
        </p>

        <h2>How It Started</h2>
        <p>
          The first playable Google Doodle was the 2010 Pac-Man maze, built to celebrate the game's
          30th anniversary. It was only supposed to stay live for 48 hours — but the internet loved it
          so much that Google kept it up permanently. That single Doodle reportedly cost the world
          economy millions in lost productivity. Not bad for a homepage easter egg.
        </p>
        <p>
          Since then, Google's Doodlers have shipped dozens of interactive games: from the Beethoven
          birthday synthesizer to the Tokyo 2020 Champion Island RPG. Each one is a
          polished piece of interactive design, and we think they deserve to live on long after their
          original day in the spotlight.
        </p>

        <h2>What You'll Find Here</h2>
        <div className="inner-page__cards">
          <div className="inner-page__card">
            <span className="inner-page__card-icon">🎮</span>
            <div className="inner-page__card-title">107 Games</div>
            <p className="inner-page__card-desc">Every playable Google Doodle in one place — classics, rarities, and everything in between.</p>
          </div>
          <div className="inner-page__card">
            <span className="inner-page__card-icon">⚡</span>
            <div className="inner-page__card-title">Instant Play</div>
            <p className="inner-page__card-desc">No account. No install. No waiting. Click a game and it loads in seconds.</p>
          </div>
          <div className="inner-page__card">
            <span className="inner-page__card-icon">📱</span>
            <div className="inner-page__card-title">Any Device</div>
            <p className="inner-page__card-desc">Works on desktop, tablet, and mobile — play wherever you are.</p>
          </div>
          <div className="inner-page__card">
            <span className="inner-page__card-icon">🆓</span>
            <div className="inner-page__card-title">Always Free</div>
            <p className="inner-page__card-desc">100% free, no interruptions, no premium tier. Just games.</p>
          </div>
        </div>

        <h2>Categories We Cover</h2>
        <p>
          Our collection spans every theme Google has explored — sports Doodles from the Cricket World
          Cup and Olympic Games, educational classroom tools, spooky Halloween adventures, anniversary
          commemorations, snake and puzzle variants, and quick mini-games you can finish in under two
          minutes. Browse by category or search for a specific Doodle.
        </p>

        <h2>Disclaimer</h2>
        <p>
          Google Doodle Games is an independent fan site and is not affiliated with, endorsed by, or connected
          to Google LLC in any way. All games are the intellectual property of Google LLC and are loaded
          directly from Google's own servers via iframe embeds. We make no claim of ownership over
          any game content.
        </p>

        <div style={{ marginTop: 40, padding: '18px 22px', background: 'rgba(26,115,232,.06)', borderRadius: 12, borderLeft: '3px solid var(--accent)' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Have a question or want to report a broken game?{' '}
            <Link to="/contact/" style={{ color: 'var(--accent)' }}>Contact us →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
