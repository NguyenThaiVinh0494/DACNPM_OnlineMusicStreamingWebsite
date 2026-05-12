/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Audio Ref shared globally so LyricsView can read currentTime
  const audioRef = useRef(null);

  // Global library of songs for searching/adding
  const allSongs = [
    { id: 1, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", duration: "04:20", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Lạc Trôi", artist: "Sơn Tùng M-TP", duration: "03:52", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 3, title: "Âm Thầm Bên Em", artist: "Sơn Tùng M-TP", duration: "04:53", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: 4, title: "Chắc Ai Đó Sẽ Về", artist: "Sơn Tùng M-TP", duration: "04:31", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { id: 5, title: "Em Của Ngày Hôm Qua", artist: "Sơn Tùng M-TP", duration: "03:55", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { id: 6, title: "Chúng Ta Của Hiện Tại", artist: "Sơn Tùng M-TP", duration: "05:01", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { id: 7, title: "Nâng Chén Tiêu Sầu", artist: "Bích Phương", duration: "03:22", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { id: 8, title: "Thiên Lý Ơi", artist: "Jack - J97", duration: "04:10", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=100&h=100&fit=crop", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
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
    toast.success(`Đã tạo playlist "${name}"`);
  };

  const addSongToMyPlaylist = (playlistId, song) => {
    setMyPlaylists(myPlaylists.map(pl => {
      if (pl.id === playlistId) {
        // prevent duplicate
        if (!pl.songs.some(s => s.id === song.id)) {
          toast.success(`Đã thêm "${song.title}" vào playlist`);
          return { ...pl, songs: [...pl.songs, song], image: song.image };
        } else {
          toast.error(`Bài hát đã tồn tại trong playlist`);
        }
      }
      return pl;
    }));
    closeAddToPlaylistModal();
  };

  const removeSongFromMyPlaylist = (playlistId, songId) => {
    setMyPlaylists(myPlaylists.map(pl => {
      if (pl.id === playlistId) {
        toast.success(`Đã xóa bài hát khỏi playlist`);
        return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
      }
      return pl;
    }));
  };

  const deleteMyPlaylist = (playlistId) => {
    setMyPlaylists(myPlaylists.filter(pl => pl.id !== playlistId));
    toast.success('Đã xóa playlist');
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

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const toggleLyrics = () => {
    setIsLyricsOpen(!isLyricsOpen);
  };

  const toggleQueue = () => {
    setIsQueueOpen(!isQueueOpen);
  };

  const jumpToQueueIndex = (index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      const song = queue[index];
      setCurrentSong(song);
      setIsPlaying(true);
      
      setRecentSongs(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    }
  };

  const playNext = (isAutoPlay = false) => {
    if (queue.length === 0) return;

    if (isAutoPlay && repeatMode === 2) {
      // Repeat current song, no index change needed
      // (Actual playback restart is handled in audio element)
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      // Avoid playing the same song if queue > 1
      if (queue.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    } else {
      if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        if (repeatMode === 1) {
          nextIndex = 0; // loop back
        } else {
          return; // end of queue, no repeat
        }
      }
    }

    setCurrentIndex(nextIndex);
    const song = queue[nextIndex];
    setCurrentSong(song);
    setIsPlaying(true);

    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50);
    });
  };

  const playPrev = () => {
    if (queue.length === 0) return;

    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      if (currentIndex > 0) {
        prevIndex = currentIndex - 1;
      } else {
        if (repeatMode === 1) {
          prevIndex = queue.length - 1; // loop back to end
        } else {
          prevIndex = 0;
        }
      }
    }

    setCurrentIndex(prevIndex);
    const song = queue[prevIndex];
    setCurrentSong(song);
    setIsPlaying(true);

    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50);
    });
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
      toast.success(`Đã xóa "${song.title}" khỏi Yêu thích`);
    } else {
      setFavorites([song, ...favorites]);
      toast.success(`Đã thêm "${song.title}" vào Yêu thích`);
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
      toast.success(`Đã thêm "${song.title}" vào danh sách phát`);
    } else {
      toast.error(`Bài hát đã có trong danh sách phát`);
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
    toast.success(`Sẽ phát tiếp theo: "${song.title}"`);
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
      playNextInQueue,
      isShuffle,
      repeatMode,
      toggleShuffle,
      toggleRepeat,
      isLyricsOpen,
      toggleLyrics,
      isQueueOpen,
      toggleQueue,
      jumpToQueueIndex,
      audioRef
    }}>
      {children}
    </MusicContext.Provider>
  );
};
