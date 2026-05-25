/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { playlistService, songService, favoriteService, historyService } from '../api/services';
import { enrichSongsWithDuration } from '../utils/duration';
import { AuthContext } from './AuthContext';
import { getSongArtistNames, getSongPrimaryArtist } from '../utils/songArtists';
import { optimizeCloudinaryImage } from '../utils/media';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

const mapSong = (s) => {
  const primaryArtist = getSongPrimaryArtist(s);

  return {
    id: s.id,
    title: s.tieu_de,
    artist: getSongArtistNames(s, "Unknown Artist"),
    artistId: primaryArtist?.id || null,
    artistAvatar: optimizeCloudinaryImage(primaryArtist?.anh_nghe_si || s.duong_dan_hinh_anh || '', { width: 120, height: 120 }),
    image: optimizeCloudinaryImage(s.duong_dan_hinh_anh, { width: 300, height: 300 }),
    audioUrl: s.duong_dan_am_thanh,
    duration: s.thoi_luong || null,
    lyrics: s.loi_bai_hat,
    plays: s.luot_nghe || 0,
    likeCount: s.so_luot_thich || 0,
    isFavorite: Boolean(s.da_thich),
    genreId: s.id_the_loai?.id || null,
    genreName: s.id_the_loai?.ten_the_loai || '',
    albumId: s.id_album?.id || null,
    uploader: s.id_nguoi_dang?.username || 'Hệ thống',
  };
};

const mapPlaylist = (p) => ({
  id: p.id,
  title: p.tieu_de,
  isPrivate: false,
  songs: (p.bai_hats_detail || []).map(mapSong),
  image: optimizeCloudinaryImage(p.bai_hats_detail?.[0]?.duong_dan_hinh_anh, { width: 300, height: 300 }) || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=300&fit=crop",
  songCount: p.so_luong_bai_hat || 0
});

const mapRecentHistory = (historyEntries) => {
  const seenSongIds = new Set();

  return historyEntries.reduce((songs, entry) => {
    if (!entry?.song_detail || seenSongIds.has(entry.song_detail.id)) {
      return songs;
    }

    seenSongIds.add(entry.song_detail.id);
    songs.push({
      ...mapSong(entry.song_detail),
      historyId: entry.id,
      listenedAt: entry.thoi_gian_nghe,
    });
    return songs;
  }, []).slice(0, 50);
};

const enrichPlaylist = async (playlist) => ({
  ...mapPlaylist(playlist),
  songs: await enrichSongsWithDuration(playlist.bai_hats_detail || [], mapSong),
});

