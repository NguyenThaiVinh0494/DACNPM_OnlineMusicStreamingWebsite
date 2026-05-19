const audioDurationCache = new Map();

function formatSeconds(totalSeconds) {
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

export async function resolveSongDuration(rawDuration, audioUrl) {
  const normalized = normalizeDuration(rawDuration);
  if (normalized) {
    return normalized;
  }

  if (!audioUrl) {
    return '--:--';
  }

  if (audioDurationCache.has(audioUrl)) {
    return audioDurationCache.get(audioUrl);
  }

  const pendingPromise = new Promise((resolve) => {
    const audio = document.createElement('audio');

    const cleanup = () => {
      audio.removeAttribute('src');
      audio.load();
    };

    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const formatted = formatSeconds(audio.duration) || '--:--';
      audioDurationCache.set(audioUrl, formatted);
      cleanup();
      resolve(formatted);
    };
    audio.onerror = () => {
      audioDurationCache.set(audioUrl, '--:--');
      cleanup();
      resolve('--:--');
    };
    audio.src = audioUrl;
  });

  audioDurationCache.set(audioUrl, pendingPromise);
  const resolved = await pendingPromise;
  audioDurationCache.set(audioUrl, resolved);
  return resolved;
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
