interface StartScreenProps {
  totalBirds: number;
  onStart: () => void;
}

export function StartScreen({ totalBirds, onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="bird-hero">🦅</div>

        <h1>זיהוי ציפורים בישראל</h1>
        <p className="start-subtitle">
          כמה ציפורים ישראליות תוכלי לזהות?
        </p>

        <div className="stats-row">
          <div className="stat-cell">
            <span className="stat-num">{totalBirds}</span>
            <span className="stat-lbl">ציפורים</span>
          </div>
          <div className="stat-cell">
            <span className="stat-num">10</span>
            <span className="stat-lbl">שאלות</span>
          </div>
          <div className="stat-cell">
            <span className="stat-num">4</span>
            <span className="stat-lbl">אפשרויות</span>
          </div>
        </div>

        <div className="how-to">
          <span className="how-icon">🔍</span>
          <span className="how-text">
            תראי תמונה של ציפור — בחרי את שמה הנכון בעברית.
            אחרי כל תשובה תקבלי עובדה מעניינת!
          </span>
        </div>

        <button className="start-btn" onClick={onStart}>
          התחילי לשחק
        </button>

        <p className="start-credit">מבוסס על מדריך ציפורי הבר בחצר ובגינה</p>
      </div>
    </div>
  );
}
