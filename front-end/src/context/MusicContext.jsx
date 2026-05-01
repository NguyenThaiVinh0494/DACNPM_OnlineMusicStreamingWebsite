/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Global library of songs for searching/adding
  const allSongs = [
    { id: 1, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", duration: "04:20", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" },
    { id: 2, title: "Lạc Trôi", artist: "Sơn Tùng M-TP", duration: "03:52", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop" },
    { id: 3, title: "Âm Thầm Bên Em", artist: "Sơn Tùng M-TP", duration: "04:53", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop" },
    { id: 4, title: "Chắc Ai Đó Sẽ Về", artist: "Sơn Tùng M-TP", duration: "04:31", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
    { id: 5, title: "Em Của Ngày Hôm Qua", artist: "Sơn Tùng M-TP", duration: "03:55", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=100&h=100&fit=crop" },
    { id: 6, title: "Chúng Ta Của Hiện Tại", artist: "Sơn Tùng M-TP", duration: "05:01", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop" },
    { id: 7, title: "Nâng Chén Tiêu Sầu", artist: "Bích Phương", duration: "03:22", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=100&h=100&fit=crop" },
    { id: 8, title: "Thiên Lý Ơi", artist: "Jack - J97", duration: "04:10", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=100&h=100&fit=crop" },
  ];

  // Load initial state from localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('nct_favorites');
    return saved ? JSON.parse(saved) : allSongs.slice(0, 5);
  });

  const [recentSongs, setRecentSongs] = useState(() => {
    const saved = localStorage.getItem('nct_recentSongs');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentPlaylists, setRecentPlaylists] = useState(() => {
    const saved = localStorage.getItem('nct_recentPlaylists');
    return saved ? JSON.parse(saved) : [];
  });

  const [myPlaylists, setMyPlaylists] = useState(() => {
    const saved = localStorage.getItem('nct_myPlaylists');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('nct_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('nct_recentSongs', JSON.stringify(recentSongs));
  }, [recentSongs]);

  useEffect(() => {
    localStorage.setItem('nct_recentPlaylists', JSON.stringify(recentPlaylists));
  }, [recentPlaylists]);

  useEffect(() => {
    localStorage.setItem('nct_myPlaylists', JSON.stringify(myPlaylists));
  }, [myPlaylists]);

  const createNewPlaylist = (name, isPrivate) => {
    const newPlaylist = {
      id: Date.now(),
      title: name,
      isPrivate: isPrivate,
      songs: [],
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=300&fit=crop" // default image
    };
    setMyPlaylists([...myPlaylists, newPlaylist]);
  };

  const addSongToMyPlaylist = (playlistId, song) => {
    setMyPlaylists(myPlaylists.map(pl => {
      if (pl.id === playlistId) {
        // prevent duplicate
        if (!pl.songs.some(s => s.id === song.id)) {
          return { ...pl, songs: [...pl.songs, song], image: song.image };
        }
      }
      return pl;
    }));
    closeAddToPlaylistModal();
  };

  const removeSongFromMyPlaylist = (playlistId, songId) => {
    setMyPlaylists(myPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
      }
      return pl;
    }));
  };

  const deleteMyPlaylist = (playlistId) => {
    setMyPlaylists(myPlaylists.filter(pl => pl.id !== playlistId));
  };

  const updateMyPlaylist = (playlistId, updates) => {
    setMyPlaylists(myPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, ...updates };
      }
      return pl;
    }));
  };

  const openAddToPlaylistModal = (song) => {
    setSongToAdd(song);
    setIsAddPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddPlaylistModalOpen(false);
    setSongToAdd(null);
  };

  const playSong = (song, newQueue = null) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Add to recent
    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50); // keep last 50
    });

    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(s => s.id === song.id);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const song = queue[nextIndex];
      setCurrentSong(song);
      setIsPlaying(true);

      setRecentSongs(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    }
  };

  const playPrev = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const song = queue[prevIndex];
      setCurrentSong(song);
      setIsPlaying(true);

      setRecentSongs(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    }
  };

  const playAll = (songList) => {
    if (songList.length > 0) {
      setQueue(songList);
      setCurrentIndex(0);
      const song = songList[0];
      setCurrentSong(song);
      setIsPlaying(true);

      setRecentSongs(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    }
  };

  const playPlaylist = (playlist) => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      playAll(playlist.songs);
      setRecentPlaylists(prev => {
        const filtered = prev.filter(p => p.id !== playlist.id);
        return [playlist, ...filtered].slice(0, 20);
      });
    }
  };

  const toggleFavorite = (song) => {
    const isFav = favorites.some(s => s.id === song.id);
    if (isFav) {
      setFavorites(favorites.filter(s => s.id !== song.id));
    } else {
      setFavorites([song, ...favorites]);
    }
  };

  const removeFromRecent = (songId) => {
    setRecentSongs(prev => prev.filter(s => s.id !== songId));
  };

  const clearRecentSongs = () => {
    setRecentSongs([]);
  };

  const addToQueue = (song) => {
    if (!queue.some(s => s.id === song.id)) {
      setQueue(prev => [...prev, song]);
    }
  };

  const playNextInQueue = (song) => {
    if (currentIndex === -1) {
      playSong(song, [song]);
    } else {
      const newQueue = [...queue];
      newQueue.splice(currentIndex + 1, 0, song);
      setQueue(newQueue);
    }
  };

  return (
    <MusicContext.Provider value={{
      currentSong,
      isPlaying,
      queue,
      allSongs,
      recentSongs,
      recentPlaylists,
      favorites,
      myPlaylists,
      isAddPlaylistModalOpen,
      songToAdd,
      createNewPlaylist,
      updateMyPlaylist,
      addSongToMyPlaylist,
      removeSongFromMyPlaylist,
      deleteMyPlaylist,
      openAddToPlaylistModal,
      closeAddToPlaylistModal,
      playSong,
      togglePlay,
      playNext,
      playPrev,
      playAll,
      playPlaylist,
      toggleFavorite,
      removeFromRecent,
      clearRecentSongs,
      addToQueue,
      playNextInQueue
    }}>
      {children}
    </MusicContext.Provider>
  );
};
