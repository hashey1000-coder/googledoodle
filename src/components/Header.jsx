import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import gameData from '../data/games.json';

const { games } = gameData;
const gameList = Object.values(games);

const CATEGORIES = [
  { slug: 'all', label: 'All Games', img: 'btn_more.svg' },
  { slug: 'snake-games', label: 'Snake', img: 'google-snake.webp' },
  { slug: 'classroom', label: 'Classroom', img: 'Classroom-games.webp' },
  { slug: 'mini', label: 'Mini', img: 'Mini-g.webp' },
  { slug: 'sports', label: 'Sports', img: 'Sport.webp' },
  { slug: 'dinosaur-games', label: 'Dino', img: 'dino.webp' },
  { slug: 'anniversary', label: 'Anniversary', img: 'anniversary.webp' },
];

export default function Header({ onMenuToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // Toggle `search-open` on <html> for CSS-driven overlay (mobile backdrop etc.)
  // This is independent of searchOpen so desktop users typing without clicking
  // the open button still get the dropdown.
  useEffect(() => {
    const showDropdown = results.length > 0 || (searched && query.length >= 2);
    if (showDropdown) {
      document.documentElement.classList.add('search-open');
    } else {
      document.documentElement.classList.remove('search-open');
    }
    return () => document.documentElement.classList.remove('search-open');
  }, [results, searched, query]);

  // Close when clicking outside
  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [searchOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeSearch(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    const lower = q.toLowerCase();
    setResults(gameList.filter(g => g.title.toLowerCase().includes(lower)).slice(0, 8));
    setSearched(true);
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const goToGame = (slug) => {
    closeSearch();
    navigate(`/${slug}/`);
  };

  const hasResults = results.length > 0;
  const showNoResults = searched && query.length >= 2 && !hasResults;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* Hamburger – mobile only */}
        <button className="site-hamburger" type="button" aria-label="Menu" onClick={onMenuToggle}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 5h16M3 11h16M3 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo */}
        <Link className="site-logo" to="/">
          <svg className="site-logo__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="hdrRR">
                <rect width="48" height="48" rx="11"/>
              </clipPath>
            </defs>
            {/* Google quad-color background */}
            <g clipPath="url(#hdrRR)">
              <rect x="0"  y="0"  width="24" height="24" fill="#4285F4"/>
              <rect x="24" y="0"  width="24" height="24" fill="#EA4335"/>
              <rect x="0"  y="24" width="24" height="24" fill="#34A853"/>
              <rect x="24" y="24" width="24" height="24" fill="#FBBC04"/>
            </g>
            {/* Cartoon white circle button */}
            <circle cx="24" cy="24" r="15" fill="white" stroke="#1a1a1a" strokeWidth="2.5"/>
            {/* Bold play triangle */}
            <path d="M20 17 L20 31 L33 24 Z" fill="#4285F4" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round"/>
            {/* Shine highlight */}
            <circle cx="18" cy="18" r="3" fill="white" opacity="0.5"/>
          </svg>
          <span className="site-logo__text">Google Doodle</span>
        </Link>

        {/* Desktop nav */}
        <nav className="site-nav">
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/all/">All Games</NavLink>
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/snake-games/">Snake</NavLink>
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/classroom/">Classroom</NavLink>
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/sports/">Sports</NavLink>
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/dinosaur-games/">Dino</NavLink>
          <NavLink className={({isActive}) => `site-nav__link${isActive ? ' active' : ''}`} to="/anniversary/">Anniversary</NavLink>
        </nav>

        {/* Search */}
        <div className="site-search" ref={searchRef}>
          <form
            className="site-search__form"
            onSubmit={e => { e.preventDefault(); if (hasResults) goToGame(results[0].slug); }}
          >
            <svg className="site-search__icon" width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M13.7 7.8a5.9 5.9 0 1 1-11.8 0 5.9 5.9 0 0 1 11.8 0zM15.5 15.5l-3-2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              className="site-search__input"
              type="text"
              autoComplete="off"
              placeholder="Search games…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
            />
            {query && (
              <button type="button" className="site-search__clear" aria-label="Clear" onClick={clearQuery}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </form>

          {/* Dropdown */}
          {(hasResults || showNoResults) && (
            <div className="site-search__results">
              {hasResults ? results.map(g => (
                <div
                  key={g.slug}
                  className="site-search__result-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => goToGame(g.slug)}
                  onKeyDown={e => e.key === 'Enter' && goToGame(g.slug)}
                >
                  <img
                    className="site-search__result-thumb"
                    src={`/assets/images/${g.thumbnail}`}
                    alt={g.title}
                    loading="lazy"
                  />
                  <div className="site-search__result-info">
                    <div className="site-search__result-name">{g.title}</div>
                    {g.categories?.[0] && (
                      <div className="site-search__result-cat">{g.categories[0].replace(/-/g, ' ')}</div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="site-search__no-results">No games found for &ldquo;{query}&rdquo;</div>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
