export function parseLyrics(lyricsText) {
  if (!lyricsText) return [];

  const lines = lyricsText.split('\n');
  const lrcPattern = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  const parsed = [];

  for (const line of lines) {
    const match = line.match(lrcPattern);
    if (match) {
      const minutes = Number.parseInt(match[1], 10);
      const seconds = Number.parseInt(match[2], 10);
      const ms = Number.parseInt(match[3], 10);
      const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);

      if (match[4].trim()) {
        parsed.push({ time, text: match[4].trim() });
      }
    } else if (line.trim()) {
      parsed.push({ time: -1, text: line.trim() });
    }
  }

  return parsed;
}

export function hasTimedLyrics(lines) {
  return lines.length > 0 && lines[0].time !== -1;
}

export function findActiveLyricIndex(lines, currentTime) {
  if (!hasTimedLyrics(lines)) {
    return -1;
  }

  return lines.findIndex((line, index) => {
    const nextLine = lines[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });
}
