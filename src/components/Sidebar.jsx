import { Link } from 'react-router-dom';

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`menu${open ? ' _active' : ''}`}>
      <div className="menu__container">
        <nav className="menu__nav">
          <div className="menu__mobile-nav">
              <p className="menu__section-label">Categories</p>
              <div className="menu__group">
              <Link className="menu__button button-more" to="/all/" onClick={onClose}>
                <span className="button-more__icon"><img src="/assets/images/btn_more.svg" width="24" height="24" alt="All games" /></span>
                <span className="button-more__text">All games</span>
              </Link>
              <Link className="menu__link link-menu" to="/snake-games/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/google-snake.webp" width="24" height="24" alt="Snake Games" /></picture></span>
                <span className="link-menu__text">Snake Games</span>
              </Link>
              <Link className="menu__link link-menu" to="/classroom/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/Classroom-games.webp" width="24" height="24" alt="Classroom" /></picture></span>
                <span className="link-menu__text">Classroom</span>
              </Link>
              <Link className="menu__link link-menu" to="/mini/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/Mini-g.webp" width="24" height="24" alt="Mini" /></picture></span>
                <span className="link-menu__text">Mini</span>
              </Link>
              <Link className="menu__link link-menu" to="/sports/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/Sport.webp" width="24" height="24" alt="Sports" /></picture></span>
                <span className="link-menu__text">Sports</span>
              </Link>
              <Link className="menu__link link-menu" to="/dinosaur-games/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/dino.webp" width="24" height="24" alt="Dinosaur Games" /></picture></span>
                <span className="link-menu__text">Dinosaur Games</span>
              </Link>
              <Link className="menu__link link-menu" to="/anniversary/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/anniversary.webp" width="24" height="24" alt="Anniversary Games" /></picture></span>
                <span className="link-menu__text">Anniversary Games</span>
              </Link>
            </div>
          </div>
          <div className="menu__items">
            <p className="menu__section-label">Popular Games</p>
            <div className="menu__group">
              <Link className="menu__link link-menu" to="/baseball/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/fa300jpg.webp" width="24" height="24" alt="Baseball" /></picture></span>
                <span className="link-menu__text">Doodle Baseball</span>
              </Link>
              <Link className="menu__link link-menu" to="/doodle-cricket-game/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/cr300jpg.webp" width="24" height="24" alt="Cricket" /></picture></span>
                <span className="link-menu__text">Doodle Cricket</span>
              </Link>
              <Link className="menu__link link-menu" to="/solitaire/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/sol300jpg.webp" width="24" height="24" alt="Solitaire" /></picture></span>
                <span className="link-menu__text">Google Solitaire</span>
              </Link>
              <Link className="menu__link link-menu" to="/snake/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/gs300jpg.webp" width="24" height="24" alt="Snake" /></picture></span>
                <span className="link-menu__text">Google Snake Game</span>
              </Link>
              <Link className="menu__link link-menu" to="/pacman/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/pac300jpg.webp" width="24" height="24" alt="Pacman" /></picture></span>
                <span className="link-menu__text">Google Pacman</span>
              </Link>
              <Link className="menu__link link-menu" to="/chamion-island-games/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/hq300jpg.webp" width="24" height="24" alt="Champion Island" /></picture></span>
                <span className="link-menu__text">Champion Island Games</span>
              </Link>
              <Link className="menu__link link-menu" to="/magic-cat-academy/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/rr300jpg.webp" width="24" height="24" alt="Magic Cat Academy" /></picture></span>
                <span className="link-menu__text">Magic Cat Academy</span>
              </Link>
              <Link className="menu__link link-menu" to="/dinosaur/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/din300jpg.webp" width="24" height="24" alt="Dinosaur" /></picture></span>
                <span className="link-menu__text">Google Dinosaur Game</span>
              </Link>
              <Link className="menu__link link-menu" to="/minesweeper/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/mi300jpg.webp" width="24" height="24" alt="Minesweeper" /></picture></span>
                <span className="link-menu__text">Google Minesweeper</span>
              </Link>
              <Link className="menu__link link-menu" to="/tic-tac-toe/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/ti300jpg.webp" width="24" height="24" alt="Tic-Tac-Toe" /></picture></span>
                <span className="link-menu__text">Google Tic-Tac-Toe</span>
              </Link>
              <Link className="menu__link link-menu" to="/jerry-lawson/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/je300jpg.webp" width="24" height="24" alt="Jerry Lawson" /></picture></span>
                <span className="link-menu__text">Jerry Lawson Game</span>
              </Link>
              <Link className="menu__link link-menu" to="/garden-gnomes/" onClick={onClose}>
                <span className="link-menu__icon"><picture><img src="/assets/images/gg300jpg.webp" width="24" height="24" alt="Garden Gnomes" /></picture></span>
                <span className="link-menu__text">Garden Gnome</span>
              </Link>
              <Link className="menu__button button-more" to="/popular/" onClick={onClose}>
                <span className="button-more__icon"><img src="/assets/images/btn_more.svg" width="24" height="24" alt="Popular" /></span>
                <span className="button-more__text">Popular Google Games</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
