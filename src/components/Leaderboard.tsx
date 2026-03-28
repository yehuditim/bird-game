import { getLeaderboard } from '../utils/leaderboard';

interface LeaderboardProps {
  onBack: () => void;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const board = getLeaderboard();

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="mm-screen">
      <div className="mm-rays" />
      <div className="leaderboard-wrap">
        <h2 className="lb-title">🏆 לוח תוצאות</h2>

        {board.length === 0 ? (
          <p className="lb-empty">עדיין אין תוצאות — היה הראשון!</p>
        ) : (
          <div className="lb-list">
            {board.map((entry, i) => (
              <div key={i} className={`lb-row ${i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : ''}`}>
                <span className="lb-rank">{medals[i] ?? `${i + 1}.`}</span>
                <span className="lb-name">{entry.name}</span>
                <div className="lb-right">
                  <span className="lb-score">{entry.score} נק׳</span>
                  <span className="lb-detail">{entry.correct}/{entry.total} ✓</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="mm-back-btn" onClick={onBack}>← חזרה</button>
      </div>
    </div>
  );
}
