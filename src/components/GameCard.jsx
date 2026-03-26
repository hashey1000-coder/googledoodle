import { Link } from 'react-router-dom';
import gameData from '../data/games.json';

const { games } = gameData;

const PlayIcon = () => (
  <div className="gcard__play">
    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
  </div>
);

export default function GameCard({ slug, variant = 'grid' }) {
  const game = games[slug];
  if (!game) return null;

  const { title, thumbnail: thumb, categories } = game;
  const cat = categories?.[0]?.replace(/-/g, ' ');

  const imgEl = (
    <img
      src={thumb ? `/assets/images/${thumb}` : ''}
      alt={title}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );

  if (variant === 'carousel') {
    return (
      <div className="carousel-card">
        <Link to={`/${slug}/`} className="carousel-card__link">
          <div className="carousel-card__img">{imgEl}</div>
          <div className="carousel-card__name">{title}</div>
        </Link>
      </div>
    );
  }

  // homepage and grid — unified gcard design
  return (
    <Link to={`/${slug}/`} className="gcard" style={{ display: 'block', textDecoration: 'none' }}>
      <div className="gcard__img-wrap">
        {imgEl}
        <div className="gcard__overlay">
          <PlayIcon />
        </div>
      </div>
      <div className="gcard__body">
        <p className="gcard__name">{title}</p>
        {cat && <p className="gcard__cat">{cat}</p>}
      </div>
    </Link>
  );
}
