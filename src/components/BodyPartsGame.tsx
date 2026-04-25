import { useState, useRef, useCallback } from 'react';
import { playCorrect, playWrong } from '../utils/sounds';

const BODY_PARTS = [
  'כיפה', 'עין', 'לחי', 'מקור', 'צוואר',
  'חזה', 'בטן', 'גב', 'כנף', 'שת', 'זנב', 'רגל', 'טופר',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface DropZone {
  id: string;
  cx: number;
  cy: number;
  r: number;
}

// Positions in SVG viewBox coordinates (0 0 500 350)
// Bird faces LEFT, perched on diagonal branch
const DROP_ZONES: DropZone[] = [
  { id: 'כיפה',  cx: 148, cy: 100, r: 30 },
  { id: 'עין',   cx: 112, cy: 143, r: 22 },
  { id: 'לחי',   cx: 130, cy: 170, r: 24 },
  { id: 'מקור',  cx: 63,  cy: 156, r: 24 },
  { id: 'צוואר', cx: 172, cy: 190, r: 24 },
  { id: 'חזה',   cx: 180, cy: 218, r: 26 },
  { id: 'בטן',   cx: 194, cy: 250, r: 26 },
  { id: 'גב',    cx: 248, cy: 168, r: 28 },
  { id: 'כנף',   cx: 270, cy: 208, r: 30 },
  { id: 'שת',    cx: 320, cy: 200, r: 26 },
  { id: 'זנב',   cx: 388, cy: 174, r: 26 },
  { id: 'רגל',   cx: 232, cy: 284, r: 24 },
  { id: 'טופר',  cx: 215, cy: 316, r: 24 },
];

interface Props {
  onQuit: () => void;
}

export function BodyPartsGame({ onQuit }: Props) {
  const [pool]  = useState(() => shuffle(BODY_PARTS));
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [dragging,   setDragging]   = useState<string | null>(null);
  const [dragPos,    setDragPos]    = useState({ x: 0, y: 0 });
  const [wrongZone,  setWrongZone]  = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [score,      setScore]      = useState(0);
  const [mistakes,   setMistakes]   = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);

  const placedLabels = new Set(Object.values(placements));
  const isComplete   = placedLabels.size === BODY_PARTS.length;

  function clientToSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width * 500,
      y: (clientY - rect.top)  / rect.height * 350,
    };
  }

  function findZone(svgX: number, svgY: number): DropZone | null {
    let hit: DropZone | null = null;
    let minDist = Infinity;
    for (const zone of DROP_ZONES) {
      if (placements[zone.id]) continue;
      const dist = Math.sqrt((svgX - zone.cx) ** 2 + (svgY - zone.cy) ** 2);
      if (dist <= zone.r * 1.4 && dist < minDist) {
        minDist = dist;
        hit = zone;
      }
    }
    return hit;
  }

  const handleDrop = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return;
    const { x: svgX, y: svgY } = clientToSvg(clientX, clientY);
    const hitZone = findZone(svgX, svgY);

    if (hitZone) {
      if (hitZone.id === dragging) {
        setPlacements(prev => ({ ...prev, [hitZone.id]: dragging }));
        setScore(s => s + 10);
        playCorrect();
      } else {
        setMistakes(m => m + 1);
        setWrongZone(hitZone.id);
        setTimeout(() => setWrongZone(null), 600);
        playWrong();
      }
    }
    setHoveredZone(null);
  }, [dragging, placements]);

  const availablePool = pool.filter(p => !placedLabels.has(p));

  return (
    <div
      className="bp-screen"
      style={{ touchAction: 'none', userSelect: 'none' }}
      onPointerDown={e => {
        const labelEl = (e.target as Element).closest('[data-label]') as HTMLElement | null;
        if (labelEl) {
          const label = labelEl.dataset.label!;
          if (!placedLabels.has(label)) {
            setDragging(label);
            setDragPos({ x: e.clientX, y: e.clientY });
          }
        }
      }}
      onPointerMove={e => {
        if (!dragging) return;
        setDragPos({ x: e.clientX, y: e.clientY });
        const { x: svgX, y: svgY } = clientToSvg(e.clientX, e.clientY);
        setHoveredZone(findZone(svgX, svgY)?.id ?? null);
      }}
      onPointerUp={e => {
        if (dragging) {
          handleDrop(e.clientX, e.clientY);
          setDragging(null);
        }
      }}
      onPointerCancel={() => { setDragging(null); setHoveredZone(null); }}
    >
      {/* Header */}
      <header className="bp-header">
        <button className="quit-btn" onClick={onQuit}>✕</button>
        <h2 className="bp-title">גוף הציפור</h2>
        <div className="bp-score-chip">⭐ {score}</div>
      </header>

      {/* Bird SVG diagram */}
      <div className="bp-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 500 350"
          className="bp-bird-svg"
          style={{ pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Branch */}
          <path d="M 30 318 Q 250 288 470 268" stroke="#8B5E3C" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M 30 318 Q 250 296 470 276" stroke="#A0785A" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5"/>

          {/* Body – main oval */}
          <ellipse cx="258" cy="215" rx="108" ry="72"
            fill="#D6D3CC" stroke="#5A5A5A" strokeWidth="2.5"
            transform="rotate(-8, 258, 215)"/>

          {/* Wing area (on top of body) */}
          <ellipse cx="268" cy="208" rx="82" ry="48"
            fill="#B0ADA6" stroke="#5A5A5A" strokeWidth="1.5"
            transform="rotate(-5, 268, 208)"/>

          {/* Wing feather lines */}
          {[0,1,2,3,4].map(i => (
            <path key={i}
              d={`M ${200+i*17} ${172+i*3} Q ${222+i*12} ${198+i*4} ${232+i*9} ${218+i*3}`}
              stroke="#6b7280" strokeWidth="1.2" fill="none" opacity="0.45"/>
          ))}

          {/* Rump area (שת) */}
          <ellipse cx="322" cy="200" rx="34" ry="23"
            fill="#C0BDB6" stroke="none"
            transform="rotate(-6, 322, 200)" opacity="0.8"/>

          {/* Tail feathers */}
          <path d="M 346,193 L 400,157 L 408,170 L 358,206 Z"
            fill="#B0ADA6" stroke="#5A5A5A" strokeWidth="1.5"/>
          <path d="M 346,199 L 403,176 L 410,190 L 358,212 Z"
            fill="#D6D3CC" stroke="#5A5A5A" strokeWidth="1.5"/>
          <path d="M 348,206 L 402,194 L 406,208 L 358,218 Z"
            fill="#B0ADA6" stroke="#5A5A5A" strokeWidth="1.5"/>

          {/* Head */}
          <circle cx="145" cy="155" r="60"
            fill="#D6D3CC" stroke="#5A5A5A" strokeWidth="2.5"/>

          {/* Crown (כיפה) – darker top area */}
          <ellipse cx="148" cy="112" rx="46" ry="36"
            fill="#B0ADA6" stroke="none"/>

          {/* Cheek (לחי) – lighter patch */}
          <ellipse cx="132" cy="170" rx="32" ry="24"
            fill="#E8E6E2" stroke="none"/>

          {/* Beak */}
          <polygon points="87,150 87,164 48,157"
            fill="#F0C040" stroke="#C8A000" strokeWidth="1.5"/>

          {/* Eye */}
          <circle cx="112" cy="145" r="11" fill="#1e293b"/>
          <circle cx="108" cy="141" r="4.5" fill="white"/>
          <circle cx="107" cy="140" r="2"   fill="#1e293b"/>

          {/* Legs */}
          <line x1="228" y1="275" x2="214" y2="305"
            stroke="#7A6A58" strokeWidth="5" strokeLinecap="round"/>
          <line x1="248" y1="278" x2="256" y2="304"
            stroke="#7A6A58" strokeWidth="5" strokeLinecap="round"/>

          {/* Left foot claws */}
          <path d="M 214,305 Q 195,311 182,314"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 214,305 Q 211,317 207,324"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 214,305 Q 227,312 235,314"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

          {/* Right foot claws */}
          <path d="M 256,304 Q 242,310 232,313"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 256,304 Q 256,316 252,323"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 256,304 Q 268,308 276,307"
            stroke="#7A6A58" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

          {/* Drop zones */}
          {DROP_ZONES.map(zone => {
            const placed   = placements[zone.id];
            const isWrong  = wrongZone === zone.id;
            const isHover  = hoveredZone === zone.id && dragging !== null;

            if (placed) {
              return (
                <g key={zone.id}>
                  <circle cx={zone.cx} cy={zone.cy} r={zone.r}
                    fill="rgba(22,163,74,0.82)" stroke="#86efac" strokeWidth="2"/>
                  <text x={zone.cx} y={zone.cy + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="12" fontWeight="bold"
                    fontFamily="Heebo, Arial Hebrew, Arial, sans-serif">
                    {zone.id}
                  </text>
                </g>
              );
            }

            return (
              <g key={zone.id}>
                <circle cx={zone.cx} cy={zone.cy} r={zone.r}
                  fill={
                    isWrong ? "rgba(220,38,38,0.28)"
                    : isHover ? "rgba(212,175,55,0.30)"
                    : "rgba(255,255,255,0.10)"
                  }
                  stroke={
                    isWrong ? "#ef4444"
                    : isHover ? "#ffd700"
                    : "rgba(80,80,80,0.55)"
                  }
                  strokeWidth={isHover ? 2.5 : 1.8}
                  strokeDasharray={isWrong || isHover ? "none" : "5,3"}
                />
                {isWrong && (
                  <text x={zone.cx} y={zone.cy + 6}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#ef4444" fontSize="20" fontWeight="bold">✗</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Label pool or completion screen */}
      {isComplete ? (
        <div className="bp-complete">
          <div className="bp-complete-icon">🎉</div>
          <h3 className="bp-complete-title">כל הכבוד!</h3>
          <p className="bp-complete-sub">השלמת את גוף הציפור!</p>
          <p className="bp-final-score">
            ניקוד: {score} מתוך {BODY_PARTS.length * 10}
            {mistakes > 0 && <span className="bp-mistakes"> ({mistakes} טעויות)</span>}
          </p>
          <button className="next-btn" style={{ marginTop: 8 }} onClick={onQuit}>
            חזור לתפריט
          </button>
        </div>
      ) : (
        <div className="bp-pool">
          <p className="bp-instruction">
            גרור כל חלק גוף אל המקום הנכון בציפור
            <span className="bp-progress"> ({placedLabels.size}/{BODY_PARTS.length})</span>
          </p>
          <div className="bp-chips">
            {availablePool.map(label => (
              <div
                key={label}
                data-label={label}
                className={`bp-chip${dragging === label ? ' bp-chip-dragging' : ''}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag ghost */}
      {dragging && (
        <div
          className="bp-ghost"
          style={{
            position: 'fixed',
            left: dragPos.x,
            top:  dragPos.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {dragging}
        </div>
      )}
    </div>
  );
}
