import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import CategoryPage from './pages/CategoryPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import gameData from './data/games.json';

const { games, categories } = gameData;

function DynamicPage() {
  const { slug } = useParams();
  if (slug in games) return <GamePage />;
  if (slug in categories) return <CategoryPage />;
  return <NotFound />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/privacy/" element={<Privacy />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy/" replace />} />
        <Route path="/privacy-policy/" element={<Navigate to="/privacy/" replace />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms/" element={<Terms />} />
        <Route path="/terms-of-service" element={<Navigate to="/terms/" replace />} />
        <Route path="/terms-of-service/" element={<Navigate to="/terms/" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact/" element={<Contact />} />
        <Route path="/pac-man" element={<Navigate to="/pacman/" replace />} />
        <Route path="/pac-man/" element={<Navigate to="/pacman/" replace />} />
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="/:slug/" element={<DynamicPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
