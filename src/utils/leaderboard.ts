export interface LeaderboardEntry {
  name: string;
  score: number;
  correct: number;
  total: number;
  date: string;
}

const KEY = 'bird-game-leaderboard-v1';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveScore(entry: LeaderboardEntry): void {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(KEY, JSON.stringify(board.slice(0, 10)));
}
