export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const paddedSecs = secs.toString().padStart(2, '0');

  if (hours > 0) {
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins.toString().padStart(2, '0')}:${paddedSecs}`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
