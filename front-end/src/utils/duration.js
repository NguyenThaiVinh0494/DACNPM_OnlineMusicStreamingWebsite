export function formatSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return null;
  }

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function normalizeDuration(rawDuration) {
  if (typeof rawDuration === 'number') {
    return formatSeconds(rawDuration);
  }

  if (typeof rawDuration === 'string') {
    const trimmed = rawDuration.trim();
    if (!trimmed || trimmed === '__' || trimmed === '—') {
      return null;
    }

    if (/^\d+:\d{2}$/.test(trimmed)) {
      return trimmed.padStart(5, '0');
    }

    const numericValue = Number(trimmed);
    if (Number.isFinite(numericValue)) {
      return formatSeconds(numericValue);
    }
  }

  return null;
}

export function formatSongDuration(rawDuration) {
  return normalizeDuration(rawDuration) || '--:--';
}

export async function resolveSongDuration(rawDuration, audioUrl) {
  const normalized = normalizeDuration(rawDuration);
  if (normalized) {
    return normalized;
  }

  return audioUrl ? '--:--' : '--:--';
}

export async function enrichSongsWithDuration(songs, mapSong) {
  return Promise.all(
    songs.map(async (song) => {
      const mappedSong = mapSong(song);
      const duration = await resolveSongDuration(song.thoi_luong ?? mappedSong.duration, mappedSong.audioUrl);
      return { ...mappedSong, duration };
    }),
  );
}
