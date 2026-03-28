import { birds, Bird } from './birds';

export interface GameQuestion {
  id: string;
  type: 'identify' | 'trivia';
  // identify only
  bird?: Bird;
  imageUrl?: string;
  // shared
  questionText: string;
  options: string[];
  answer: string;
  explanation: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(correct: string, count: number, pool: string[]): string[] {
  return shuffle(pool.filter(n => n !== correct)).slice(0, count);
}

// ─── BUILD IDENTIFY QUESTIONS ────────────────────────────────────────────────
function buildIdentifyQuestions(): GameQuestion[] {
  const names = birds.map(b => b.hebrewName);
  return birds.map(bird => ({
    id: `id-${bird.id}`,
    type: 'identify' as const,
    bird,
    imageUrl: bird.imageUrl,
    questionText: 'מה שם הציפור הזו?',
    options: shuffle([bird.hebrewName, ...getDistractors(bird.hebrewName, 3, names)]),
    answer: bird.hebrewName,
    explanation: bird.funFact,
  }));
}

// ─── STATIC TRIVIA QUESTIONS ─────────────────────────────────────────────────
const triviaData: Omit<GameQuestion, 'id'>[] = [

  // ── גודל ──────────────────────────────────────────────────────────────────
  {
    type: 'trivia',
    questionText: 'מי הגדולה ביותר מבין הציפורים האלה?',
    options: shuffle(['עורב אפור', 'דוכיפת', 'בולבול', 'זרזיר']),
    answer: 'עורב אפור',
    explanation: 'העורב האפור מגיע לכ-47 ס"מ — גדול פי שלושה מהזרזיר!'
  },
  {
    type: 'trivia',
    questionText: 'מי הקטנה ביותר מבין הציפורים האלה?',
    options: shuffle(['פשוש', 'דרור הבית', 'ירגזי', 'בולבול']),
    answer: 'פשוש',
    explanation: 'הפשוש הוא מהקטנות בציפורי ישראל — רק כ-11 ס"מ אורכו!'
  },
  {
    type: 'trivia',
    questionText: 'מי גדולה יותר — שחרור או דרור הבית?',
    options: shuffle(['שחרור', 'דרור הבית', 'שניהם שווים', 'לא ניתן לדעת']),
    answer: 'שחרור',
    explanation: 'השחרור מגיע לכ-25 ס"מ, ואילו דרור הבית — רק 14 ס"מ.'
  },
  {
    type: 'trivia',
    questionText: 'מי גדולה יותר — בז מצוי או דוכיפת?',
    options: shuffle(['בז מצוי', 'דוכיפת', 'שניהם שווים', 'לא ניתן לדעת']),
    answer: 'בז מצוי',
    explanation: 'הבז המצוי מגיע לכ-35 ס"מ, הדוכיפת לכ-28 ס"מ.'
  },
  {
    type: 'trivia',
    questionText: 'מי מהן הגדולה ביותר?',
    options: shuffle(['אנפית בקר', 'שרקרק מצוי', 'מאינה', 'נקר סורי']),
    answer: 'אנפית בקר',
    explanation: 'אנפית הבקר מגיעה לכ-50 ס"מ — הגדולה מכולן!'
  },

  // ── מראה ────────────────────────────────────────────────────────────────────
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש מקור ארוך ואדום?',
    options: shuffle(['דררה', 'שרקרק מצוי', 'בז מצוי', 'ירקון']),
    answer: 'דררה',
    explanation: 'הדררה היא תוכי ירוק עם מקור אדום בולט — ציפור פולשת מהודו.'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש חזה צהוב, לחיים לבנות ו"עניבה" שחורה?',
    options: shuffle(['ירגזי', 'חוחית', 'ירקון', 'פרוש מצוי']),
    answer: 'ירגזי',
    explanation: 'הירגזי ניתן לזיהוי קל: חזה צהוב עם פס שחור אנכי — ממש כמו עניבה!'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש פנים אדומות בולטות?',
    options: shuffle(['חוחית', 'אדום חזה', 'שרקרק מצוי', 'זרזיר']),
    answer: 'חוחית',
    explanation: 'החוחית מזוהה ב"מסכה" אדומה-לבנה על פניה — ממש כמו ליצן!'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש צבעים כחולים-מטאליים מבריקים?',
    options: shuffle(['צופית בוהקת', 'ירקון', 'שלדג לבן-חזה', 'נחליאלי לבן']),
    answer: 'צופית בוהקת',
    explanation: 'הזכר של הצופית הבוהקת לובש כחול-מטאלי מרהיב בעונת הרביה.'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש "שת" (עורף תחתון) צהוב?',
    options: shuffle(['בולבול', 'ירגזי', 'עפרוני מצויץ', 'חוחית']),
    answer: 'בולבול',
    explanation: 'לבולבול יש כתם צהוב מובהק מתחת לזנבו — סימן זיהוי קלאסי!'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש ציצית (כתר נוצות) על הראש?',
    options: shuffle(['דוכיפת', 'עפרוני מצויץ', 'בולבול', 'ירגזי']),
    answer: 'דוכיפת',
    explanation: 'לדוכיפת ציצית נוצות גדולה ומרשימה שהיא פותחת ומקפלת — סימנה המובהק.'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש כנפיים מפוספסות שחור-לבן כמו זברה?',
    options: shuffle(['דוכיפת', 'סיקסק', 'נקר סורי', 'שחרור']),
    answer: 'דוכיפת',
    explanation: 'כנפי הדוכיפת מפוספסות שחור-לבן בצורה בולטת — אי-אפשר לפספס אותה!'
  },