export const MusicProvider = ({ children }) => {
  const { user, openLoginModal } = useContext(AuthContext);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playbackSessionId, setPlaybackSessionId] = useState(0);

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

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await songService.getAll();
        const songList = data.results || data;
        setAllSongs(await enrichSongsWithDuration(songList, mapSong));
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // Fetch user library and listening history when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoadingUserMusic(true);
        try {
            const [playlistsData, favoritesData, historyData] = await Promise.all([
              playlistService.getMine(),
              favoriteService.getAll(),
              historyService.getAll(),
            ]);
          const normalizedPlaylists = Array.isArray(playlistsData) ? playlistsData : playlistsData?.results || [];
          const normalizedFavorites = Array.isArray(favoritesData) ? favoritesData : favoritesData?.results || [];
          const normalizedHistory = Array.isArray(historyData) ? historyData : historyData?.results || [];
          setMyPlaylists(await Promise.all(normalizedPlaylists.map(enrichPlaylist)));
          setFavorites(
            await enrichSongsWithDuration(
              normalizedFavorites.map((favorite) => favorite.song_detail).filter(Boolean),
              mapSong,
            ),
          );
          setRecentSongs(mapRecentHistory(normalizedHistory));
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoadingUserMusic(false);
        }
      } else {
        setMyPlaylists([]);
        setFavorites([]);
        setRecentSongs([]);
        setLoadingUserMusic(false);
      }
    };
    fetchData();
  }, [user]);

  const createNewPlaylist = async (name) => {
    try {
      const data = await playlistService.create({ tieu_de: name });
      const enrichedPlaylist = await enrichPlaylist(data);
      setMyPlaylists((prev) => [enrichedPlaylist, ...prev]);
      toast.success(`Đã tạo playlist "${name}"`);
    } catch {
      toast.error("Không thể tạo playlist");
    }
  };

  const addSongToMyPlaylist = async (playlistId, song) => {
    try {
      await playlistService.addSong(playlistId, song.id);
      const updatedPlaylistData = await playlistService.getById(playlistId);
      const enrichedPlaylist = await enrichPlaylist(updatedPlaylistData);
      setMyPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? enrichedPlaylist : pl)));
      toast.success(`Đã thêm "${song.title}" vào playlist`);
    } catch {
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
    } catch {
      toast.error("Không thể xóa bài hát khỏi playlist");
    }
  };

  const deleteMyPlaylist = async (playlistId) => {
    try {
      await playlistService.delete(playlistId);
      setMyPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      toast.success('Đã xóa playlist');
    } catch {
      toast.error("Không thể xóa playlist");
    }
  };

  const updateMyPlaylist = async (playlistId, updates) => {
    try {
      const data = await playlistService.update(playlistId, { tieu_de: updates.title });
      const enrichedPlaylist = await enrichPlaylist(data);
      setMyPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? enrichedPlaylist : pl)));
      toast.success("Đã cập nhật playlist");
    } catch {
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

  const markPlaybackSession = () => {
    setPlaybackSessionId((prev) => prev + 1);
  };

  const updateSongEverywhere = (songId, updates) => {
    const applyUpdates = (song) => (song?.id === songId ? { ...song, ...updates } : song);

    setCurrentSong((song) => applyUpdates(song));
    setAllSongs((songs) => songs.map(applyUpdates));
    setQueue((songs) => songs.map(applyUpdates));
    setFavorites((songs) => songs.map(applyUpdates));
    setRecentSongs((songs) => songs.map(applyUpdates));
    setMyPlaylists((playlists) => playlists.map((playlist) => ({
      ...playlist,
      songs: playlist.songs.map(applyUpdates),
    })));
  };

  const recordSongListen = async (song) => {
    if (!song?.id) return null;

    try {
      const data = await songService.recordListen(song.id);
      updateSongEverywhere(song.id, { plays: data.luot_nghe });

      if (data.counted && user) {
        try {
          const historyData = await historyService.getAll();
          const normalizedHistory = Array.isArray(historyData) ? historyData : historyData?.results || [];
          setRecentSongs(mapRecentHistory(normalizedHistory));
        } catch (historyError) {
          console.error("Failed to refresh listening history:", historyError);
        }
      }

      return data;
    } catch (error) {
      console.error("Failed to record listen:", error);
      return null;
    }
  };

  const playSong = (song, newQueue = null) => {
    setCurrentSong(song);
    setIsPlaying(true);
    markPlaybackSession();

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
      markPlaybackSession();
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
    markPlaybackSession();
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
    markPlaybackSession();
  };

  const playAll = (songList) => {
    if (songList.length > 0) {
      setQueue(songList);
      setCurrentIndex(0);
      const song = songList[0];
      setCurrentSong(song);
      setIsPlaying(true);
      markPlaybackSession();
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
    if (!user) {
      toast.error("Vui lòng đăng nhập để tym bài hát");
      openLoginModal?.();
      return null;
    }

    if (!song?.id) {
      toast.error("Không tìm thấy bài hát");
      return null;
    }

    const wasFavorite = favorites.some((favorite) => favorite.id === song.id) || Boolean(song.isFavorite);
    const previousLikeCount = song.likeCount || 0;
    const optimisticUpdates = {
      isFavorite: !wasFavorite,
      likeCount: Math.max(0, previousLikeCount + (wasFavorite ? -1 : 1)),
    };

    updateSongEverywhere(song.id, optimisticUpdates);
    if (optimisticUpdates.isFavorite) {
      setFavorites((prev) => [{ ...song, ...optimisticUpdates }, ...prev.filter((s) => s.id !== song.id)]);
    } else {
      setFavorites((prev) => prev.filter(s => s.id !== song.id));
    }

    try {
      const result = await favoriteService.toggle(song.id);
      const nextUpdates = {
        isFavorite: result.da_thich,
        likeCount: result.so_luot_thich,
      };

      updateSongEverywhere(song.id, nextUpdates);

      if (result.da_thich) {
        setFavorites((prev) => [{ ...song, ...nextUpdates }, ...prev.filter((s) => s.id !== song.id)]);
        toast.success(`Đã thêm "${song.title}" vào Yêu thích`);
      } else {
        setFavorites((prev) => prev.filter(s => s.id !== song.id));
        toast.success(`Đã xóa "${song.title}" khỏi Yêu thích`);
      }
      return result;
    } catch (error) {
      const rollbackUpdates = {
        isFavorite: wasFavorite,
        likeCount: previousLikeCount,
      };
      updateSongEverywhere(song.id, rollbackUpdates);
      if (wasFavorite) {
        setFavorites((prev) => [{ ...song, ...rollbackUpdates }, ...prev.filter((s) => s.id !== song.id)]);
      } else {
        setFavorites((prev) => prev.filter(s => s.id !== song.id));
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Vui lòng đăng nhập để tym bài hát");
        openLoginModal?.();
      } else {
        toast.error("Thao tác thất bại");
      }
      return null;
    }
  };

  const removeFromRecent = async (songId) => {
    try {
      await historyService.removeSong(songId);
      setRecentSongs(prev => prev.filter(s => s.id !== songId));
    } catch {
      toast.error("Không thể xóa lịch sử nghe");
    }
  };

  const clearRecentSongs = async () => {
    try {
      await historyService.clear();
      setRecentSongs([]);
    } catch {
      toast.error("Không thể xóa lịch sử nghe");
    }
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
      playbackSessionId,
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
      recordSongListen,
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
