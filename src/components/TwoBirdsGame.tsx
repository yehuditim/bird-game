import { useState, useCallback } from 'react';
import { birds, Bird } from '../data/birds';
import { playCorrect, playWrong } from '../utils/sounds';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SIZE_ORDER: Record<string, number> = { small: 0, medium: 1, large: 2 };

interface TBQuestion {
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

function buildQuestions(a: Bird, b: Bird): TBQuestion[] {
  const otherNames = shuffle(
    birds.map(b => b.hebrewName).filter(n => n !== a.hebrewName && n !== b.hebrewName)
  );
  const qs: TBQuestion[] = [];

  // 1. Name of bird A
  qs.push({
    text: 'מה שם ציפור א?',
    options: shuffle([a.hebrewName, b.hebrewName, otherNames[0], otherNames[1]]),
    answer: a.hebrewName,
    explanation: `ציפור א היא ${a.hebrewName}. ${a.funFact}`,
  });

  // 2. Name of bird B
  qs.push({
    text: 'מה שם ציפור ב?',
    options: shuffle([a.hebrewName, b.hebrewName, otherNames[2], otherNames[3]]),
    answer: b.hebrewName,
    explanation: `ציפור ב היא ${b.hebrewName}. ${b.funFact}`,
  });

  // 3. Size comparison (always included)
  const sizeA = SIZE_ORDER[a.size];
  const sizeB = SIZE_ORDER[b.size];
  let sizeAnswer: string;
  let sizeExplain: string;
  if (sizeA > sizeB) {
    sizeAnswer = 'ציפור א';
    sizeExplain = `${a.hebrewName} גדולה יותר מ-${b.hebrewName}!`;
  } else if (sizeB > sizeA) {
    sizeAnswer = 'ציפור ב';
    sizeExplain = `${b.hebrewName} גדולה יותר מ-${a.hebrewName}!`;
  } else {
    sizeAnswer = 'שתיהן שוות';
    sizeExplain = `${a.hebrewName} ו-${b.hebrewName} הן בערך באותו גודל.`;
  }
  qs.push({
    text: 'איזו ציפור גדולה יותר?',
    options: shuffle(['ציפור א', 'ציפור ב', 'שתיהן שוות']),
    answer: sizeAnswer,
    explanation: sizeExplain,
  });

  // 4. Resident vs visitor (if different)
  if (!a.seasonal !== !b.seasonal) {
    const isAResident = !a.seasonal;
    const residentBird = isAResident ? 'ציפור א' : 'ציפור ב';
    const rb = isAResident ? a : b;
    qs.push({
      text: 'איזו ציפור מתגוררת בישראל כל השנה?',
      options: shuffle(['ציפור א', 'ציפור ב', 'שתיהן', 'אף אחת']),
      answer: residentBird,
      explanation: `${rb.hebrewName} היא תושבת קבע — נמצאת בישראל כל השנה!`,
    });
  }

  // 5. Winter visitor (if one is winter)
  if (
    (a.seasonal === 'winter') !== (b.seasonal === 'winter') &&
    (a.seasonal === 'winter' || b.seasonal === 'winter')
  ) {
    const winterBird = a.seasonal === 'winter' ? 'ציפור א' : 'ציפור ב';
    const wb = a.seasonal === 'winter' ? a : b;
    qs.push({
      text: 'איזו ציפור חורפת בישראל?',
      options: shuffle(['ציפור א', 'ציפור ב', 'שתיהן', 'אף אחת']),
      answer: winterBird,
      explanation: `${wb.hebrewName} מגיעה לישראל רק בחורף!`,
    });
  }

  // 6. Summer visitor (if one is summer)
  if (
    (a.seasonal === 'summer') !== (b.seasonal === 'summer') &&
    (a.seasonal === 'summer' || b.seasonal === 'summer')
  ) {
    const summerBird = a.seasonal === 'summer' ? 'ציפור א' : 'ציפור ב';
    const sb = a.seasonal === 'summer' ? a : b;
    qs.push({
      text: 'איזו ציפור מגיעה לישראל רק בקיץ?',
      options: shuffle(['ציפור א', 'ציפור ב', 'שתיהן', 'אף אחת']),
      answer: summerBird,
      explanation: `${sb.hebrewName} מגיעה באביב לקינון ועוזבת לפני החורף!`,
    });
  }

  return qs.slice(0, 6);
}

interface Props {
  onQuit: () => void;
}

export function TwoBirdsGame({ onQuit }: Props) {
  const [{ birdA, birdB, questions }] = useState(() => {
    const s = shuffle([...birds]);
    const birdA = s[0];
    const birdB = s[1];
    return { birdA, birdB, questions: buildQuestions(birdA, birdB) };
  });

  const [currentQ,  setCurrentQ]  = useState(0);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [score,     setScore]     = useState(0);
  const [correct,   setCorrect]   = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);
  const [imgALoaded, setImgALoaded] = useState(false);
  const [imgBLoaded, setImgBLoaded] = useState(false);

