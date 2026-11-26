export function formatXp(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatStreak(days: number): string {
  return `${days} day streak`;
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] || 'L').toUpperCase();
}
