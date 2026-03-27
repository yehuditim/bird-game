import { Bird } from '../data/birds';

interface ResultScreenProps {
  score: number;
  total: number;
  wrongAnswers: { bird: Bird; chosen: string }[];
  onRestart: () => void;
}

export function ResultScreen({ score, total, wrongAnswers, onRestart }: ResultScreenProps) {
  const percentage = Math.round((score / total) * 100);

  const getEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🎉';
    if (percentage >= 50) return '👍';
    return '📚';
  };

  const getMessage = () => {
    if (percentage >= 90) return 'מצוין! אתה צפרן מקצועי!';
    if (percentage >= 70) return 'כל הכבוד! ידע טוב בציפורים.';
    if (percentage >= 50) return 'לא רע! עוד קצת תרגול ותהיה מומחה.';
    return 'כדאי לצאת לצפות בציפורים יותר! 😄';
  };

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-emoji">{getEmoji()}</div>
        <h2>סיימת את המשחק!</h2>
        <p className="result-message">{getMessage()}</p>

        <div className="score-display">
          <span className="score-big">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>
        <div className="score-percentage">{percentage}%</div>

        <div className="score-bar-container">
          <div className="score-bar" style={{ width: `${percentage}%` }} />
        </div>

        {wrongAnswers.length > 0 && (
          <div className="wrong-answers">
            <h3>טעויות שכדאי לזכור:</h3>
            <div className="wrong-list">
              {wrongAnswers.map(({ bird, chosen }) => (
                <div key={bird.id} className="wrong-item">
                  <img src={bird.imageUrl} alt={bird.hebrewName} className="wrong-img" />
                  <div className="wrong-info">
                    <div className="wrong-correct">✅ {bird.hebrewName}</div>
                    <div className="wrong-chosen">❌ {chosen}</div>
                    <div className="wrong-english">{bird.englishName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="start-btn" onClick={onRestart}>
          🔄 שחק שוב
        </button>
      </div>
    </div>
  );
}
