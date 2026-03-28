import { useState, useEffect, useCallback } from 'react';
import { GameQuestion, pickQuestions } from '../data/questions';
import { ResultScreen } from './ResultScreen';
import { playCorrect, playWrong } from '../utils/sounds';
import { Bird } from '../data/birds';

const TOTAL_QUESTIONS = 40;

type AnswerState = 'unanswered' | 'correct' | 'wrong';
interface WrongEntry { bird?: Bird; birdName: string; chosen: string; imageUrl?: string; }

interface GameProps { onQuit: () => void; }

export function Game({ onQuit }: GameProps) {
  const [questions] = useState<GameQuestion[]>(() => pickQuestions(TOTAL_QUESTIONS));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongEntry[]>([]);
  const [results, setResults] = useState<('correct' | 'wrong')[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    setSelected(null);
    setAnswerState('unanswered');
    setImgLoaded(false);
    setImgError(false);
  }, [idx]);

  const handleAnswer = useCallback(
    (opt: string) => {
      if (answerState !== 'unanswered') return;
      setSelected(opt);
      const correct = opt === q.answer;
      setAnswerState(correct ? 'correct' : 'wrong');
      if (correct) {
        setScore(s => s + 1);
        setResults(r => [...r, 'correct']);
        playCorrect();
      } else {
        setResults(r => [...r, 'wrong']);
        setWrongAnswers(w => [...w, {
          bird: q.bird,
          birdName: q.answer,
          chosen: opt,
          imageUrl: q.imageUrl,
        }]);
        playWrong();
      }
    },
    [answerState, q]
  );

  const handleNext = useCallback(() => {
    if (idx + 1 >= TOTAL_QUESTIONS) setFinished(true);
    else setIdx(i => i + 1);
  }, [idx]);

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={TOTAL_QUESTIONS}
        wrongAnswers={wrongAnswers}
        onRestart={() => window.location.reload()}
      />
    );
  }

  const optClass = (opt: string) => {
    if (answerState === 'unanswered') return 'opt-btn';
    if (opt === q.answer) return 'opt-btn state-correct';
    if (opt === selected)  return 'opt-btn state-wrong';
    return 'opt-btn state-dim';
  };

  const isIdentify = q.type === 'identify';

  return (
    <div className="game-screen">
      {/* Header */}
      <header className="game-header">
        <button className="quit-btn" onClick={onQuit}>← יציאה</button>
        <div className="progress-dots">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
            let cls = 'dot';
            if (i < results.length) cls = `dot answered-${results[i]}`;
            else if (i === idx) cls = 'dot current';
            return <span key={i} className={cls} />;
          })}
        </div>
        <div className="score-chip">⭐ {score}</div>
      </header>

      {/* Bird image — only for identify questions */}
      {isIdentify && q.imageUrl && (
        <div className="bird-image-wrap">
          {imgLoaded && (
            <div className="bird-image-blur" style={{ backgroundImage: `url(${q.imageUrl})` }} />
          )}
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
            key={q.id}
            src={q.imageUrl}
            alt="ציפור לזיהוי"
            className={`bird-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(false); }}
          />
          {q.bird?.seasonal && (
            <div className="seasonal-tag">
              {q.bird.seasonal === 'winter' ? '❄️ חורפת' : '☀️ מקייצת'}
            </div>
          )}
        </div>
      )}

      {/* Trivia banner */}
      {!isIdentify && (
        <div className="trivia-banner">
          <span className="trivia-icon">🧠</span>
          <span className="trivia-label">שאלת ידע</span>
        </div>
      )}

      {/* Body */}
      <div className="game-body">
        <p className="question-label">{q.questionText}</p>

        <div className="options-grid">
          {q.options.map(opt => (
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

        {/* Feedback */}
        {answerState !== 'unanswered' && (
          <div className={`feedback-panel ${answerState}`}>
            <div className="feedback-verdict">
              {answerState === 'correct' ? '✅ נכון!' : '❌ לא נכון'}
            </div>
            <div className="feedback-names">
              <div className="feedback-he">{q.answer}</div>
              {q.bird && <div className="feedback-en">{q.bird.englishName}</div>}
            </div>
            <div className="feedback-fact">💡 {q.explanation}</div>
            <button className="next-btn" onClick={handleNext}>
              {idx + 1 >= TOTAL_QUESTIONS ? '🏁 סיום המשחק' : 'הבא ←'}
            </button>
          </div>
        )}

        {/* Skip button — visible before answering */}
        {answerState === 'unanswered' && (
          <button className="skip-btn" onClick={handleNext}>
            דלג ←
          </button>
        )}
      </div>
    </div>
  );
}
