import { useState, useEffect, useCallback, useRef } from 'react';
import { GameQuestion, pickQuestions } from '../data/questions';
import { ResultScreen } from './ResultScreen';
import { playCorrect, playWrong } from '../utils/sounds';

const TOTAL_QUESTIONS  = 40;
const TIMER_SECONDS    = 20;
const BASE_POINTS      = 10;
const SPEED_BONUS      = 5;
const INITIAL_LIVES    = 3;

interface QuestionRecord {
  selected: string | null;
  timedOut: boolean;
  pointsEarned: number;
  streakAtAnswer: number;   // streak value BEFORE this answer — determines displayed multiplier
}

interface GameProps {
  playerName: string;
  onQuit: () => void;
}

const OPTION_LETTERS = ['א', 'ב', 'ג', 'ד'];

/** Streak → point multiplier */
function streakMult(s: number): number {
  return s >= 8 ? 3 : s >= 5 ? 2 : s >= 3 ? 1.5 : 1;
}

export function Game({ playerName, onQuit }: GameProps) {
  const [questions]    = useState<GameQuestion[]>(() => pickQuestions(TOTAL_QUESTIONS));
  const [records, setRecords] = useState<(QuestionRecord | null)[]>(
    () => Array(TOTAL_QUESTIONS).fill(null)
  );

  const [viewIdx, setViewIdx] = useState(0);   // displayed question
  const [maxIdx,  setMaxIdx]  = useState(0);   // furthest reached

  const [lives,       setLives]       = useState(INITIAL_LIVES);
  const [totalScore,  setTotalScore]  = useState(0);
  const [correctCount,setCorrectCount]= useState(0);
  const [streak,      setStreak]      = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(TIMER_SECONDS);
  const [flashState,  setFlashState]  = useState<'correct' | 'wrong' | null>(null);
  const [imgLoaded,   setImgLoaded]   = useState(false);
  const [imgError,    setImgError]    = useState(false);
  const [finished,    setFinished]    = useState(false);

  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxIdxRef = useRef(0);

  // ── Derived ───────────────────────────────────────────────────────────────
  const q          = questions[viewIdx];
  const record     = records[viewIdx];
  const maxRecord  = records[maxIdx];
  const isCurrentQ = viewIdx === maxIdx;
  const isAnswered = record !== null;
  const isBonusQ   = !!q.isBonus;
  const hasImages  = !!q.optionImages;

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    maxIdxRef.current = maxIdx;
    setTimeLeft(TIMER_SECONDS);
  }, [maxIdx]);

  useEffect(() => {
    if (!isCurrentQ || maxRecord !== null || finished) return;
    if (timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, isCurrentQ, maxRecord, finished]);

  // ── Timeout ───────────────────────────────────────────────────────────────
  const handleTimeout = useCallback(() => {
    const idx = maxIdxRef.current;
    setRecords(prev => {
      if (prev[idx] !== null) return prev;
      const next = [...prev];
      next[idx] = { selected: null, timedOut: true, pointsEarned: 0, streakAtAnswer: 0 };
      return next;
    });
    setStreak(0);
    setLives(l => {
      const nl = l - 1;
      if (nl <= 0) setTimeout(() => setFinished(true), 1200);
      return nl;
    });
    setFlashState('wrong');
    setTimeout(() => setFlashState(null), 500);
    playWrong();
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && isCurrentQ && maxRecord === null && !finished) {
      handleTimeout();
    }
  }, [timeLeft, isCurrentQ, maxRecord, finished, handleTimeout]);

  // ── Image reset ───────────────────────────────────────────────────────────
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [viewIdx]);

  // ── Answer ────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((opt: string) => {
    if (!isCurrentQ || maxRecord !== null) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const correct = opt === q.answer;
    const currentMult = streakMult(streak);   // multiplier earned by existing streak
    let points = 0;

    if (correct) {
      const speedBonus = Math.round((timeLeft / TIMER_SECONDS) * SPEED_BONUS);
      points = Math.round((BASE_POINTS + speedBonus) * currentMult * (isBonusQ ? 2 : 1));
      setTotalScore(s => s + points);
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
      playCorrect();
    } else {
      setStreak(0);
      setLives(l => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => setFinished(true), 1200);
        return nl;
      });
      playWrong();
    }

    setFlashState(correct ? 'correct' : 'wrong');
    setTimeout(() => setFlashState(null), 500);

    setRecords(prev => {
      const next = [...prev];
      next[maxIdx] = { selected: opt, timedOut: false, pointsEarned: points, streakAtAnswer: streak };
      return next;
    });
  }, [isCurrentQ, maxRecord, q, timeLeft, isBonusQ, maxIdx, streak]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (viewIdx < maxIdx) {
      setViewIdx(v => v + 1);
    } else {
      if (maxIdx + 1 >= TOTAL_QUESTIONS) {
        setFinished(true);
      } else {
        const next = maxIdx + 1;
        setMaxIdx(next);
        setViewIdx(next);
      }
    }
  }, [viewIdx, maxIdx]);

  const goBack = useCallback(() => {
    if (viewIdx > 0) setViewIdx(v => v - 1);
  }, [viewIdx]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStreak(0);
    setRecords(prev => {
      const next = [...prev];
      if (next[maxIdx] === null)
        next[maxIdx] = { selected: null, timedOut: false, pointsEarned: 0, streakAtAnswer: 0 };
      return next;
    });
    if (maxIdx + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
    } else {
      const next = maxIdx + 1;
      setMaxIdx(next);
      setViewIdx(next);
    }
  }, [maxIdx]);

  // ── Finish ────────────────────────────────────────────────────────────────
  if (finished) {
    return (
      <ResultScreen
        playerName={playerName}
        score={totalScore}
        correct={correctCount}
        total={TOTAL_QUESTIONS}
        records={records}
        questions={questions}
        onRestart={() => window.location.reload()}
      />
    );
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const timerPct   = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? '#16a34a' : timeLeft > 5 ? '#f59e0b' : '#dc2626';

  const getOptClass = (opt: string) => {
    if (!isAnswered) return hasImages ? 'opt-btn visual-card' : 'opt-btn';
    const base = hasImages ? 'opt-btn visual-card' : 'opt-btn';
    if (opt === q.answer)       return `${base} state-correct`;
    if (record?.selected === opt) return `${base} state-wrong`;
    return `${base} state-dim`;
  };

  const answerState =
    !isAnswered             ? 'unanswered'
    : record!.selected === q.answer ? 'correct'
    : 'wrong';

  const isReviewing = !isCurrentQ;
  const isIdentify  = q.type === 'identify';

  const dotStatuses = records.map((r, i) => {
    if (r === null) return null;
    if (r.timedOut || r.selected === null) return 'skipped';
    return r.selected === questions[i]?.answer ? 'correct' : 'wrong';
  });

  // ── Streak display ────────────────────────────────────────────────────────
  const streakLabel =
    streak >= 8 ? `🔥${streak} ×3` :
    streak >= 5 ? `🔥${streak} ×2` :
    streak >= 3 ? `🔥${streak} ×1.5` : null;

  return (
    <div className={`game-screen${isBonusQ && !isAnswered ? ' bonus-active' : ''}`}>

      {/* Screen flash overlay */}
      {flashState && <div className={`screen-flash screen-flash-${flashState}`} />}

      {/* ── Header ── */}
      <header className="game-header">
        <button className="quit-btn" onClick={onQuit}>✕</button>

        <div className="header-center">
          <div className="progress-dots">
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
              const status = dotStatuses[i];
              let cls = 'dot';
              if (status === 'correct')  cls = 'dot answered-correct';
              else if (status === 'wrong')   cls = 'dot answered-wrong';
              else if (status === 'skipped') cls = 'dot answered-skipped';
              else if (i === viewIdx)        cls = 'dot current';
              return (
                <span
                  key={i}
                  className={cls}
                  onClick={() => i <= maxIdx ? setViewIdx(i) : undefined}
                  style={{ cursor: i <= maxIdx ? 'pointer' : 'default' }}
                />
              );
            })}
          </div>
        </div>

        <div className="header-right">
          <div className="lives-row">
            {Array.from({ length: INITIAL_LIVES }, (_, i) => (
              <span key={i} className={`life-icon ${i < lives ? 'alive' : 'dead'}`}>❤️</span>
            ))}
          </div>
          <div className="header-scores">
            {streakLabel && (
              <div className={`streak-chip ${streak >= 8 ? 'streak-max' : streak >= 5 ? 'streak-high' : ''}`}>
                {streakLabel}
              </div>
            )}
            <div className="score-chip">⭐ {totalScore}</div>
          </div>
        </div>
      </header>

      {/* ── Timer bar (current unanswered only) ── */}
      {isCurrentQ && !isAnswered && (
        <div className="timer-bar-wrap">
          <div
            className="timer-bar"
            style={{ width: `${timerPct}%`, background: timerColor, transition: 'width 1s linear, background 0.5s' }}
          />
          <span className="timer-label" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
      )}

      {/* ── Reviewing banner ── */}
      {isReviewing && (
        <div className="review-banner">
          ← מצב סקירה | שאלה {viewIdx + 1} מתוך {maxIdx + 1}
        </div>
      )}

      {/* ── Bonus badge ── */}
      {isBonusQ && <div className="bonus-badge">⭐ שאלת בונוס — ×2 נקודות!</div>}

      {/* ── Bird image (identify questions only) ── */}
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

      {/* ── Trivia / compare banner ── */}
      {!isIdentify && (
        <div className="trivia-banner">
          <span className="trivia-icon">{hasImages ? '📐' : '🧠'}</span>
          <span className="trivia-label">{hasImages ? 'שאלת זיהוי חזותי' : 'שאלת ידע'}</span>
        </div>
      )}

      {/* ── Timeout notice ── */}
      {isAnswered && record!.timedOut && (
        <div className="timeout-notice">⏰ הזמן נגמר!</div>
      )}

      {/* ── Body ── */}
      <div className="game-body">
        <p className="question-label">
          <span className="q-number">שאלה {viewIdx + 1}</span>
          {q.questionText}
        </p>

        {/* ── Options: visual bird cards or text buttons ── */}
        {hasImages ? (
          <div className="options-grid options-visual">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                className={getOptClass(opt)}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered || isReviewing}
              >
                <div className="bird-card-img-wrap">
                  <img
                    src={q.optionImages![opt]}
                    alt={opt}
                    className="bird-card-img"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                </div>
                <div className="bird-card-label">
                  <span className="opt-letter">{OPTION_LETTERS[i]}</span>
                  <span className="opt-text">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="options-grid">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                className={getOptClass(opt)}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered || isReviewing}
              >
                <span className="opt-letter">{OPTION_LETTERS[i]}</span>
                <span className="opt-text">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Feedback ── */}
        {isAnswered && (
          <div className={`feedback-panel ${record!.timedOut ? 'wrong' : answerState}`}>
            <div className="feedback-verdict">
              {record!.timedOut
                ? '⏰ פג הזמן!'
                : answerState === 'correct'
                  ? `✅ נכון! +${record!.pointsEarned}${isBonusQ ? ' 🌟' : ''}${streakMult(record!.streakAtAnswer) > 1 ? ` 🔥×${streakMult(record!.streakAtAnswer)}` : ''}`
                  : '❌ לא נכון'}
            </div>
            <div className="feedback-names">
              <div className="feedback-he">{q.answer}</div>
              {q.bird && <div className="feedback-en">{q.bird.englishName}</div>}
            </div>
            <div className="feedback-fact">💡 {q.explanation}</div>
            <button className="next-btn" onClick={goNext}>
              {viewIdx < maxIdx
                ? 'הבא ←'
                : maxIdx + 1 >= TOTAL_QUESTIONS
                ? '🏁 סיום המשחק'
                : 'הבא ←'}
            </button>
          </div>
        )}

        {/* ── Controls (skip / back) ── */}
        {!isAnswered && isCurrentQ && (
          <div className="controls-row">
            <button className="back-btn" onClick={goBack} disabled={viewIdx === 0}>
              ← קודמת
            </button>
            <button className="skip-btn" onClick={handleSkip}>
              דלג ←
            </button>
          </div>
        )}

        {isReviewing && (
          <div className="controls-row">
            <button className="back-btn" onClick={goBack} disabled={viewIdx === 0}>
              ← קודמת
            </button>
            {!isAnswered && (
              <button className="next-btn-sm" onClick={goNext}>
                {viewIdx < maxIdx ? 'הבאה ←' : 'לשאלה הנוכחית ←'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