  // ── התנהגות ─────────────────────────────────────────────────────────────────
  {
    type: 'trivia',
    questionText: 'איזו ציפור ישנה, אוכלת ואפילו מזדווגת בעודה עפה?',
    options: shuffle(['סיס חומות', 'סנונית רפתות', 'בז מצוי', 'שרקרק מצוי']),
    answer: 'סיס חומות',
    explanation: 'הסיס ממש לא נוחת — כל חייו בשמיים! הוא ישן בטיסה נמוכה איטית.'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור מרחפת במקום מול הרוח כשהיא מחפשת טרף?',
    options: shuffle(['בז מצוי', 'עורבני', 'שרקרק מצוי', 'מאינה']),
    answer: 'בז מצוי',
    explanation: 'הבז "תולה" את עצמו באוויר — ריחוף מקום — ועיניו רואות עכברים מרחק של 50 מטר!'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור בונה קן בצורת אגס סגור עם פתח צדי?',
    options: shuffle(['פשוש', 'עלווית חורף', 'ירגזי', 'בולבול']),
    answer: 'פשוש',
    explanation: 'הפשוש בונה קן סגור בצורת אגס — מוגן ומסתורי, בדרך כלל בשיחים נמוכים.'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור ידועה בכך שמסתירה אלפי בלוטים בקרקע לחורף?',
    options: shuffle(['עורבני', 'קאק', 'עורב אפור', 'מאינה']),
    answer: 'עורבני',
    explanation: 'העורבני מסתיר אלפי בלוטים ואגוזים — ומוצא רוב מחבואיו גם חודשים מאוחר יותר.'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור מנקרת עצים בתדירות של 20 פעמים בשנייה?',
    options: shuffle(['נקר סורי', 'קאק', 'עורב אפור', 'מאינה']),
    answer: 'נקר סורי',
    explanation: 'הנקר מסוגל לנקר 20 פעמים בשנייה — ולא מרגיש כלום, כי גולגולתו מוגנת!'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור מנענעת את זנבה למעלה ולמטה ללא הרף?',
    options: shuffle(['נחליאלי לבן', 'פשוש', 'חכלילית סלעים', 'עלווית חורף']),
    answer: 'נחליאלי לבן',
    explanation: 'הנחליאלי קיבל שמו מתנועת הזנב ה"מנגנת" (Wagtail) — אופיינית לו לגמרי.'
  },
  {
    type: 'trivia',
    questionText: 'לאיזו ציפור יש שירה שנשמעת כמו צחוק?',
    options: shuffle(['צוצלת', 'מיינה', 'זרזיר', 'בולבול']),
    answer: 'צוצלת',
    explanation: 'הצוצלת נקראת Laughing Dove — קריאתה נשמעת כמו צחוק נעים.'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור שואבת צוף מפרחים בעודה מרחפת?',
    options: shuffle(['צופית בוהקת', 'חוחית', 'ירקון', 'פרוש מצוי']),
    answer: 'צופית בוהקת',
    explanation: 'הצופית מרחפת מול פרחים ושואבת את הצוף כמו דבורה — בלי לנחות!'
  },