  const q = questions[currentQ];

  const handleAnswer = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const isCorrect = opt === q.answer;
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrect(c => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
    setFlashState(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFlashState(null), 500);
  }, [selected, q]);

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(i => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const pct = Math.round(correct / questions.length * 100);
    return (
      <div className="tb-screen">
        <div className="tb-result">
          <div className="tb-result-icon">
            {correct === questions.length ? '🏆' : correct >= Math.ceil(questions.length / 2) ? '🌟' : '🐦'}
          </div>
          <h2 className="tb-result-title">סיום!</h2>
          <p className="tb-result-sub">{correct} מתוך {questions.length} תשובות נכונות ({pct}%)</p>
          <p className="tb-final-score">ניקוד: {score}</p>

          <div className="tb-birds-review">
            <div className="tb-bird-review-card">
              <img src={birdA.imageUrl} alt={birdA.hebrewName} className="tb-review-img"/>
              <span className="tb-review-label">ציפור א</span>
              <span className="tb-review-name">{birdA.hebrewName}</span>
            </div>
            <div className="tb-vs-badge">VS</div>
            <div className="tb-bird-review-card">
              <img src={birdB.imageUrl} alt={birdB.hebrewName} className="tb-review-img"/>
              <span className="tb-review-label">ציפור ב</span>
              <span className="tb-review-name">{birdB.hebrewName}</span>
            </div>
          </div>

          <button className="next-btn" style={{ marginTop: 8 }} onClick={onQuit}>
            חזור לתפריט
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tb-screen">
      {flashState && <div className={`screen-flash screen-flash-${flashState}`}/>}

      {/* Header */}
      <header className="game-header">
        <button className="quit-btn" onClick={onQuit}>✕</button>
        <div className="header-center">
          <span className="tb-progress-label">
            שאלה {currentQ + 1} מתוך {questions.length}
          </span>
        </div>
        <div className="score-chip" style={{ '--theme-accent': '#d4af37', '--theme-accent2': '#a78bfa' } as React.CSSProperties}>
          ⭐ {score}
        </div>
      </header>

      {/* Two bird images (always visible) */}
      <div className="tb-birds-row">
        <div className="tb-bird-wrap">
          <div className="tb-bird-label-badge">ציפור א</div>
          <div className="tb-img-box">
            {!imgALoaded && (
              <div className="bird-img-skeleton">
                <span className="spin-icon">⏳</span>
              </div>
            )}
            <img
              src={birdA.imageUrl}
              alt="ציפור א"
              className={`tb-img ${imgALoaded ? 'loaded' : 'loading'}`}
              onLoad={() => setImgALoaded(true)}
            />
          </div>
        </div>

        <div className="tb-divider">VS</div>

        <div className="tb-bird-wrap">
          <div className="tb-bird-label-badge">ציפור ב</div>
          <div className="tb-img-box">
            {!imgBLoaded && (
              <div className="bird-img-skeleton">
                <span className="spin-icon">⏳</span>
              </div>
            )}
            <img
              src={birdB.imageUrl}
              alt="ציפור ב"
              className={`tb-img ${imgBLoaded ? 'loaded' : 'loading'}`}
              onLoad={() => setImgBLoaded(true)}
            />
          </div>
        </div>
      </div>

      {/* Question + options + feedback */}
      <div className="game-body">
        <div className="question-panel">
          <p className="question-label">{q.text}</p>
        </div>

        <div className={`options-grid${q.options.length === 2 ? ' options-two' : ''}`}>
          {q.options.map(opt => {
            let cls = 'opt-btn';
            if (selected !== null) {
              if (opt === q.answer)   cls += ' state-correct';
              else if (opt === selected) cls += ' state-wrong';
              else                       cls += ' state-dim';
            }
            return (
              <button
                key={opt}
                className={cls}
                onClick={() => handleAnswer(opt)}
                disabled={selected !== null}
                style={{ '--theme-opt-bg': 'rgba(10,30,80,0.9)', '--theme-opt-brd': 'rgba(37,99,235,0.5)' } as React.CSSProperties}
              >
                <span className="opt-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className={`feedback-panel ${selected === q.answer ? 'correct' : 'wrong'}`}>
            <div className="feedback-verdict">
              {selected === q.answer ? '✅ נכון!' : `❌ לא נכון — התשובה: ${q.answer}`}
            </div>
            <div className="feedback-fact">💡 {q.explanation}</div>
            <button className="next-btn" onClick={handleNext}>
              {currentQ + 1 >= questions.length ? '🏁 סיום' : 'הבאה ←'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
