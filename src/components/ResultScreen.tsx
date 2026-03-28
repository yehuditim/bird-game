import { useEffect, useRef, useState } from 'react';
import { GameQuestion } from '../data/questions';
import { saveScore } from '../utils/leaderboard';
import { Leaderboard } from './Leaderboard';

interface QuestionRecord {
  selected: string | null;
  timedOut: boolean;
  pointsEarned: number;
}

interface ResultScreenProps {
  playerName: string;
  score: number;
  correct: number;
  total: number;
  records: (QuestionRecord | null)[];
  questions: GameQuestion[];
  onRestart: () => void;
}

export function ResultScreen({
  playerName,
  score,
  correct,
  total,
  records,
  questions,
  onRestart,
}: ResultScreenProps) {
  const pct = Math.round((correct / total) * 100);
  const [barWidth, setBarWidth] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveScore({
      name: playerName,
      score,
      correct,
      total,
      date: new Date().toLocaleDateString('he-IL'),
    });
  }, [playerName, score, correct, total]);

  if (showBoard) {
    return <Leaderboard onBack={() => setShowBoard(false)} />;
  }

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
    pct >= 70 ? 'ידע טוב. עוד קצת ותהיה מומחה!' :
    pct >= 50 ? 'בסיס טוב. המשך לתרגל!' :
    'כדאי לצאת לצפות בציפורים יותר!';

  // Build wrong answers list
  const wrongAnswers = records
    .map((r, i) => ({ r, q: questions[i] }))
    .filter(({ r, q: qst }) => r !== null && (r.timedOut || r.selected !== qst?.answer))
    .map(({ r, q: qst }) => ({
      questionText: qst?.questionText ?? '',
      birdName: qst?.answer ?? '',
      chosen: r!.timedOut ? '(פג הזמן)' : r!.selected ?? '',
      imageUrl: qst?.imageUrl,
    }));

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-banner">
          <div className="result-trophy">{trophy}</div>
          <h2>{headline}</h2>
          <p className="result-tagline">{tagline}</p>
          <p className="result-player-name">שחקן: {playerName}</p>
        </div>

        <div className="result-score-section">
          <div className="result-score-row">
            <div className="score-fraction">
              <span className="score-num">{correct}</span>
              <span className="score-sep">/</span>
              <span className="score-denom">{total}</span>
            </div>
            <div className="score-points-big">
              <span>{score}</span>
              <span className="score-pts-lbl">נקודות</span>
            </div>
          </div>
          <div className="score-pct">{pct}% תשובות נכונות</div>
          <div className="result-bar-wrap">
            <div className="result-bar" style={{ width: `${barWidth}%` }} />
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="wrong-section">
            <div className="wrong-section-title">שגיאות לסקירה ({wrongAnswers.length})</div>
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
          <button className="btn-primary" onClick={onRestart}>🔄 שחק שוב</button>
          <button className="btn-secondary" onClick={() => setShowBoard(true)}>🏆 לוח תוצאות</button>
        </div>
      </div>
    </div>
  );
}
