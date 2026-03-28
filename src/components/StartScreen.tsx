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

const AGE_DESCRIPTIONS: Record<AgeMode, string> = {
  '6-8': '2 אפשרויות · 20 שאלות · ללא טיימר',
  '9-11': '4 אפשרויות · 30 שאלות · 30 שניות',
  '12-15': '4 אפשרויות · 40 שאלות · 20 שניות',
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

        {/* Age mode picker */}
        <div className="age-picker">
          <p className="age-picker-label">בחר רמת קושי:</p>
          <div className="age-cards">
            {(['6-8', '9-11', '12-15'] as AgeMode[]).map(m => (
              <button
                key={m}
                className={`age-card${mode === m ? ' age-card-active' : ''}`}
                onClick={() => setMode(m)}
              >
                <span className="age-icon">{AGE_ICONS[m]}</span>
                <span className="age-range">{m}</span>
                <span className="age-lbl">{AGE_CONFIG[m].label}</span>
              </button>
            ))}
          </div>
          <p className="age-desc">{AGE_DESCRIPTIONS[mode]}</p>
        </div>

        {/* Stats pills */}
        <div className="mm-pills">
          <div className="mm-pill">
            <span className="mm-pill-val">{totalBirds}</span>
            <span className="mm-pill-lbl">ציפורים</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">{cfg.totalQuestions}</span>
            <span className="mm-pill-lbl">שאלות</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">{cfg.maxLives} ❤️</span>
            <span className="mm-pill-lbl">חיים</span>
          </div>
          <div className="mm-pill">
            <span className="mm-pill-val">{cfg.showTimer ? `${cfg.timerSeconds}s` : '∞'}</span>
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
