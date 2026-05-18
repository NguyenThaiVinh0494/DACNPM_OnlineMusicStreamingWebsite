export function getSongArtists(song) {
  if (Array.isArray(song?.nghe_sis) && song.nghe_sis.length > 0) {
    return song.nghe_sis;
  }

  if (song?.id_nghe_si) {
    return [song.id_nghe_si];
  }

  return [];
}

export function getSongArtistNames(song, fallback = 'Không rõ') {
  const artists = getSongArtists(song);
  if (!artists.length) {
    return fallback;
  }

  return artists
    .map((artist) => artist?.ten_nghe_si)
    .filter(Boolean)
    .join(', ');
}

export function getSongPrimaryArtist(song) {
  return getSongArtists(song)[0] || null;
}
