import { useState } from 'react';
import { getLeaderboard } from '../utils/leaderboard';
import { Leaderboard } from './Leaderboard';
import { AgeMode, AGE_CONFIG } from '../types/ageMode';

interface StartScreenProps {
  totalBirds: number;
  onStart: (playerName: string, mode: AgeMode) => void;
}

const AGE_ICONS: Record<AgeMode, string> = {
  '6-8': '🐣',
  '9-11': '🐦',
  '12-15': '🦅',
};

const AGE_TITLES: Record<AgeMode, string> = {
  '6-8': 'מתחיל',
  '9-11': 'חוקר',
  '12-15': 'מומחה',
};

const AGE_DESCRIPTIONS: Record<AgeMode, string> = {
  '6-8': '2 אפשרויות · ללא טיימר · 20 שאלות',
  '9-11': '4 אפשרויות · 30 שניות · 30 שאלות',
  '12-15': '4 אפשרויות · 20 שניות · 40 שאלות',
};

const AGE_STARS: Record<AgeMode, number> = {
  '6-8': 1,
  '9-11': 2,
  '12-15': 3,
};

export function StartScreen({ totalBirds, onStart }: StartScreenProps) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<AgeMode>('9-11');
  const [showBoard, setShowBoard] = useState(false);
  const board = getLeaderboard();

  if (showBoard) {
    return <Leaderboard onBack={() => setShowBoard(false)} />;
  }

  const handleStart = () => {
    onStart(name.trim() || 'אנונימי', mode);
  };

  const cfg = AGE_CONFIG[mode];

  return (
    <div className="gs-screen">
      {/* Animated star field */}
      <div className="gs-stars" />
      <div className="gs-stars gs-stars-2" />

      {/* Floating bird decorations */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`gs-float-bird gs-float-bird-${i}`}>🐦</div>
      ))}

      <div className="gs-content">
        {/* Hero eagle */}
        <div className="gs-hero-wrap">
          <div className="gs-hero-glow" />
          <div className="gs-hero-rings">
            <div className="gs-ring gs-ring-3" />
            <div className="gs-ring gs-ring-2" />
            <div className="gs-ring gs-ring-1" />
          </div>
          <div className="gs-hero-icon">🦅</div>
        </div>

        {/* Title */}
        <h1 className="gs-title">זיהוי ציפורים</h1>
        <p className="gs-subtitle">ישראל</p>
        <p className="gs-tagline">האם אתה מכיר את ציפורי ישראל?</p>

        {/* Age level cards */}
        <div className="gs-level-section">
          <p className="gs-level-label">בחר רמה:</p>
          <div className="gs-level-cards">
            {(['6-8', '9-11', '12-15'] as AgeMode[]).map(m => (
              <button
                key={m}
                className={`gs-level-card${mode === m ? ' gs-level-card-active' : ''}`}
                onClick={() => setMode(m)}
              >
                <span className="gs-level-icon">{AGE_ICONS[m]}</span>
                <span className="gs-level-title">{AGE_TITLES[m]}</span>
                <span className="gs-level-range">{m}</span>
                <span className="gs-level-stars">
                  {'★'.repeat(AGE_STARS[m])}{'☆'.repeat(3 - AGE_STARS[m])}
                </span>
              </button>
            ))}
          </div>
          <p className="gs-level-desc">{AGE_DESCRIPTIONS[mode]}</p>
        </div>

        {/* Stats pills */}
        <div className="gs-pills">
          <div className="gs-pill">
            <span className="gs-pill-val">{totalBirds}</span>
            <span className="gs-pill-lbl">ציפורים</span>
          </div>
          <div className="gs-pill">
            <span className="gs-pill-val">{cfg.totalQuestions}</span>
            <span className="gs-pill-lbl">שאלות</span>
          </div>
          <div className="gs-pill">
            <span className="gs-pill-val">{cfg.maxLives}❤️</span>
            <span className="gs-pill-lbl">חיים</span>
          </div>
          <div className="gs-pill">
            <span className="gs-pill-val">{cfg.showTimer ? `${cfg.timerSeconds}s` : '∞'}</span>
            <span className="gs-pill-lbl">טיימר</span>
          </div>
        </div>

        {/* Name input */}
        <input
          className="gs-name-input"
          type="text"
          placeholder="שם השחקן (אופציונלי)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          maxLength={20}
        />

        {/* Start button */}
        <button className="gs-start-btn" onClick={handleStart}>
          <span className="gs-start-shimmer" />
          <span className="gs-start-text">▶ התחל לשחק</span>
        </button>

        {/* Leaderboard link */}
        {board.length > 0 && (
          <button className="gs-board-link" onClick={() => setShowBoard(true)}>
            🏆 לוח תוצאות ({board.length} שחקנים)
          </button>
        )}

        {/* Creator credit */}
        <p className="gs-creator">יצרה: יהודית מנדלבאום</p>
      </div>
    </div>
  );
}
