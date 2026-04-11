import { birds, Bird } from './birds';
import { AgeMode, AGE_CONFIG } from '../types/ageMode';

export interface GameQuestion {
  id: string;
  type: 'identify' | 'trivia';
  bird?: Bird;
  imageUrl?: string;
  /** Present when options are bird names that have images — enables visual card mode */
  optionImages?: Record<string, string>;
  /** Hide option text labels until answered (reverse-identify questions) */
  hideOptionLabels?: boolean;
  questionText: string;
  options: string[];
  answer: string;
  explanation: string;
  isBonus?: boolean;
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

// Lookup map: Hebrew name → Bird
const birdByName: Map<string, Bird> = new Map(birds.map(b => [b.hebrewName, b]));

/**
 * Returns an optionImages map if EVERY option corresponds to a known bird with an image.
 * Returns undefined if any option is a non-bird string (e.g. "שניהם שווים").
 */
function makeOptImages(options: string[]): Record<string, string> | undefined {
  const m: Record<string, string> = {};
  for (const name of options) {
    const b = birdByName.get(name);
    if (!b) return undefined;
    m[name] = b.imageUrl;
  }
  return m;
}

// ─── BUILD IDENTIFY QUESTIONS ────────────────────────────────────────────────
function buildIdentifyQuestions(): GameQuestion[] {
  const names = birds.map(b => b.hebrewName);
  return birds.map(bird => ({
    id: `id-${bird.id}`,
    type: 'identify' as const,
    bird,
    imageUrl: bird.imageUrl,
    questionText: 'מה זאת הציפור בתמונה?',
    options: shuffle([bird.hebrewName, ...getDistractors(bird.hebrewName, 3, names)]),
    answer: bird.hebrewName,
    explanation: bird.funFact,
  }));
}

// ─── BUILD COMPARE QUESTIONS (visual size comparisons) ───────────────────────
function buildCompareQuestions(): GameQuestion[] {
  const small  = shuffle(birds.filter(b => b.size === 'small'));
  const medium = shuffle(birds.filter(b => b.size === 'medium'));
  const large  = shuffle(birds.filter(b => b.size === 'large'));

  const makeMap = (list: Bird[]): Record<string, string> => {
    const m: Record<string, string> = {};
    list.forEach(b => { m[b.hebrewName] = b.imageUrl; });
    return m;
  };

  const qs: GameQuestion[] = [];

  // ── "Which is LARGER than a pigeon?" — 1 large + 3 small ──────────────────
  large.slice(0, 4).forEach((lb, i) => {
    const distractors = small.slice(i * 3, i * 3 + 3);
    if (distractors.length < 3) return;
    const opts = shuffle([lb, ...distractors]);
    qs.push({
      id: `cmp-lg-${i}`,
      type: 'trivia',
      questionText: 'איזו ציפור גדולה מיונה?',
      options: opts.map(b => b.hebrewName),
      optionImages: makeMap(opts),
      answer: lb.hebrewName,
      explanation: `${lb.hebrewName} היא ציפור גדולה — גדולה מיונה!`,
      isBonus: i === 0,
    });
  });

  // ── "Which is SMALLER than a pigeon?" — 1 small + 3 large/medium ──────────
  small.slice(0, 3).forEach((sb, i) => {
    const distractors = shuffle([...large, ...medium]).slice(0, 3);
    const opts = shuffle([sb, ...distractors]);
    qs.push({
      id: `cmp-sm-${i}`,
      type: 'trivia',
      questionText: 'איזו ציפור קטנה מיונה?',
      options: opts.map(b => b.hebrewName),
      optionImages: makeMap(opts),
      answer: sb.hebrewName,
      explanation: `${sb.hebrewName} היא ציפור קטנה — קטנה מיונה!`,
    });
  });

  // ── "Which is pigeon-sized?" — 1 medium + 1 small + 2 large ──────────────
  medium.slice(0, 2).forEach((mb, i) => {
    const distractors = [
      small[i + 6],
      large[i % large.length],
      large[(i + 1) % large.length],
    ].filter(Boolean) as Bird[];
    if (distractors.length < 3) return;
    const opts = shuffle([mb, ...distractors]);
    qs.push({
      id: `cmp-md-${i}`,
      type: 'trivia',
      questionText: 'איזו ציפור היא בגודל יונה בערך?',
      options: opts.map(b => b.hebrewName),
      optionImages: makeMap(opts),
      answer: mb.hebrewName,
      explanation: `${mb.hebrewName} היא בגודל יונה — קבוצת הציפורים הבינוניות.`,
    });
  });

  return qs; // 9 questions max
}

// ─── STATIC TRIVIA QUESTIONS ─────────────────────────────────────────────────
// Helper: build shuffled options and their image map in one step
function q4(
  names: [string, string, string, string],
): { options: string[]; optionImages: Record<string, string> | undefined } {
  const opts = shuffle([...names]);
  return { options: opts, optionImages: makeOptImages(opts) };
}

function buildTriviaData(): Omit<GameQuestion, 'id'>[] { return [

  // ── גודל ─────────────────────────────────────────────────────────────────
  (() => {
    const { options, optionImages } = q4(
      ['עורב אפור', 'דוכיפת', 'בולבול', 'זרזיר']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי הגדולה ביותר מבין הציפורים האלה?',
      options,
      optionImages,
      answer: 'עורב אפור',
      explanation: 'העורב האפור מגיע לכ-47 ס"מ — גדול פי שלושה מהזרזיר!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['פשוש', 'דרור הבית', 'ירגזי', 'בולבול']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי הקטנה ביותר מבין הציפורים האלה?',
      options,
      optionImages,
      answer: 'פשוש',
      explanation: 'הפשוש הוא מהקטנות בציפורי ישראל — רק כ-11 ס"מ אורכו!',
    };
  })(),

  {
    type: 'trivia',
    questionText: 'מי גדולה יותר — שחרור או דרור הבית?',
    options: shuffle(['שחרור', 'דרור הבית', 'שניהם שווים', 'קשה לדעת']),
    answer: 'שחרור',
    explanation: 'השחרור מגיע לכ-25 ס"מ, ואילו דרור הבית — רק 14 ס"מ.',
  },

  {
    type: 'trivia',
    questionText: 'מי גדולה יותר — בז מצוי או דוכיפת?',
    options: shuffle(['בז מצוי', 'דוכיפת', 'שניהם שווים', 'קשה לדעת']),
    answer: 'בז מצוי',
    explanation: 'הבז המצוי מגיע לכ-35 ס"מ, הדוכיפת לכ-28 ס"מ.',
  },

  (() => {
    const { options, optionImages } = q4(
      ['אנפית בקר', 'שרקרק מצוי', 'מאינה', 'נקר סורי']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי מהן הגדולה ביותר?',
      options,
      optionImages,
      answer: 'אנפית בקר',
      explanation: 'אנפית הבקר מגיעה לכ-50 ס"מ — הגדולה מכולן!',
    };
  })(),

  {
    type: 'trivia',
    isBonus: true,
    questionText: 'מי קטנה יותר — עלווית חורף או פשוש?',
    options: shuffle(['פשוש', 'עלווית חורף', 'שניהם שווים', 'תלוי בעונה']),
    answer: 'פשוש',
    explanation: 'הפשוש (11 ס"מ) קטן מהעלווית (11-12 ס"מ) — שניהם זעירים!',
  },

  // ── מראה ─────────────────────────────────────────────────────────────────
  (() => {
    const { options, optionImages } = q4(
      ['דררה', 'שרקרק מצוי', 'בז מצוי', 'ירקון']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש מקור ארוך ואדום?',
      options,
      optionImages,
      answer: 'דררה',
      explanation: 'הדררה היא תוכי ירוק עם מקור אדום בולט — ציפור פולשת מהודו.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['ירגזי', 'חוחית', 'ירקון', 'פרוש מצוי']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש חזה צהוב ו"עניבה" שחורה?',
      options,
      optionImages,
      answer: 'ירגזי',
      explanation: 'הירגזי ניתן לזיהוי קל: חזה צהוב עם פס שחור אנכי — ממש כמו עניבה!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['חוחית', 'אדום חזה', 'שרקרק מצוי', 'זרזיר']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש פנים אדומות בולטות?',
      options,
      optionImages,
      answer: 'חוחית',
      explanation: 'החוחית מזוהה ב"מסכה" אדומה-לבנה על פניה — ממש כמו ליצן!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['צופית בוהקת', 'ירקון', 'שלדג לבן-חזה', 'נחליאלי לבן']
    );
    return {
      type: 'trivia' as const,
      isBonus: true,
      questionText: 'לאיזו ציפור יש צבעים כחולים-מטאליים מבריקים?',
      options,
      optionImages,
      answer: 'צופית בוהקת',
      explanation: 'הזכר של הצופית הבוהקת לובש כחול-מטאלי מרהיב בעונת הרביה.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['בולבול', 'ירגזי', 'עפרוני מצויץ', 'חוחית']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש כתם צהוב מתחת לזנב?',
      options,
      optionImages,
      answer: 'בולבול',
      explanation: 'לבולבול יש כתם צהוב מובהק מתחת לזנבו — סימן זיהוי קלאסי!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['דוכיפת', 'עפרוני מצויץ', 'בולבול', 'ירגזי']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש ציצית (כתר נוצות) על הראש?',
      options,
      optionImages,
      answer: 'דוכיפת',
      explanation: 'לדוכיפת ציצית נוצות גדולה ומרשימה שהיא פותחת ומקפלת — סימנה המובהק.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['דוכיפת', 'סיקסק', 'נקר סורי', 'שחרור']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש כנפיים מפוספסות שחור-לבן?',
      options,
      optionImages,
      answer: 'דוכיפת',
      explanation: 'כנפי הדוכיפת מפוספסות שחור-לבן בצורה בולטת — אי-אפשר לפספס אותה!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['שחרור', 'קאק', 'עורב אפור', 'זרזיר']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור שחורה כולה עם מקור כתום-צהוב?',
      options,
      optionImages,
      answer: 'שחרור',
      explanation: 'הזכר של השחרור שחור לגמרי, ומקורו כתום-צהוב בולט — אי אפשר לטעות!',
    };
  })(),

  // ── התנהגות ──────────────────────────────────────────────────────────────
  (() => {
    const { options, optionImages } = q4(
      ['סיס חומות', 'סנונית רפתות', 'בז מצוי', 'שרקרק מצוי']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור ישנה, אוכלת ואפילו מזדווגת בעודה עפה?',
      options,
      optionImages,
      answer: 'סיס חומות',
      explanation: 'הסיס ממש לא נוחת — כל חייו בשמיים! הוא ישן בטיסה נמוכה איטית.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['בז מצוי', 'עורבני', 'שרקרק מצוי', 'מאינה']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור מרחפת במקום מול הרוח כשהיא מחפשת טרף?',
      options,
      optionImages,
      answer: 'בז מצוי',
      explanation: 'הבז "תולה" את עצמו באוויר — ריחוף מקום — ועיניו רואות עכברים ממרחק 50 מטר!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['פשוש', 'עלווית חורף', 'ירגזי', 'בולבול']
    );
    return {
      type: 'trivia' as const,
      isBonus: true,
      questionText: 'איזו ציפור בונה קן בצורת אגס סגור עם פתח צדי?',
      options,
      optionImages,
      answer: 'פשוש',
      explanation: 'הפשוש בונה קן סגור בצורת אגס — מוגן ומסתורי, בדרך כלל בשיחים נמוכים.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['עורבני', 'קאק', 'עורב אפור', 'מאינה']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור ידועה בכך שמסתירה אלפי בלוטים בקרקע לחורף?',
      options,
      optionImages,
      answer: 'עורבני',
      explanation: 'העורבני מסתיר אלפי בלוטים ואגוזים — ומוצא רוב מחבואיו גם חודשים מאוחר יותר.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['נקר סורי', 'קאק', 'עורב אפור', 'מאינה']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור מנקרת עצים בתדירות של 20 פעמים בשנייה?',
      options,
      optionImages,
      answer: 'נקר סורי',
      explanation: 'הנקר מסוגל לנקר 20 פעמים בשנייה — ולא מרגיש כלום, כי גולגולתו מוגנת!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['נחליאלי לבן', 'פשוש', 'חכלילית סלעים', 'עלווית חורף']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור מנענעת את זנבה למעלה ולמטה ללא הרף?',
      options,
      optionImages,
      answer: 'נחליאלי לבן',
      explanation: 'הנחליאלי קיבל שמו מתנועת הזנב ה"מנגנת" (Wagtail) — אופיינית לו לגמרי.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['צוצלת', 'מאינה', 'זרזיר', 'בולבול']
    );
    return {
      type: 'trivia' as const,
      questionText: 'לאיזו ציפור יש שירה שנשמעת כמו צחוק?',
      options,
      optionImages,
      answer: 'צוצלת',
      explanation: 'הצוצלת נקראת Laughing Dove — קריאתה נשמעת כמו צחוק נעים.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['צופית בוהקת', 'חוחית', 'ירקון', 'פרוש מצוי']
    );
    return {
      type: 'trivia' as const,
      isBonus: true,
      questionText: 'איזו ציפור שואבת צוף מפרחים בעודה מרחפת?',
      options,
      optionImages,
      answer: 'צופית בוהקת',
      explanation: 'הצופית מרחפת מול פרחים ושואבת את הצוף כמו דבורה — בלי לנחות!',
    };
  })(),

  // ── מוצא ─────────────────────────────────────────────────────────────────
  (() => {
    const { options, optionImages } = q4(
      ['דררה', 'בולבול', 'פשוש', 'שחרור']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי מבין הציפורים האלה הוא מין פולש (לא מקומי)?',
      options,
      optionImages,
      answer: 'דררה',
      explanation: 'הדררה הגיעה מהודו כציפור נוי שברחה מכלובים — היום היא מין פולש נפוץ.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['אדום חזה', 'בולבול', 'דרור הבית', 'יונה']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי מבין הציפורים האלה חורפת בישראל בלבד?',
      options,
      optionImages,
      answer: 'אדום חזה',
      explanation: 'אדום החזה מגיע לישראל בסתיו ועוזב באביב — הוא חורף, לא תושב קבוע.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['בולבול', 'זרזיר', 'אדום חזה', 'פרוש מצוי']
    );
    return {
      type: 'trivia' as const,
      isBonus: true,
      questionText: 'איזו ציפור נחשבת ייחודית לאזור ישראל והמזרח התיכון?',
      options,
      optionImages,
      answer: 'בולבול',
      explanation: 'הבולבול הוא אנדמי לאזורנו — מפוץ רק בישראל ומדינות שכנות.',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['ירגזי', 'דרור הבית', 'יונה', 'עורב אפור']
    );
    return {
      type: 'trivia' as const,
      questionText: 'מי מסייעת להדברת חרקים בגינה?',
      options,
      optionImages,
      answer: 'ירגזי',
      explanation: 'הירגזי ניזון מחיפושיות, זחלים ופרפרים — סיוע טבעי נפלא לגינן!',
    };
  })(),

  (() => {
    const { options, optionImages } = q4(
      ['דוכיפת', 'שרקרק מצוי', 'בולבול', 'צופית בוהקת']
    );
    return {
      type: 'trivia' as const,
      questionText: 'איזו ציפור נבחרה לציפור המדינה של ישראל בשנת 2008?',
      options,
      optionImages,
      answer: 'דוכיפת',
      explanation: 'הדוכיפת נבחרה בהצבעה עממית — מוכרת, יפה ומזוהה עם נוף ישראל.',
    };
  })(),
]; }

// ─── TRAIT & SEASONAL QUESTIONS ───────────────────────────────────────────────
function buildTraitAndSeasonalQuestions(): GameQuestion[] {
  const vq = (
    id: string,
    questionText: string,
    answer: string,
    others: [string, string, string],
    explanation: string,
    isBonus?: boolean,
  ): GameQuestion => {
    const opts = shuffle([answer, ...others]);
    return { id, type: 'trivia', questionText, options: opts, optionImages: makeOptImages(opts), answer, explanation, isBonus };
  };

  const qs: GameQuestion[] = [];

  // Crest
  qs.push(vq('trait-crest-1', 'לאיזו ציפור יש ציצית גדולה על הראש?', 'דוכיפת',
    ['יונה', 'שחרור', 'בולבול'], 'הדוכיפת פותחת ציצית נוצות מרשימה כשהיא נרגשת — סימן זיהוי קלאסי!'));
  qs.push(vq('trait-crest-2', 'לאיזו ציפור קרקעית יש ציצית על הראש?', 'עפרוני מצויץ',
    ['דרור הבית', 'ירגזי', 'פשוש'], 'העפרוני מצויץ מזוהה בקלות בציצית שעל ראשו ושר בטיסה.'));

  // Red chest / face
  qs.push(vq('trait-red-chest', 'לאיזו ציפור יש חזה אדום-כתום בולט?', 'אדום חזה',
    ['ירגזי', 'דרור הבית', 'עלווית חורף'], 'אדום החזה מזוהה מיד בחזהו הכתום-אדום — ציפורת החורף הסמלית של בריטניה.'));
  qs.push(vq('trait-red-face', 'לאיזו ציפור יש "מסכה" אדומה על הפנים?', 'חוחית',
    ['ירקון', 'פרוש מצוי', 'סבכי שחור-ראש'], 'לחוחית פנים אדומות-לבנות כמו מסכת ליצן — פשוט אי אפשר לפספס!'));

  // Metallic / colorful
  qs.push(vq('trait-blue-metallic', 'לאיזו ציפור יש צבע כחול-מטאלי מבריק?', 'צופית בוהקת',
    ['פשוש', 'עלווית חורף', 'נחליאלי לבן'], 'הזכר של הצופית הבוהקת לובש כחול-סגול מתכתי מרהיב בעונת הרביה.'));
  qs.push(vq('trait-colorful', 'איזו ציפור היא הצבעונית ביותר?', 'שרקרק מצוי',
    ['יונה', 'עורב אפור', 'נחליאלי לבן'], 'השרקרק משלב כחול, ירוק, צהוב ואדום — מהציפורים הצבעוניות ביותר בישראל.', true));

  // Green plumage
  qs.push(vq('trait-green', 'איזו ציפור יש לה נוצות ירוקות בולטות?', 'דררה',
    ['שחרור', 'דרור הבית', 'יונה'], 'הדררה היא תוכי ירוק עם מקור אדום — ציפור פולשת שמקורה בהודו.'));

  // Invasive
  qs.push(vq('trait-invasive-1', 'מי מהציפורים הגיעה לישראל מחוץ לארץ?', 'מאינה',
    ['בולבול', 'צוצלת', 'ירגזי'], 'המאינה הגיעה מדרום אסיה ומתחרה עם ציפורים מקומיות על קינים.'));
  qs.push(vq('trait-invasive-2', 'איזו ציפור נחשבת פולשת בישראל?', 'תוכי נזירי',
    ['דוכיפת', 'בולבול', 'שחרור'], 'התוכי הנזירי ברח מכלובים ומתרבה בשכונות עירוניות — קינו ענק מענפים.', true));

  // Seasonal odd-one-out
  const winterNames = birds.filter(b => b.seasonal === 'winter').map(b => b.hebrewName);
  const summerNames = birds.filter(b => b.seasonal === 'summer').map(b => b.hebrewName);
  const residentNames = birds.filter(b => !b.seasonal).map(b => b.hebrewName);

  // 3 winter + 1 summer = which is NOT a winter visitor?
  const w3 = shuffle(winterNames).slice(0, 3);
  const oddS = shuffle(summerNames)[0];
  if (w3.length === 3 && oddS) {
    const opts = shuffle([...w3, oddS]);
    qs.push({ id: 'trait-season-1', type: 'trivia',
      questionText: 'מי מהציפורים אינה אורחת חורף?',
      options: opts, optionImages: makeOptImages(opts), answer: oddS,
      explanation: `${oddS} היא ציפורת קיץ — מגיעה באביב ועוזבת לפני החורף.` });
  }

  // 1 winter + 3 residents = which IS a winter visitor?
  const w1 = shuffle(winterNames)[0];
  const r3 = shuffle(residentNames).slice(0, 3);
  if (w1 && r3.length === 3) {
    const opts = shuffle([w1, ...r3]);
    qs.push({ id: 'trait-season-2', type: 'trivia',
      questionText: 'מי מגיעה לישראל רק בחורף?',
      options: opts, optionImages: makeOptImages(opts), answer: w1,
      explanation: `${w1} היא אורחת חורף — מגיעה בסתיו ועוזבת באביב.` });
  }

  // 1 summer + 3 residents = which IS a summer visitor?
  const s1 = shuffle(summerNames)[0];
  const r3b = shuffle(residentNames).slice(0, 3);
  if (s1 && r3b.length === 3) {
    const opts = shuffle([s1, ...r3b]);
    qs.push({ id: 'trait-season-3', type: 'trivia',
      questionText: 'מי מהציפורים מגיעה לישראל רק בקיץ?',
      options: opts, optionImages: makeOptImages(opts), answer: s1,
      explanation: `${s1} מגיעה לישראל באביב לקינון ועוזבת לפני החורף.`, isBonus: true });
  }

  return qs;
}

// ─── REVERSE IDENTIFY QUESTIONS ("מי הX?") — visual card mode ────────────────
// Show 4 (or 2) bird image cards; ask which one is the named bird.
function buildReverseIdentifyQuestions(): GameQuestion[] {
  // Use visually distinctive birds that kids can match by look
  const distinctiveBirds = birds.filter(b =>
    ['דוכיפת','שרקרק מצוי','נקר סורי','אנפית בקר','בולבול','חוחית',
     'ירגזי','שחרור','דררה','אדום חזה','צופית בוהקת','בז מצוי',
     'נחליאלי לבן','עורבני'].includes(b.hebrewName)
  );
  const names = birds.map(b => b.hebrewName);

  return distinctiveBirds.map(bird => {
    const distractors = getDistractors(bird.hebrewName, 3, names);
    const opts = shuffle([bird.hebrewName, ...distractors]);
    return {
      id: `rev-${bird.id}`,
      type: 'identify' as const,
      bird,
      // No main image — the image cards ARE the options
      imageUrl: undefined,
      questionText: `מי ${bird.hebrewName}?`,
      options: opts,
      optionImages: makeOptImages(opts)!,
      hideOptionLabels: true,
      answer: bird.hebrewName,
      explanation: bird.funFact,
    };
  });
}

// ─── YES/NO QUESTIONS ("האם זו X?") ──────────────────────────────────────────
// Show one bird image; ask if it matches the given name.
function buildYesNoQuestions(): GameQuestion[] {
  const qs: GameQuestion[] = [];
  const shuffled = shuffle([...birds]);

  // Half are "correct" matches (answer = נכון), half are "wrong" name shown
  shuffled.slice(0, 10).forEach((bird) => {
    qs.push({
      id: `yn-yes-${bird.id}`,
      type: 'identify' as const,
      bird,
      imageUrl: bird.imageUrl,
      questionText: `האם זו ${bird.hebrewName}?`,
      options: shuffle(['נכון', 'לא נכון']),
      answer: 'נכון',
      explanation: bird.funFact,
    });
  });

  shuffled.slice(10, 20).forEach((bird, i) => {
    // Pick a wrong name (different bird)
    const wrongBird = shuffled.find(b => b.id !== bird.id && b.hebrewName !== bird.hebrewName)
      ?? shuffled[(i + 5) % shuffled.length];
    qs.push({
      id: `yn-no-${bird.id}`,
      type: 'identify' as const,
      bird,
      imageUrl: bird.imageUrl,
      questionText: `האם זו ${wrongBird.hebrewName}?`,
      options: shuffle(['נכון', 'לא נכון']),
      answer: 'לא נכון',
      explanation: `זו לא ${wrongBird.hebrewName}. זו ${bird.hebrewName}! ${bird.funFact}`,
    });
  });

  return qs;
}

// ─── PICK QUESTIONS ───────────────────────────────────────────────────────────

/** Pick questions appropriate for the given age mode */
export function pickQuestions(count: number, mode: AgeMode = '12-15'): GameQuestion[] {
  const cfg = AGE_CONFIG[mode];
  const types = cfg.questionTypes;

  const identifyQs = shuffle(buildIdentifyQuestions());
  const allTrivia  = shuffle(buildTriviaData().map((q, i) => ({ ...q, id: `trivia-${i}` })));
  const allCompare = shuffle(buildCompareQuestions());
  const allTrait   = shuffle(buildTraitAndSeasonalQuestions());
  const reverseQs  = shuffle(buildReverseIdentifyQuestions());
  const yesNoQs    = shuffle(buildYesNoQuestions());

  const traitCount   = types.includes('trait')   ? Math.min(5, allTrait.length)   : 0;
  const compareCount = types.includes('compare') ? Math.min(6, allCompare.length) : 0;
  const triviaCount  = types.includes('trivia')  ? Math.min(7, allTrivia.length)  : 0;

  // Build pool based on allowed types
  let pool: GameQuestion[] = [];

  if (types.includes('identify')) {
    const identifyCount = count - traitCount - compareCount - triviaCount;
    const cap = Math.max(0, identifyCount);

    if (mode === '6-8') {
      // For young kids: mix standard identify, reverse ("מי X?"), and yes/no ("האם זו X?")
      const each = Math.floor(cap / 3);
      const rem  = cap - each * 3;
      pool.push(...identifyQs.slice(0, each + rem));
      pool.push(...reverseQs.slice(0, each));
      pool.push(...yesNoQs.slice(0, each));
    } else {
      pool.push(...identifyQs.slice(0, cap));
    }
  }
  if (types.includes('trivia'))  pool.push(...allTrivia.slice(0, triviaCount));
  if (types.includes('compare')) pool.push(...allCompare.slice(0, compareCount));
  if (types.includes('trait'))   pool.push(...allTrait.slice(0, traitCount));

  // For 2-option mode, trim each question to 2 choices
  if (cfg.optionCount === 2) {
    pool = pool.map(q => {
      const answerIdx = q.options.indexOf(q.answer);
      // Keep the answer + one random distractor
      const distractors = q.options.filter((_, i) => i !== answerIdx);
      const distractor = distractors[Math.floor(Math.random() * distractors.length)];
      const twoOpts = shuffle([q.answer, distractor]);
      const twoOptImages = q.optionImages
        ? Object.fromEntries(twoOpts.filter(o => q.optionImages![o]).map(o => [o, q.optionImages![o]]))
        : undefined;
      return { ...q, options: twoOpts, optionImages: twoOptImages };
    });
  }

  const selected = shuffle(pool).slice(0, count);

  // Mark every 10th question as bonus if mode supports it
  return selected.map((q, i) => ({
    ...q,
    isBonus: cfg.enableBonus && (q.isBonus || (i + 1) % 10 === 0),
  }));
}
