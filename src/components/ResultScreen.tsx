import { useEffect, useRef, useState } from 'react';

interface WrongEntry {
  birdName: string;
  chosen: string;
  imageUrl?: string;
}

interface ResultScreenProps {
  score: number;
  total: number;
  wrongAnswers: WrongEntry[];
  onRestart: () => void;
}

export function ResultScreen({ score, total, wrongAnswers, onRestart }: ResultScreenProps) {
  const pct = Math.round((score / total) * 100);
  const [barWidth, setBarWidth] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    const t = setTimeout(() => setBarWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const trophy =
    pct >= 90 ? '🏆' :
    pct >= 70 ? '🎉' :
    pct >= 50 ? '🌿' : '📚';

  const headline =
    pct >= 90 ? 'צפרן מקצועי!' :
    pct >= 70 ? 'כל הכבוד!' :
    pct >= 50 ? 'לא רע בכלל!' :
    'יש מה ללמוד 😊';

  const tagline =
    pct >= 90 ? 'ידע ציפורים מדהים — כמעט מושלם!' :
    pct >= 70 ? 'ידע טוב. עוד קצת ותהיי מומחית!' :
    pct >= 50 ? 'בסיס טוב. המשיכי לתרגל!' :
    'כדאי לצאת לצפות בציפורים יותר!';

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-banner">
          <div className="result-trophy">{trophy}</div>
          <h2>{headline}</h2>
          <p className="result-tagline">{tagline}</p>
        </div>

        <div className="result-score-section">
          <div className="score-fraction">
            <span className="score-num">{score}</span>
            <span className="score-sep">/</span>
            <span className="score-denom">{total}</span>
          </div>
          <div className="score-pct">{pct}% תשובות נכונות</div>
          <div className="result-bar-wrap">
            <div className="result-bar" style={{ width: `${barWidth}%` }} />
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="wrong-section">
            <div className="wrong-section-title">שגיאות לסקירה</div>
            <div className="wrong-list">
              {wrongAnswers.map((w, i) => (
                <div key={i} className="wrong-row">
                  {w.imageUrl ? (
                    <img
                      src={w.imageUrl}
                      alt={w.birdName}
                      className="wrong-thumb"
                      onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                  ) : (
                    <div className="wrong-thumb-placeholder">🧠</div>
                  )}
                  <div className="wrong-details">
                    <div className="wrong-correct-name">✅ {w.birdName}</div>
                    <div className="wrong-chosen-name">❌ {w.chosen}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions">
          <button className="btn-primary" onClick={onRestart}>🔄 שחקי שוב</button>
        </div>
      </div>
    </div>
  );
}
