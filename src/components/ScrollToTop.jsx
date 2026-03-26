import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls the window to the top whenever the route path changes. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Direct assignment is the most reliable cross-browser reset
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // rAF covers any layout shift that happens after first paint
    requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);
  return null;
}