  // ── מוצא ────────────────────────────────────────────────────────────────────
  {
    type: 'trivia',
    questionText: 'מי מבין הציפורים האלה הוא מין פולש (לא מקומי)?',
    options: shuffle(['דררה', 'בולבול', 'פשוש', 'שחרור']),
    answer: 'דררה',
    explanation: 'הדררה הגיעה מהודו כציפור נוי שברחה מכלובים — היום היא מין פולש נפוץ.'
  },
  {
    type: 'trivia',
    questionText: 'מי מבין הציפורים האלה חורפת בישראל אך אינה קבועה?',
    options: shuffle(['אדום חזה', 'בולבול', 'דרור הבית', 'יונה']),
    answer: 'אדום חזה',
    explanation: 'אדום החזה מגיע לישראל בסתיו ועוזב באביב — הוא חורף, לא תושב קבוע.'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור נחשבת ייחודית (אנדמית) לאזור ישראל והמזרח התיכון?',
    options: shuffle(['בולבול', 'זרזיר', 'אדום חזה', 'פרוש מצוי']),
    answer: 'בולבול',
    explanation: 'הבולבול הוא אנדמי לאזורנו — מפוץ רק בישראל ומדינות שכנות.'
  },
  {
    type: 'trivia',
    questionText: 'מי מבין הציפורים האלה מסייעת להדברת חרקים בגינה?',
    options: shuffle(['ירגזי', 'דרור הבית', 'יונה', 'עורב אפור']),
    answer: 'ירגזי',
    explanation: 'הירגזי ניזון מחיפושיות, זחלים ופרפרים — סיוע טבעי נפלא לגינן!'
  },
  {
    type: 'trivia',
    questionText: 'איזו ציפור נבחרה לציפור המדינה של ישראל בשנת 2008?',
    options: shuffle(['דוכיפת', 'שרקרק מצוי', 'בולבול', 'צופית בוהקת']),
    answer: 'דוכיפת',
    explanation: 'הדוכיפת נבחרה בהצבעה עממית — מוכרת, יפה ומזוהה עם נוף ישראל.'
  },
];

// ─── EXPORT ──────────────────────────────────────────────────────────────────

/** Full question pool: all identify questions + all trivia */
export function buildFullPool(): GameQuestion[] {
  const identifyQs = buildIdentifyQuestions();
  const triviaQs = triviaData.map((q, i) => ({ ...q, id: `trivia-${i}` }));
  return shuffle([...identifyQs, ...triviaQs]);
}

/** Pick `count` questions, ensuring all 40 birds appear at least once in identify Qs */
export function pickQuestions(count: number): GameQuestion[] {
  const identifyQs = shuffle(buildIdentifyQuestions());
  const triviaQs = shuffle(
    triviaData.map((q, i) => ({ ...q, id: `trivia-${i}` }))
  );

  // Take all 40 identify + fill rest with trivia (up to count)
  const base = identifyQs.slice(0, Math.min(40, count));
  const extra = triviaQs.slice(0, Math.max(0, count - base.length));
  return shuffle([...base, ...extra]);
}
