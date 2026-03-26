import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';
import gameData from '../data/games.json';

const { games, homepageOrder, allSlugs } = gameData;

const featured = homepageOrder.filter(s => s in games).slice(0, 12);
const remaining = allSlugs.filter(s => !homepageOrder.includes(s));

const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'Play 100+ iconic Google Doodle mini-games free online.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/all/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/images/logo.svg` },
    },
  ],
};

export default function Home() {
  useSEO({
    title: `${SITE_NAME} — Play Google Doodle Games Free Online`,
    description: 'Play 100+ iconic Google Doodle mini-games free online. Pac-Man, Snake, Magic Cat Academy, Cricket and more — instant play in your browser, no download.',
    canonical: `${SITE_URL}/`,
    schema: HOME_SCHEMA,
  });

  return (
    <div className="home-page">
      {/* Intro bar */}
      <div className="home-intro">
        <div className="home-intro__left">
          <h1 className="home-intro__title">Google Doodle Games</h1>
          <p className="home-intro__sub">Discover & play 100+ iconic Google Doodle mini-games — free, instant, straight in your browser.</p>
        </div>
        <span className="home-intro__badge">{allSlugs.length} Games</span>
      </div>

      <p className="home-intro__desc">From Beethoven's 245th birthday to the Cricket World Cup, Google Doodles have delighted billions worldwide. This collection brings together every playable Doodle — beloved classics like Snake, Pac-Man, and Magic Cat Academy alongside rare anniversary editions — all running directly in your browser, completely free. No account. No install. Just play.</p>

      {/* Featured */}
      <section className="games-section">
        <div className="games-section__head">
          <h2 className="games-section__title">Staff Picks</h2>
          <Link to="/all/" className="games-section__view-all">View all →</Link>
        </div>
        <div className="games-grid">
          {featured.map(slug => <GameCard key={slug} slug={slug} variant="homepage" />)}
        </div>
      </section>

      {/* All games */}
      <section className="games-section">
        <div className="games-section__head">
          <h2 className="games-section__title">All Games</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>{remaining.length + featured.length} games</span>
        </div>
        <div className="games-grid">
          {remaining.map(slug => <GameCard key={slug} slug={slug} variant="homepage" />)}
        </div>
      </section>

      {/* About */}
      <section className="home-about">
        <div className="home-about__block">
          <h2 className="home-about__heading">How Google Doodle Games Started</h2>
          <p>The first playable Google Doodle arrived in 2010 — a fully interactive Pac-Man maze built to celebrate the game's 30th anniversary. The internet went wild. Since then, Google's Doodlers have crafted dozens of interactive games to mark everything from the Cricket World Cup to Beethoven's 245th birthday. Each one is a tiny masterpiece of design — open-and-play, then gone when the day ends. We've preserved them all here so the fun never stops.</p>
        </div>

        <div className="home-about__block">
          <h2 className="home-about__heading">What Makes Doodle Games Special</h2>
          <p>Every Doodle game distills a concept down to its purest form. No logins, no installs, no interruptions — just open-and-play fun that fits any schedule. The difficulty ramps just enough to keep you chasing that next high score, while the art direction tells a whole story in miniature.</p>
          <p>Whether you have two minutes between meetings or two hours to burn on a rainy afternoon, there's always a Doodle waiting for you. Simple enough for any age, deep enough to be genuinely compelling — that's the magic.</p>
        </div>

        <p className="home-about__tagline">Your home for every Google Doodle game — free, forever, one click away.</p>
      </section>
    </div>
  );
}
