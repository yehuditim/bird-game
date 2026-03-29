import { useEffect, useRef, useState } from 'react';
import { GameQuestion } from '../data/questions';
import { saveScore } from '../utils/leaderboard';
import { Leaderboard } from './Leaderboard';
import { AgeMode } from '../types/ageMode';

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
  ageMode: AgeMode;
  onRestart: () => void;
}

export function ResultScreen({
  playerName,
  score,
  correct,
  total,
  records,
  questions,
  ageMode,
  onRestart,
}: ResultScreenProps) {
  const pct = Math.round((correct / total) * 100);
  const [barWidth, setBarWidth] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const saved = useRef(false);
  const isYoung = ageMode === '6-8';

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

  // ── Young kids (6-8): simple celebration screen ──────────────────────────
  if (isYoung) {
    const youngTrophy = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '🌟' : '🐣';
    const youngHeadline =
      pct >= 80 ? 'וואו! מדהים!' :
      pct >= 60 ? 'כל הכבוד!' :
      pct >= 40 ? 'יופי, המשך לנסות!' :
      'בפעם הבאה תצליח!';
    const youngMsg =
      pct >= 80 ? `זיהית ${correct} ציפורים! אתה צפרן אמיתי! 🦅` :
      pct >= 60 ? `זיהית ${correct} מתוך ${total} ציפורים!` :
      pct >= 40 ? `זיהית ${correct} ציפורים. תמשיך לתרגל!` :
      `זיהית ${correct} ציפורים. שחק עוד פעם ותשתפר!`;

    return (
      <div className="result-screen">
        <div className="result-card">
          <div className="result-banner" style={{ paddingBottom: 28 }}>
            <div className="result-trophy" style={{ fontSize: 80 }}>{youngTrophy}</div>
            <h2 style={{ fontSize: '1.7rem' }}>{youngHeadline}</h2>
            <p className="result-tagline" style={{ fontSize: '1rem', marginTop: 8 }}>{youngMsg}</p>
          </div>

          <div className="result-score-section">
            <div className="result-score-row">
              <div className="score-fraction">
                <span className="score-num">{correct}</span>
                <span className="score-sep">/</span>
                <span className="score-denom">{total}</span>
              </div>
            </div>
            <div className="result-bar-wrap" style={{ marginTop: 12 }}>
              <div className="result-bar" style={{ width: `${barWidth}%` }} />
            </div>
          </div>

          <div className="result-actions">
            <button
              className="btn-primary"
              onClick={onRestart}
              style={{ fontSize: '1.15rem', padding: '17px' }}
            >
              🔄 שחק שוב!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Older kids (9-15): full result screen ────────────────────────────────
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

  const wrongAnswers = records
    .map((r, i) => ({ r, q: questions[i] }))
    .filter(({ r, q: qst }) => r !== null && (r.timedOut || r.selected !== qst?.answer))
    .map(({ r, q: qst }) => ({
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
