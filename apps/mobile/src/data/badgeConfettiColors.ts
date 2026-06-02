const BADGE_CONFETTI_COLORS: Record<string, readonly string[]> = {
  'forsta-rutten': ['#3E7A44', '#6ea97b', '#2f7a3f', '#b8d4b0', '#ffffff'],
  'ny-utforskare': ['#2f7a3f', '#5a9e6f', '#8ed99c', '#e8f3ea', '#ffffff'],
  morgonpigg: ['#f5a623', '#ffd54f', '#ff8f5c', '#fff3e0', '#ffffff'],
  nattuggla: ['#4a3f6b', '#6b5b95', '#2c3e6e', '#9b8ec4', '#e8e4f4'],
  aventyrare: ['#3E7A44', '#6b8f4e', '#8b6914', '#c4a574', '#ffffff'],
  skogsmastare: ['#1e5631', '#2f7a3f', '#6ea97b', '#4a7c59', '#dce8e0'],
  legend: ['#d4a017', '#f0c14b', '#8b6914', '#fff8e1', '#ffffff'],
  milen: ['#2f7a3f', '#3E7A44', '#6ea97b', '#ffffff', '#e0efe4'],
  halvmaran: ['#2563eb', '#3E7A44', '#60a5fa', '#6ea97b', '#ffffff'],
  'hundra-km': ['#c62828', '#ef5350', '#ff8a65', '#ffcdd2', '#ffffff'],
  tusenkilometaren: ['#b8860b', '#daa520', '#f0e68c', '#fffacd', '#ffffff'],
  'tre-i-rad': ['#2f7a3f', '#43a047', '#66bb6a', '#a5d6a7', '#ffffff'],
  utmanaren: ['#e65100', '#ff9800', '#ffb74d', '#3E7A44', '#ffffff'],
  vinnaren: ['#ffd700', '#ffb300', '#2f7a3f', '#fff8e1', '#ffffff'],
  'hundra-kontroller': ['#ff6f00', '#ffa726', '#3E7A44', '#ffe0b2', '#ffffff'],
};

const DEFAULT_CONFETTI_COLORS = [
  '#2f7a3f',
  '#3E7A44',
  '#6ea97b',
  '#6b8f74',
  '#ffffff',
  '#e8f3ea',
] as const;

export function getConfettiColorsForBadge(badgeId: string): string[] {
  const palette = BADGE_CONFETTI_COLORS[badgeId];
  return palette ? [...palette] : [...DEFAULT_CONFETTI_COLORS];
}
