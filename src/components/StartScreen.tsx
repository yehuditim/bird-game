interface StartScreenProps {
  totalBirds: number;
  onStart: () => void;
}

export function StartScreen({ totalBirds, onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="bird-emoji">🦅</div>
        <h1>משחק זיהוי ציפורים בישראל</h1>
        <p className="subtitle">
          בדוק את הידע שלך על ציפורי ישראל!
        </p>
        <div className="stats-preview">
          <div className="stat">
            <span className="stat-number">{totalBirds}</span>
            <span className="stat-label">ציפורים במשחק</span>
          </div>
          <div className="stat">
            <span className="stat-number">10</span>
            <span className="stat-label">שאלות בכל סיבוב</span>
          </div>
          <div className="stat">
            <span className="stat-number">4</span>
            <span className="stat-label">אפשרויות בחירה</span>
          </div>
        </div>
        <p className="instructions">
          תראה תמונה של ציפור — בחר את שמה הנכון בעברית!
        </p>
        <button className="start-btn" onClick={onStart}>
          🎮 התחל משחק
        </button>
      </div>
    </div>
  );
}
