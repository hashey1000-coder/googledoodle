export default function ControlsPanel({ game, show }) {
  if (!game.controls) return null;

  return (
    <div className="gp-controls" id="game-controls" style={{ display: show ? 'block' : 'none' }}>
      <h3 className="gp-controls__heading">
        <svg width="18" height="18" viewBox="0 0 24 16" fill="none" style={{ verticalAlign: 'middle', marginRight: 8 }}>
          <path d="M7.2 0.8C3.225 0.8 0 4.025 0 8C0 11.975 3.225 15.2 7.2 15.2H16.8C20.775 15.2 24 11.975 24 8C24 4.025 20.775 0.8 16.8 0.8H7.2ZM6.3 5.9C6.3 5.401 6.701 5 7.2 5C7.699 5 8.1 5.401 8.1 5.9V7.1H9.3C9.799 7.1 10.2 7.501 10.2 8C10.2 8.499 9.799 8.9 9.3 8.9H8.1V10.1C8.1 10.599 7.699 11 7.2 11C6.701 11 6.3 10.599 6.3 10.1V8.9H5.1C4.601 8.9 4.2 8.499 4.2 8C4.2 7.501 4.601 7.1 5.1 7.1H6.3V5.9Z" fill="currentColor"/>
        </svg>
        How to Play {game.title}
      </h3>
      <div className="gp-controls__body" dangerouslySetInnerHTML={{ __html: game.controls }} />
    </div>
  );
}
