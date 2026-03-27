import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';
import gameData from '../data/games.json';

const { games, homepageOrder, allSlugs } = gameData;

const featured = homepageOrder.filter(s => s in games).slice(0, 12);
const featuredSet = new Set(featured);
const remaining = allSlugs.filter(s => !featuredSet.has(s));

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
          {featured.map((slug, i) => <GameCard key={slug} slug={slug} variant="homepage" priority={i < 12} />)}
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
          <p>The first playable Google Doodle arrived in May 2010 — a fully interactive Pac-Man maze built to celebrate the game's 30th anniversary. Google expected players to spend a few minutes with it before returning to their search queries. Instead, productivity software company RescueTime estimated that workers around the world collectively spent 4.82 million hours playing it during business hours alone in the first two days. The internet went wild, and Google left the Doodle live far longer than the usual 24 hours.</p>
          <p>Since that landmark moment, Google's team of Doodlers — artists, engineers, and storytellers working in remarkably close collaboration — has produced dozens of browser-based mini-games to mark occasions ranging from the Cricket World Cup to Beethoven's 245th birthday to the 50th anniversary of kids' coding education. Each one is a tiny masterpiece of purposeful design: hand-illustrated, carefully coded, thoroughly play-tested, and engineered to be picked up in seconds by anyone regardless of gaming background. They appear for 24 hours on the Google homepage, then vanish. We have preserved every playable one here so the fun never has to stop.</p>
        </div>

        <div className="home-about__block">
          <h2 className="home-about__heading">What Makes Doodle Games Special</h2>
          <p>Every Doodle game distils a concept down to its absolute purest form. No logins, no installs, no tutorial screens, no loading bars — just open-and-play fun that fits any schedule and works on any device. The constraints are severe and the rewards are extraordinary. When a game must communicate everything it needs you to know in the first three seconds, purely through visual context and intuition, every single design decision becomes critical. The result is a library of games that feel effortless to begin and surprisingly difficult to master.</p>
          <p>The difficulty in most Doodle games ramps just enough to keep you chasing that next high score without ever tipping into frustration. The art direction tells a complete story in miniature — a tiny biographical sketch of Beethoven in a few illustrated frames, an entire cricket match compressed into one perfect timing mechanic, a hip hop history lesson delivered through a working turntable. The ambition packed into these small experiences is genuinely astonishing once you start paying attention to it.</p>
          <p>Whether you have two minutes between meetings or two hours to give over on a rainy afternoon, there is always a Doodle perfectly sized to what you have. Simple enough for any age, deep enough to be genuinely compelling for experienced players — that tension between accessibility and depth is the defining magic of the format, and it is why these games continue to be discovered and loved years after their original release dates.</p>
        </div>

        <div className="home-about__block">
          <h2 className="home-about__heading">107 Games, Every Genre, One Place</h2>
          <p>This collection spans the full range of what browser gaming can be. The Sports section covers Olympic disciplines from hurdles to basketball to slalom kayaking. The Snake category traces one of gaming's oldest and most satisfying mechanics through multiple artistic interpretations. The Classroom section houses Google's educational Doodles — including the Coding with Carrot game that has been used as a genuine teaching resource in schools worldwide. The Anniversary category holds the collection's most ambitious titles: the Beethoven musical education experience, the multi-part Hip Hop Doodle, and games built around historical milestones that most people would never have explored otherwise.</p>
          <p>Every game here is free, every game loads instantly in your browser, and every game links to related titles so one discovery naturally leads to another. There are no subscriptions, no in-app purchases, no accounts required — just 107 games waiting to be played, replayed, and shared. Start anywhere. The collection rewards curiosity above all else.</p>
        </div>

        <p className="home-about__tagline">Your home for every Google Doodle game — free, forever, one click away.</p>
      </section>
    </div>
  );
}
