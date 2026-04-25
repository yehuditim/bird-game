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

// Positions in SVG viewBox coordinates (0 0 540 385)
// Bird faces LEFT, perched on diagonal branch — matching PDF diagram (Blue Tit style)
const DROP_ZONES: DropZone[] = [
  { id: 'כיפה',  cx: 150, cy:  92, r: 30 },
  { id: 'עין',   cx: 112, cy: 152, r: 22 },
  { id: 'לחי',   cx: 115, cy: 178, r: 24 },
  { id: 'מקור',  cx:  52, cy: 168, r: 24 },
  { id: 'צוואר', cx: 172, cy: 205, r: 24 },
  { id: 'חזה',   cx: 178, cy: 235, r: 26 },
  { id: 'בטן',   cx: 195, cy: 270, r: 26 },
  { id: 'גב',    cx: 260, cy: 162, r: 28 },
  { id: 'כנף',   cx: 292, cy: 205, r: 30 },
  { id: 'שת',    cx: 342, cy: 222, r: 26 },
  { id: 'זנב',   cx: 408, cy: 215, r: 26 },
  { id: 'רגל',   cx: 238, cy: 312, r: 24 },
  { id: 'טופר',  cx: 224, cy: 350, r: 24 },
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
      x: (clientX - rect.left) / rect.width  * 540,
      y: (clientY - rect.top)  / rect.height * 385,
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
          viewBox="0 0 540 385"
          className="bp-bird-svg"
          style={{ pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Branch: two parallel diagonal lines (as in PDF) ── */}
          <path d="M 22,342 L 518,298" stroke="#4A3828" strokeWidth="1.5" fill="none"/>
          <path d="M 22,357 L 518,313" stroke="#4A3828" strokeWidth="1.5" fill="none"/>
          <path d="M 22,342 L 518,298 L 518,313 L 22,357 Z" fill="#C4A878"/>
          <path d="M 22,342 L 518,298" stroke="#6B5040" strokeWidth="2"/>
          <path d="M 22,357 L 518,313" stroke="#6B5040" strokeWidth="2"/>

          {/* ── Tail feathers (horizontal, elongated — as in PDF) ── */}
          <path d="M 342,207 Q 382,194 432,200 L 432,234 Q 382,240 342,236 Z"
            fill="#BFBCB6" stroke="#444" strokeWidth="1.8"/>
          <line x1="344" y1="212" x2="430" y2="204" stroke="#555" strokeWidth="1.2"/>
          <line x1="344" y1="220" x2="430" y2="213" stroke="#555" strokeWidth="1.2"/>
          <line x1="344" y1="228" x2="430" y2="222" stroke="#555" strokeWidth="1.2"/>
          <line x1="344" y1="234" x2="430" y2="231" stroke="#555" strokeWidth="1.2"/>
          <path d="M 432,200 Q 443,217 432,234" stroke="#444" strokeWidth="2" fill="none"/>

          {/* ── Main body (very round — matching PDF) ── */}
          <ellipse cx="250" cy="235" rx="110" ry="100"
            fill="#D2CFCA" stroke="#444" strokeWidth="2.5"/>

          {/* ── Wing (upper-right area of body, darker gray with feather bands) ── */}
          <path d="M 196,164 Q 270,146 345,187 Q 362,208 356,235
                   Q 322,222 286,217 Q 245,210 196,202 Q 180,182 196,164 Z"
            fill="#A8A49E" stroke="#444" strokeWidth="1.8"/>
          <path d="M 202,180 Q 276,162 345,187" stroke="#555" strokeWidth="1.3" fill="none"/>
          <path d="M 200,194 Q 276,178 348,200" stroke="#555" strokeWidth="1.3" fill="none"/>
          <path d="M 200,208 Q 276,195 352,215" stroke="#555" strokeWidth="1.3" fill="none"/>
          {[0,1,2,3].map(i => (
            <path key={i}
              d={`M ${332+i*6},${188+i*11} Q ${358+i*3},${193+i*11} ${354+i*5},${204+i*11}`}
              stroke="#555" strokeWidth="1" fill="none"/>
          ))}

          {/* ── Belly (lighter, left-lower part of body) ── */}
          <ellipse cx="218" cy="268" rx="82" ry="68"
            fill="#E2DFD8" stroke="none"/>

          {/* ── Head (large, very round) ── */}
          <circle cx="150" cy="162" r="74"
            fill="#D2CFCA" stroke="#444" strokeWidth="2.5"/>

          {/* ── Crown (darker, top of head) ── */}
          <path d="M 90,150 Q 150,84 210,150 Q 196,112 150,102 Q 104,112 90,150 Z"
            fill="#9A9892" stroke="none"/>

          {/* ── Cheek patch (prominent white/light — לחי) ── */}
          <ellipse cx="116" cy="180" rx="40" ry="34"
            fill="#F2EFEC" stroke="none"/>

          {/* ── Beak (short, slightly hooked — מקור) ── */}
          <path d="M 80,164 Q 58,167 44,172 Q 58,175 80,177 Z"
            fill="#D8C050" stroke="#A08020" strokeWidth="1.5"/>

          {/* ── Eye ── */}
          <circle cx="112" cy="154" r="13" fill="#1a1a1a"/>
          <circle cx="107" cy="149" r="5.5" fill="white"/>
          <circle cx="106" cy="148" r="2.5" fill="#1a1a1a"/>

          {/* ── Legs ── */}
          <line x1="236" y1="329" x2="222" y2="345"
            stroke="#7A6550" strokeWidth="5" strokeLinecap="round"/>
          <line x1="262" y1="332" x2="270" y2="345"
            stroke="#7A6550" strokeWidth="5" strokeLinecap="round"/>

          {/* ── Left foot claws ── */}
          <path d="M 222,345 Q 202,351 186,354"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 222,345 Q 218,358 214,366"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 222,345 Q 237,352 246,354"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

          {/* ── Right foot claws ── */}
          <path d="M 270,345 Q 254,351 243,355"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 270,345 Q 269,358 265,366"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M 270,345 Q 282,348 290,347"
            stroke="#7A6550" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

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
