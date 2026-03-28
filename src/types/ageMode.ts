export type AgeMode = '6-8' | '9-11' | '12-15';

export interface AgeModeConfig {
  label: string;
  timerSeconds: number;
  showTimer: boolean;
  maxLives: number;
  totalQuestions: number;
  questionTypes: ('identify' | 'trivia' | 'compare')[];
  optionCount: 2 | 4;
  showStreak: boolean;
  enableBonus: boolean;
  fontSize: 'large' | 'normal';
}

export const AGE_CONFIG: Record<AgeMode, AgeModeConfig> = {
  '6-8': {
    label: 'כיתות א–ב',
    timerSeconds: 45,
    showTimer: false,
    maxLives: 5,
    totalQuestions: 20,
    questionTypes: ['identify'],
    optionCount: 2,
    showStreak: false,
    enableBonus: false,
    fontSize: 'large',
  },
  '9-11': {
    label: 'כיתות ג–ה',
    timerSeconds: 30,
    showTimer: true,
    maxLives: 3,
    totalQuestions: 30,
    questionTypes: ['identify', 'trivia'],
    optionCount: 4,
    showStreak: true,
    enableBonus: true,
    fontSize: 'normal',
  },
  '12-15': {
    label: 'כיתות ו–ט',
    timerSeconds: 20,
    showTimer: true,
    maxLives: 3,
    totalQuestions: 40,
    questionTypes: ['identify', 'trivia', 'compare'],
    optionCount: 4,
    showStreak: true,
    enableBonus: true,
    fontSize: 'normal',
  },
};
