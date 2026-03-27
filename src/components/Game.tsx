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

type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface WrongEntry { bird: Bird; chosen: string; }

interface GameProps { onQuit: () => void; }

export function Game({ onQuit }: GameProps) {
  const [questions] = useState<Bird[]>(() =>
    shuffle(birds).slice(0, QUESTIONS_PER_ROUND)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongEntry[]>([]);
  const [results, setResults] = useState<('correct' | 'wrong')[]>([]);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];

  useEffect(() => {
    if (!current) return;
    setOptions(getOptions(current, birds));
    setSelected(null);
    setAnswerState('unanswered');
    setImgLoaded(false);
    setImgError(false);
  }, [currentIndex, current]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (answerState !== 'unanswered') return;
      setSelected(option);
      const isCorrect = option === current.hebrewName;
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setScore((s) => s + 1);
        setResults((r) => [...r, 'correct']);
      } else {
        setWrongAnswers((w) => [...w, { bird: current, chosen: option }]);
        setResults((r) => [...r, 'wrong']);
      }
    },
    [answerState, current]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= QUESTIONS_PER_ROUND) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex]);

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={QUESTIONS_PER_ROUND}
        wrongAnswers={wrongAnswers}
        onRestart={() => window.location.reload()}
      />
    );
  }

  const optClass = (opt: string) => {
    if (answerState === 'unanswered') return 'opt-btn';
    if (opt === current.hebrewName) return 'opt-btn state-correct';
    if (opt === selected)            return 'opt-btn state-wrong';
    return 'opt-btn state-dim';
  };

  return (
    <div className="game-screen">
      {/* ── Header ── */}
      <header className="game-header">
        <button className="quit-btn" onClick={onQuit}>← יציאה</button>

        <div className="progress-dots">
          {Array.from({ length: QUESTIONS_PER_ROUND }, (_, i) => {
            let cls = 'dot';
            if (i < results.length) cls = `dot answered-${results[i]}`;
            else if (i === currentIndex) cls = 'dot current';
            return <span key={i} className={cls} />;
          })}
        </div>

        <div className="score-chip">⭐ {score}</div>
      </header>

      {/* ── Bird image ── */}
      <div className="bird-image-wrap">
        {/* blurred background */}
        {imgLoaded && (
          <div
            className="bird-image-blur"
            style={{ backgroundImage: `url(${current.imageUrl})` }}
          />
        )}

        {/* skeleton */}
        {!imgLoaded && !imgError && (
          <div className="bird-img-skeleton">
            <span className="spin-icon">⏳</span>
            <span>טוען תמונה...</span>
          </div>
        )}
        {imgError && (
          <div className="bird-img-skeleton">
            <span style={{ fontSize: '2.5rem' }}>🐦</span>
            <span>תמונה לא זמינה</span>
          </div>
        )}

        <img
          key={current.id}
          src={current.imageUrl}
          alt="ציפור לזיהוי"
          className={`bird-img ${imgLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(false); }}
        />

        {current.seasonal && (
          <div className="seasonal-tag">
            {current.seasonal === 'winter' ? '❄️ חורפת' : '☀️ מקייצת'}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="game-body">
        <p className="question-label">מה שם הציפור הזו?</p>

        <div className="options-grid">
          {options.map((opt) => (
            <button
              key={opt}
              className={optClass(opt)}
              onClick={() => handleAnswer(opt)}
              disabled={answerState !== 'unanswered'}
            >
              {opt}
            </button>
          ))}
        </div>

        {answerState !== 'unanswered' && (
          <div className={`feedback-panel ${answerState}`}>
            <div className="feedback-verdict">
              {answerState === 'correct' ? '✅ נכון!' : '❌ לא נכון'}
            </div>

            <div className="feedback-names">
              <div className="feedback-he">{current.hebrewName}</div>
              <div className="feedback-en">{current.englishName}</div>
            </div>

            <div className="feedback-fact">💡 {current.funFact}</div>

            <button className="next-btn" onClick={handleNext}>
              {currentIndex + 1 >= QUESTIONS_PER_ROUND ? '🏁 סיום המשחק' : 'הבא ←'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
