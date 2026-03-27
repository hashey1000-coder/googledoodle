import { useState, useEffect } from 'react';
import {
  ref, onValue, runTransaction,
} from 'firebase/database';
import { db, firebaseReady } from '../utils/firebase';

export default function ActionBar({ game, playing, onFullscreen, onToggleControls }) {
  const slug = game.slug;

  // ── local state ──────────────────────────────────────────────
  const [likes,    setLikes]    = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'like' | 'dislike' | null
  const [loading,  setLoading]  = useState(true);

  // ── Realtime Database live listener ─────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`vote_${slug}`);
    if (stored === 'like' || stored === 'dislike') setUserVote(stored);
    else setUserVote(null);

    if (!firebaseReady) {
      setLikes(0); setDislikes(0); setLoading(false);
      return;
    }

    const ratingRef = ref(db, `ratings/${slug}`);
    const unsub = onValue(ratingRef, (snap) => {
      const data = snap.val();
      setLikes(data?.likes    ?? 0);
      setDislikes(data?.dislikes ?? 0);
      setLoading(false);
    }, () => { setLoading(false); }); // fail silently

    return () => unsub();
  }, [slug]);

  // ── vote handler ─────────────────────────────────────────────
  const handleVote = async (type) => {
    if (loading) return;
    const prevVote = userVote;

    // Optimistic UI update
    if (prevVote === type) {
      type === 'like' ? setLikes(l => Math.max(0, l - 1)) : setDislikes(d => Math.max(0, d - 1));
      localStorage.removeItem(`vote_${slug}`); setUserVote(null);
    } else {
      if (prevVote) prevVote === 'like' ? setLikes(l => Math.max(0, l - 1)) : setDislikes(d => Math.max(0, d - 1));
      type === 'like' ? setLikes(l => l + 1) : setDislikes(d => d + 1);
      localStorage.setItem(`vote_${slug}`, type); setUserVote(type);
    }

    if (!firebaseReady) return;

    // Atomic transaction in RTDB
    const ratingRef = ref(db, `ratings/${slug}`);
    await runTransaction(ratingRef, (current) => {
      const data = current ?? { likes: 0, dislikes: 0 };
      if (prevVote === type) {
        // Toggle off
        data[type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (data[type === 'like' ? 'likes' : 'dislikes'] ?? 0) - 1);
      } else {
        if (prevVote) {
          const old = prevVote === 'like' ? 'likes' : 'dislikes';
          data[old] = Math.max(0, (data[old] ?? 0) - 1);
        }
        data[type === 'like' ? 'likes' : 'dislikes'] = (data[type === 'like' ? 'likes' : 'dislikes'] ?? 0) + 1;
      }
      return data;
    });
  };

  // ── derived ──────────────────────────────────────────────────
  const total      = likes + dislikes;
  const ratingPct  = total > 0 ? Math.round((likes / total) * 100) : 50;

  // ── utility handlers ─────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: game.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
    }
  };

  return (
    <div className="gp-actions">
      <div className="gp-actions__left">

        <button
          className={`gp-vote${userVote === 'like' ? ' active-like' : ''}`}
          onClick={() => handleVote('like')}
          disabled={loading}
          title="Like"
        >
          <svg viewBox="0 0 24 24">
            <path d="M21 8c1.1 0 2 .9 2 2l-.01.08L23 10.09V12c0 .26-.05.5-.14.73l-3.02 7.05c-.3.72-1.01 1.22-1.84 1.22H9c-1.1 0-2-.9-2-2V9c0-.55.22-1.05.59-1.41L14.17 1l1.06 1.05c.27.27.44.65.44 1.06l-.03.32L14.69 8H21zM5 21H1V9h4v12z"/>
          </svg>
          <span>{loading ? '…' : likes.toLocaleString()}</span>
        </button>

        <button
          className={`gp-vote${userVote === 'dislike' ? ' active-dislike' : ''}`}
          onClick={() => handleVote('dislike')}
          disabled={loading}
          title="Dislike"
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 3h9c1.1 0 2 .9 2 2v10c0 .55-.22 1.05-.58 1.41L9.83 23l-1.06-1.05c-.27-.27-.44-.65-.44-1.06l.03-.32.95-4.57H3c-1.1 0-2-.9-2-2l.01-.08L1 13.91V12c0-.26.05-.5.14-.73l3.02-7.05C4.46 3.5 5.17 3 6 3zm13 12V3h4v12h-4z"/>
          </svg>
          <span>{loading ? '…' : dislikes.toLocaleString()}</span>
        </button>

      </div>

      {!loading && total > 0 && (
        <div className="gp-bar">
          <div className="gp-bar__track">
            <div className="gp-bar__fill" style={{ width: `${ratingPct}%` }} />
          </div>
        </div>
      )}

      <div className="gp-actions__right">
        {game.controls && (
          <button className="gp-btn" onClick={onToggleControls} title="How to Play">
            <svg viewBox="0 0 24 16" fill="none">
              <path d="M7.2 0.8C3.225 0.8 0 4.025 0 8C0 11.975 3.225 15.2 7.2 15.2H16.8C20.775 15.2 24 11.975 24 8C24 4.025 20.775 0.8 16.8 0.8H7.2ZM6.3 5.9C6.3 5.401 6.701 5 7.2 5C7.699 5 8.1 5.401 8.1 5.9V7.1H9.3C9.799 7.1 10.2 7.501 10.2 8C10.2 8.499 9.799 8.9 9.3 8.9H8.1V10.1C8.1 10.599 7.699 11 7.2 11C6.701 11 6.3 10.599 6.3 10.1V8.9H5.1C4.601 8.9 4.2 8.499 4.2 8C4.2 7.501 4.601 7.1 5.1 7.1H6.3V5.9Z" fill="currentColor"/>
            </svg>
            <span>Controls</span>
          </button>
        )}

        <button className="gp-btn" onClick={handleShare} title="Share">
          <svg viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>
          </svg>
          <span>Share</span>
        </button>

        {playing && (
          <button className="gp-btn gp-btn--fullscreen" onClick={onFullscreen} title="Fullscreen">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M14 10l7-7M21 3h-6M21 3v6M10 14l-7 7M3 21h6M3 21v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Fullscreen</span>
          </button>
        )}
      </div>
    </div>
  );
}
