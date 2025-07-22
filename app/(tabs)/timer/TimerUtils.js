export const SPACING = 16;
export const TAB_HEIGHT = 48;
export const BUTTON_RADIUS = 16;

export const COLORS = {
  pomodoro: '#C94F4F',
  short: '#3A86FF',
  long: '#FFD166',
  stopwatch: '#232325',
  white: '#fff',
  text: '#232325',
  shadow: 'rgba(0,0,0,0.08)'
};

export const DEFAULT_DURATIONS = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export const MODES = [
  { key: 'pomodoro', label: 'Pomodoro' },
  { key: 'short', label: 'Short Break' },
  { key: 'long', label: 'Long Break' },
  { key: 'stopwatch', label: 'Stopwatch' },
];

export function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
} 