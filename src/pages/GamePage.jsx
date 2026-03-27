import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import ActionBar from '../components/ActionBar';
import ControlsPanel from '../components/ControlsPanel';
import GameCarousel from '../components/GameCarousel';
import { useSEO, SITE_URL, SITE_NAME, stripHtml, truncate } from '../utils/seo';
import gameData from '../data/games.json';

const { games, categories, allSlugs } = gameData;

// Compact sidebar game item
function SidebarItem({ slug: s }) {
  const g = games[s];
  if (!g) return null;
  return (
    <Link to={`/${s}/`} className="gp-sidebar__item">
      <div className="gp-sidebar__item-img">
        <img src={g.thumbnail ? `/assets/images/${g.thumbnail}` : ''} alt={g.title} loading="lazy" width="120" height="120" />
      </div>
      <span className="gp-sidebar__item-name">{g.title}</span>
    </Link>
  );
}

export default function GamePage() {
  const { slug } = useParams();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fakeFSActive, setFakeFSActive] = useState(false);
  const game = games[slug];

  /* ── Related games — must be before early return (rules of hooks) ── */
  const alsoLike = useMemo(() => {
    const usedSet = new Set([slug, ...(game?.carousel || []), ...(game?.moreGames || [])]);
    const catSet  = new Set(Object.keys(categories));
    const pool    = allSlugs.filter(s => !usedSet.has(s) && !catSet.has(s));
    const seed    = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return [...pool].sort((a, b) => {
      const ha = (a.charCodeAt(0) * 31 + seed) % 997;
      const hb = (b.charCodeAt(0) * 31 + seed) % 997;
      return ha - hb;
    }).slice(0, 20);
  }, [slug]);

  /* ── SEO — must be before early return (rules of hooks) ── */
  const seoSchema = useMemo(() => {
    if (!game) return null;
    const desc     = truncate(stripHtml((game.intro || []).join(' ') || game.description || ''), 155);
    const imageUrl = game.thumbnail
      ? `${SITE_URL}/assets/images/${game.thumbnail}`
      : `${SITE_URL}/assets/images/logo.svg`;
    const genreStr = (game.categories || []).map(c => categories[c]?.name || c).join(', ') || 'Casual';
    return {
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
          '@type': 'VideoGame',
          name:               game.title,
          description:        desc,
          url:                `${SITE_URL}/${slug}/`,
          image:              imageUrl,
          genre:              genreStr,
          operatingSystem:    'Browser',
          applicationCategory:'Game',
          offers: {
            '@type':       'Offer',
            price:         '0',
            priceCurrency: 'USD',
            availability:  'https://schema.org/InStock',
          },
        },
      ],
    };
  }, [slug]);

  const seoTitle = (() => {
    if (!game) return `Game Not Found — ${SITE_NAME}`;
    const full = `Play ${game.title} Free Online — ${SITE_NAME}`;
    if (full.length <= 60) return full;
    const short = `Play ${game.title} — ${SITE_NAME}`;
    if (short.length <= 60) return short;
    return `${game.title} — ${SITE_NAME}`;
  })();

  useSEO({
    title: seoTitle,
    description: game
      ? truncate(stripHtml((game.intro || []).join(' ') || game.description || ''), 155)
      : '',
    canonical: `${SITE_URL}/${slug}/`,
    image:  game?.thumbnail ? `${SITE_URL}/assets/images/${game.thumbnail}` : undefined,
    type:   'article',
    schema: seoSchema,
    noindex: !game,
  });

  useEffect(() => {
    setControlsOpen(false);
    setPlaying(false);
    setIsFullscreen(false);
    setFakeFSActive(false);
  }, [slug]);

  useEffect(() => {
    const onFSChange = () => {
      const native = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (!native) setIsFullscreen(false);
      else setIsFullscreen(true);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setFakeFSActive(false);
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleFullscreen = () => {
    const w = document.getElementById('game-window');
    if (!w) return;
    // Try native Fullscreen API first (desktop + Android)
    const req = w.requestFullscreen || w.webkitRequestFullscreen;
    if (req) {
      req.call(w).then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // iOS Safari rejects the promise — fall back to CSS fake-fullscreen
        setFakeFSActive(true);
        setIsFullscreen(true);
      });
    } else {
      // No API at all (old iOS) — CSS fallback
      setFakeFSActive(true);
      setIsFullscreen(true);
    }
  };

  const handleExitFullscreen = () => {
    if (fakeFSActive) {
      setFakeFSActive(false);
      setIsFullscreen(false);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
  };

  if (!game) {
    return (
      <div className="gp-wrap" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Game Not Found</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>The game &quot;{slug}&quot; doesn&apos;t exist.</p>
        <Link className="home-hero__cta" to="/" style={{ display: 'inline-flex' }}>← Back to Games</Link>
      </div>
    );
  }

  const catImages = {
    'snake-games': 'google-snake.webp',
    'classroom': 'Classroom-games.webp',
    'mini': 'Mini-g.webp',
    'sports': 'Sport.webp',
    'dinosaur-games': 'dino.webp',
    'anniversary': 'anniversary.webp',
  };

  const hasSidebar = (game.moreGames && game.moreGames.length > 0) || alsoLike.length > 0;

  return (
    <div className="gp-wrap">
      {/* Breadcrumb + title */}
      <div className="gp-header">
        <nav className="gp-breadcrumb" aria-label="Breadcrumb">
          <ol className="gp-breadcrumb__list">
            <li className="gp-breadcrumb__item">
              <Link to="/" className="gp-breadcrumb__link">Home</Link>
            </li>
            {game.categories && game.categories[0] && categories[game.categories[0]] && (
              <li className="gp-breadcrumb__item">
                <Link to={`/${game.categories[0]}/`} className="gp-breadcrumb__link">
                  {categories[game.categories[0]].name}
                </Link>
              </li>
            )}
            <li className="gp-breadcrumb__item gp-breadcrumb__item--current" aria-current="page">
              {game.title}
            </li>
          </ol>
        </nav>
        <h1 className="gp-title">{game.title}</h1>
      </div>

      {/* Two-column layout: main + right sidebar */}
      <div className={`gp-layout${hasSidebar ? '' : ' gp-layout--no-sidebar'}`}>

        {/* ── Main column ── */}
        <div className="gp-main">
          <div className={`gp-frame-wrap${fakeFSActive ? ' gp-frame-wrap--fs' : ''}`} id="game-window">
            {playing ? (
              <iframe
                className="gp-iframe"
                id="game-iframe"
                src={game.iframeUrl}
                allowFullScreen
                allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr"
                scrolling="yes"
                frameBorder="0"
                title={game.title}
              />
            ) : (
              <button
                className="gp-play-overlay"
                onClick={() => setPlaying(true)}
                aria-label={`Play ${game.title}`}
              >
                {game.thumbnail && (
                  <img
                    className="gp-play-overlay__thumb"
                    src={`/assets/images/${game.thumbnail}`}
                    alt={game.title}
                  />
                )}
                <div className="gp-play-overlay__scrim" />
                <div className="gp-play-overlay__btn">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.14v14l11-7-11-7z" fill="white"/>
                  </svg>
                </div>
                <span className="gp-play-overlay__label">Click to Play</span>
              </button>
            )}
            {isFullscreen && (
              <button
                className="gp-fs-exit"
                aria-label="Exit fullscreen"
                onClick={handleExitFullscreen}
              >
                <svg viewBox="0 0 14 14">
                  <line x1="1" y1="1" x2="13" y2="13"/>
                  <line x1="13" y1="1" x2="1" y2="13"/>
                </svg>
              </button>
            )}
          </div>

          <ActionBar game={game} playing={playing} onFullscreen={handleFullscreen} onToggleControls={() => setControlsOpen(!controlsOpen)} />
          <ControlsPanel game={game} show={controlsOpen} />

          {game.carousel && game.carousel.length > 0 && (
            <GameCarousel title="Related Games" slugs={game.carousel} />
          )}

          {game.description && (
            <div className="gp-info">
              {game.categories && game.categories.length > 0 && (
                <div className="cat-tags">
                  {game.categories.map(cat => (
                    <Link key={cat} to={`/${cat}/`} className="cat-tag">
                      <img
                        src={`/assets/images/${catImages[cat] || 'btn_more.svg'}`}
                        width="18"
                        height="18"
                        alt={categories[cat]?.name || cat}
                      />
                      {categories[cat]?.name || cat}
                    </Link>
                  ))}
                </div>
              )}
              <div className="gp-desc" dangerouslySetInnerHTML={{ __html: game.description }} />
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        {hasSidebar && (
          <aside className="gp-sidebar">
            {game.moreGames && game.moreGames.length > 0 && (
              <div className="gp-sidebar__section">
                <h3 className="gp-sidebar__heading">More Games</h3>
                <div className="gp-sidebar__list">
                  {game.moreGames.slice(0, 14).map(s => (
                    <SidebarItem key={s} slug={s} />
                  ))}
                </div>
              </div>
            )}
            {alsoLike.length > 0 && (
              <div className="gp-sidebar__section">
                <h3 className="gp-sidebar__heading">You May Also Like</h3>
                <div className="gp-sidebar__list">
                  {alsoLike.map(s => (
                    <SidebarItem key={s} slug={s} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

      </div>
    </div>
  );
}
