import { Link } from 'react-router-dom';

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="ftrRR"><rect width="48" height="48" rx="11"/></clipPath></defs>
      <g clipPath="url(#ftrRR)">
        <rect x="0"  y="0"  width="24" height="24" fill="#4285F4"/>
        <rect x="24" y="0"  width="24" height="24" fill="#EA4335"/>
        <rect x="0"  y="24" width="24" height="24" fill="#34A853"/>
        <rect x="24" y="24" width="24" height="24" fill="#FBBC04"/>
      </g>
      <circle cx="24" cy="24" r="15" fill="white" stroke="#1a1a1a" strokeWidth="2.5"/>
      <path d="M20 17 L20 31 L33 24 Z" fill="#4285F4" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="18" cy="18" r="3" fill="white" opacity="0.5"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cols">

        {/* Brand column */}
        <div className="site-footer__col site-footer__col--brand">
          <div className="site-footer__brand">
            <Logo />
            <span className="site-footer__logo-text">Google Doodle</span>
          </div>
          <p className="site-footer__tagline">
            Your home for every Google Doodle game &mdash; free, forever, one click away.
          </p>
        </div>

        {/* Games column */}
        <div className="site-footer__col">
          <h4 className="site-footer__col-heading">Browse</h4>
          <nav className="site-footer__col-links">
            <Link to="/all/"          className="site-footer__link">All Games</Link>
            <Link to="/snake-games/"  className="site-footer__link">Snake Games</Link>
            <Link to="/sports/"       className="site-footer__link">Sports</Link>
            <Link to="/dinosaur-games/" className="site-footer__link">Dinosaur Games</Link>
            <Link to="/anniversary/" className="site-footer__link">Anniversary</Link>
            <Link to="/popular/"     className="site-footer__link">Popular</Link>
          </nav>
        </div>

        {/* Info column */}
        <div className="site-footer__col">
          <h4 className="site-footer__col-heading">Info</h4>
          <nav className="site-footer__col-links">
            <Link to="/about/"   className="site-footer__link">About Us</Link>
            <Link to="/contact/" className="site-footer__link">Contact</Link>
            <Link to="/privacy/" className="site-footer__link">Privacy Policy</Link>
          </nav>
        </div>

      </div>
      <div className="site-footer__bottom">
        <p className="site-footer__copy">
          &copy; 2026 Google Doodle Games &middot; Not affiliated with Google LLC &middot; All games are property of their respective owners
        </p>
      </div>
    </footer>
  );
}
