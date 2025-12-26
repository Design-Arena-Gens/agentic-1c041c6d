export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function formatRelativeDays(days: number | null): string {
  if (days === null) {
    return "N/A";
  }
  if (days < 1) {
    return "today";
  }
  if (days < 2) {
    return "yesterday";
  }
  return `${Math.round(days)} days ago`;
}

export function parseISODuration(duration?: string): number | null {
  if (!duration) {
    return null;
  }

  const regex =
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/; /* simplistic ISO parser */
  const match = duration.match(regex);
  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds] = match;
  const totalSeconds =
    (hours ? Number(hours) * 3600 : 0) +
    (minutes ? Number(minutes) * 60 : 0) +
    (seconds ? Number(seconds) : 0);

  return totalSeconds;
}

export function average(numbers: number[]): number {
  if (!numbers.length) {
    return 0;
  }
  const sum = numbers.reduce((acc, value) => acc + value, 0);
  return sum / numbers.length;
}

export function median(numbers: number[]): number {
  if (!numbers.length) {
    return 0;
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function differenceInDays(a: string, b: string): number {
  const first = new Date(a).getTime();
  const second = new Date(b).getTime();
  return Math.abs(first - second) / (1000 * 60 * 60 * 24);
}

