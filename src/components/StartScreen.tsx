import { useState } from 'react';
import { getLeaderboard } from '../utils/leaderboard';
import { Leaderboard } from './Leaderboard';

interface StartScreenProps {
  totalBirds: number;
  onStart: (playerName: string) => void;
}

export function StartScreen({ totalBirds, onStart }: StartScreenProps) {
  const [name, setName] = useState('');
  const [showBoard, setShowBoard] = useState(false);
  const board = getLeaderboard();

  if (showBoard) {
    return <Leaderboard onBack={() => setShowBoard(false)} />;
  }

  const handleStart = () => {
    onStart(name.trim() || 'אנונימי');
  };

  return (
    <div className="mm-screen">
      <div className="mm-rays" />

      <div className="mm-content">
        {/* Logo */}
        <div className="mm-logo-wrap">
          <div className="mm-logo-ring mm-ring-3" />
          <div className="mm-logo-ring mm-ring-2" />
          <div className="mm-logo-ring mm-ring-1" />
          <div className="mm-logo-icon">🦅</div>
        </div>

        {/* Title */}
        <h1 className="mm-title">זיהוי ציפורים</h1>
        <p className="mm-subtitle">ישראל</p>

        {/* Stats pills */}
        <div className="mm-pills">
          <div className="mm-pill">
            <span className="mm-pill-val">{totalBirds}</span>
            <span className="mm-pill-lbl">ציפורים</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">40</span>
            <span className="mm-pill-lbl">שאלות</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">3 ❤️</span>
            <span className="mm-pill-lbl">חיים</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">⏱</span>
            <span className="mm-pill-lbl">טיימר</span>
          </div>
        </div>

        {/* Name input */}
        <input
          className="mm-name-input"
          type="text"
          placeholder="שם השחקן (אופציונלי)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          maxLength={20}
        />

        {/* Start button */}
        <button className="mm-start-btn" onClick={handleStart}>
          <span className="mm-start-glow" />
          התחל לשחק
        </button>

        {/* Leaderboard link */}
        {board.length > 0 && (
          <button className="mm-board-link" onClick={() => setShowBoard(true)}>
            🏆 לוח תוצאות ({board.length} שחקנים)
          </button>
        )}

        <p className="mm-credit">מבוסס על מדריך ציפורי הבר בחצר ובגינה</p>
      </div>
    </div>
  );
}
