import { useState, useEffect, useCallback } from 'react';
import { Bird, birds } from '../data/birds';
import { ResultScreen } from './ResultScreen';

const QUESTIONS_PER_ROUND = 10;
const OPTIONS_COUNT = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getOptions(correct: Bird, all: Bird[]): string[] {
  const others = shuffle(all.filter((b) => b.id !== correct.id))
    .slice(0, OPTIONS_COUNT - 1)
    .map((b) => b.hebrewName);
  return shuffle([correct.hebrewName, ...others]);
}

interface GameProps {
  onQuit: () => void;
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export function Game({ onQuit }: GameProps) {
  const [questions] = useState<Bird[]>(() =>
    shuffle(birds).slice(0, QUESTIONS_PER_ROUND)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<{ bird: Bird; chosen: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const currentBird = questions[currentIndex];

  useEffect(() => {
    if (currentBird) {
      setOptions(getOptions(currentBird, birds));
      setSelected(null);
      setAnswerState('unanswered');
      setImageLoaded(false);
      setImageError(false);
    }
  }, [currentIndex, currentBird]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (answerState !== 'unanswered') return;
      setSelected(option);
      if (option === currentBird.hebrewName) {
        setAnswerState('correct');
        setScore((s) => s + 1);
      } else {
        setAnswerState('wrong');
        setWrongAnswers((prev) => [...prev, { bird: currentBird, chosen: option }]);
      }
    },
    [answerState, currentBird]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= QUESTIONS_PER_ROUND) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex]);

  const handleRestart = () => {
    window.location.reload();
  };

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={QUESTIONS_PER_ROUND}
        wrongAnswers={wrongAnswers}
        onRestart={handleRestart}
      />
    );
  }

  const getOptionClass = (option: string) => {
    if (answerState === 'unanswered') return 'option-btn';
    if (option === currentBird.hebrewName) return 'option-btn correct';
    if (option === selected) return 'option-btn wrong';
    return 'option-btn disabled';
  };

  return (
    <div className="game-screen">
      <header className="game-header">
        <button className="quit-btn" onClick={onQuit}>
          ← יציאה
        </button>
        <div className="progress-info">
          <span className="question-counter">
            שאלה {currentIndex + 1} / {QUESTIONS_PER_ROUND}
          </span>
          <span className="score-info">ניקוד: {score}</span>
        </div>
      </header>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_ROUND) * 100}%` }}
        />
      </div>

      <main className="game-main">
        <div className="bird-image-container">
          {!imageLoaded && !imageError && (
            <div className="image-placeholder">
              <span className="loading-spinner">⏳</span>
              <span>טוען תמונה...</span>
            </div>
          )}
          {imageError && (
            <div className="image-placeholder image-error">
              <span>🐦</span>
              <span>תמונה לא זמינה</span>
            </div>
          )}
          <img
            key={currentBird.id}
            src={currentBird.imageUrl}
            alt="איזו ציפור זו?"
            className={`bird-image ${imageLoaded ? 'visible' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(false); }}
          />
          {currentBird.seasonal && (
            <div className="seasonal-badge">
              {currentBird.seasonal === 'winter' ? '❄️ חורפת' : '☀️ מקייצת'}
            </div>
          )}
        </div>

        <p className="question-text">מה שם הציפור הזו?</p>

        <div className="options-grid">
          {options.map((option) => (
            <button
              key={option}
              className={getOptionClass(option)}
              onClick={() => handleAnswer(option)}
              disabled={answerState !== 'unanswered'}
            >
              {option}
            </button>
          ))}
        </div>

        {answerState !== 'unanswered' && (
          <div className={`feedback ${answerState}`}>
            {answerState === 'correct' ? (
              <>
                <div className="feedback-title">✅ נכון!</div>
                <div className="feedback-bird-name">{currentBird.hebrewName}</div>
                <div className="feedback-english">{currentBird.englishName}</div>
                <div className="feedback-fun-fact">💡 {currentBird.funFact}</div>
              </>
            ) : (
              <>
                <div className="feedback-title">❌ לא נכון</div>
                <div className="feedback-bird-name">
                  התשובה הנכונה: {currentBird.hebrewName}
                </div>
                <div className="feedback-english">{currentBird.englishName}</div>
                <div className="feedback-fun-fact">💡 {currentBird.funFact}</div>
              </>
            )}
            <button className="next-btn" onClick={handleNext}>
              {currentIndex + 1 >= QUESTIONS_PER_ROUND ? 'סיים משחק 🏁' : 'הבא ⬅️'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
