import { createContext, useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { playlistService, songService, favoriteService } from '../api/services';
import { AuthContext } from './AuthContext';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Global library of songs
  const [allSongs, setAllSongs] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [loadingUserMusic, setLoadingUserMusic] = useState(true);

  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  // Audio Ref shared globally
  const audioRef = useRef(null);

  // Helper to map BE song to FE song structure
  const mapSong = (s) => ({
    id: s.id,
    title: s.tieu_de,
    artist: s.id_nghe_si?.ten_nghe_si || "Unknown Artist",
    image: s.duong_dan_hinh_anh,
    audioUrl: s.duong_dan_am_thanh,
    duration: "04:00", // Default or calculated
    lyrics: s.loi_bai_hat,
    plays: s.luot_nghe
  });

  // Helper to map BE playlist to FE playlist structure
  const mapPlaylist = (p) => ({
    id: p.id,
    title: p.tieu_de,
    isPrivate: false, // Default
    songs: (p.bai_hats_detail || []).map(mapSong),
    image: p.bai_hats_detail?.[0]?.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=300&fit=crop",
    songCount: p.so_luong_bai_hat || 0
  });

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await songService.getAll();
        setAllSongs(data.results ? data.results.map(mapSong) : data.map(mapSong));
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // Fetch playlists and favorites when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoadingUserMusic(true);
        try {
          const [playlistsData, favoritesData] = await Promise.all([
            playlistService.getAll(),
            favoriteService.getAll()
          ]);
          setMyPlaylists(Array.isArray(playlistsData) ? playlistsData.map(mapPlaylist) : []);
          setFavorites(Array.isArray(favoritesData) ? favoritesData.map(f => f.song_detail ? mapSong(f.song_detail) : null).filter(Boolean) : []);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoadingUserMusic(false);
        }
      } else {
        setMyPlaylists([]);
        setFavorites([]);
        setLoadingUserMusic(false);
      }
    };
    fetchData();
  }, [user]);

  const createNewPlaylist = async (name, isPrivate) => {
    try {
      const data = await playlistService.create({ tieu_de: name });
      setMyPlaylists([mapPlaylist(data), ...myPlaylists]);
      toast.success(`Đã tạo playlist "${name}"`);
    } catch (error) {
      toast.error("Không thể tạo playlist");
    }
  };

  const addSongToMyPlaylist = async (playlistId, song) => {
    try {
      await playlistService.addSong(playlistId, song.id);
      const updatedPlaylistData = await playlistService.getById(playlistId);
      setMyPlaylists(myPlaylists.map(pl => 
        pl.id === playlistId ? mapPlaylist(updatedPlaylistData) : pl
      ));
      toast.success(`Đã thêm "${song.title}" vào playlist`);
    } catch (error) {
      toast.error("Không thể thêm bài hát vào playlist");
    }
    closeAddToPlaylistModal();
  };

  const removeSongFromMyPlaylist = async (playlistId, songId) => {
    try {
      await playlistService.removeSong(playlistId, songId);
      setMyPlaylists(myPlaylists.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter(s => s.id !== songId), songCount: pl.songCount - 1 };
        }
        return pl;
      }));
      toast.success(`Đã xóa bài hát khỏi playlist`);
    } catch (error) {
      toast.error("Không thể xóa bài hát khỏi playlist");
    }
  };

  const deleteMyPlaylist = async (playlistId) => {
    try {
      await playlistService.delete(playlistId);
      setMyPlaylists(myPlaylists.filter(pl => pl.id !== playlistId));
      toast.success('Đã xóa playlist');
    } catch (error) {
      toast.error("Không thể xóa playlist");
    }
  };

  const updateMyPlaylist = async (playlistId, updates) => {
    try {
      const data = await playlistService.update(playlistId, { tieu_de: updates.title });
      setMyPlaylists(myPlaylists.map(pl => 
        pl.id === playlistId ? mapPlaylist(data) : pl
      ));
      toast.success("Đã cập nhật playlist");
    } catch (error) {
      toast.error("Không thể cập nhật playlist");
    }
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

  const toggleFavorite = async (song) => {
    try {
      const isFav = favorites.some(s => s.id === song.id);
      if (isFav) {
        // Find the favorite ID to delete
        const favs = await favoriteService.getAll();
        const favToDelete = favs.find(f => f.id_bai_hat === song.id);
        if (favToDelete) {
          await favoriteService.remove(favToDelete.id);
        }
        setFavorites(favorites.filter(s => s.id !== song.id));
        toast.success(`Đã xóa "${song.title}" khỏi Yêu thích`);
      } else {
        await favoriteService.toggle(song.id);
        setFavorites([song, ...favorites]);
        toast.success(`Đã thêm "${song.title}" vào Yêu thích`);
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
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
      audioRef,
      loadingUserMusic
    }}>
      {children}
    </MusicContext.Provider>
  );
};
