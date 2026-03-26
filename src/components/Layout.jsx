import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`wrapper _loaded${menuOpen ? ' _menu-open' : ''}`}>
      <ScrollToTop />
      <Header onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <div className="site-body">
        {/* Left panel — permanent on desktop, drawer on mobile */}
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        {menuOpen && (
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
        )}
        <main className="page">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
