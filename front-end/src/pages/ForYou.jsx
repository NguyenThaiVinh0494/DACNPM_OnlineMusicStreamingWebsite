import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiHeart,
  FiMoreHorizontal,
  FiMusic,
  FiPause,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import { songService } from "../api/services";
import { AuthContext } from "../context/AuthContext";
import { useMusic } from "../context/MusicContext";
import { enrichSongsWithDuration } from "../utils/duration";
import { findActiveLyricIndex, hasTimedLyrics, parseLyrics } from "../utils/lyrics";
import { getSongArtistNames, getSongPrimaryArtist } from "../utils/songArtists";

function formatCompactCount(value) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function getDerivedStats(song) {
  const likes = song?.likeCount || 0;

  return {
    likes: formatCompactCount(Math.max(likes, 0)),
  };
}

function mapRecommendedSong(song) {
  const primaryArtist = getSongPrimaryArtist(song);

  return {
    id: song.id,
    title: song.tieu_de,
    artist: getSongArtistNames(song, "Unknown Artist"),
    artistId: primaryArtist?.id || null,
    artistAvatar: primaryArtist?.anh_nghe_si || song.duong_dan_hinh_anh || '',
    image: song.duong_dan_hinh_anh,
    audioUrl: song.duong_dan_am_thanh,
    duration: song.thoi_luong || null,
    lyrics: song.loi_bai_hat,
    plays: song.luot_nghe || 0,
    likeCount: song.so_luot_thich || 0,
    isFavorite: Boolean(song.da_thich),
    genreId: song.id_the_loai?.id || null,
    genreName: song.id_the_loai?.ten_the_loai || '',
    albumId: song.id_album?.id || null,
    uploader: song.id_nguoi_dang?.username || 'Hệ thống',
  };
}

export default function ForYou() {
  const { user } = useContext(AuthContext);
  const {
    allSongs,
    favorites,
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    toggleFavorite,
    openAddToPlaylistModal,
    audioRef,
  } = useMusic();
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const menuRef = useRef(null);
  const lyricRefs = useRef([]);
  const allSongsRef = useRef(allSongs);
  const hasInitializedFeedRef = useRef(false);

  let derivedIndex = feed.findIndex((song) => song.id === currentSong?.id);
  if (derivedIndex === -1) derivedIndex = 0;

  const currentItem = feed[derivedIndex] || null;
  const currentItemId = currentItem?.id;
  const displayedCurrentItem = currentSong && currentItem && currentSong.id === currentItem.id
    ? {
        ...currentItem,
        likeCount: currentSong.likeCount ?? currentItem.likeCount,
        isFavorite: currentSong.isFavorite ?? currentItem.isFavorite,
      }
    : currentItem;
  const currentLyrics = parseLyrics(currentItem?.lyrics);
  const currentItemIsFavorite = displayedCurrentItem ? favorites.some((song) => song.id === displayedCurrentItem.id) || displayedCurrentItem.isFavorite : false;
  const lyricIsTimed = hasTimedLyrics(currentLyrics);
  const activeLyricIndex = findActiveLyricIndex(currentLyrics, currentTime);
  const stats = getDerivedStats(displayedCurrentItem);

  useEffect(() => {
    allSongsRef.current = allSongs;
  }, [allSongs]);

  useEffect(() => {
    let active = true;

    const fetchRecommendedSongs = async () => {
      setLoadingFeed(true);
      const fallbackSongs = allSongsRef.current.slice(0, 14);

      try {
        const params = { limit: 14 };
        const response = await songService.getRecommended(params);
        const normalized = Array.isArray(response) ? response : response?.results || [];
        const enrichedFeed = await enrichSongsWithDuration(normalized, mapRecommendedSong);
        if (!active) return;

        if (enrichedFeed.length > 0) {
          setFeed(enrichedFeed);
        } else {
          setFeed(fallbackSongs);
        }
      } catch (error) {
        console.error("Không thể tải danh sách đề xuất cho For You:", error);
        if (active) {
          setFeed(fallbackSongs);
        }
      } finally {
        if (active) {
          setLoadingFeed(false);
        }
      }
    };

    fetchRecommendedSongs();
    return () => {
      active = false;
    };
  }, [allSongs.length, user?.id]);

  useEffect(() => {
    if (!feed.length || hasInitializedFeedRef.current) {
      return;
    }

    hasInitializedFeedRef.current = true;

    if (!feed.some((song) => song.id === currentSong?.id)) {
      playSong(feed[0], feed);
    }
  }, [feed, currentSong?.id, playSong]);

  useEffect(() => {
    let animationFrameId;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };

    if (currentItemId && currentSong?.id === currentItemId) {
      animationFrameId = requestAnimationFrame(updateTime);
    } else {
      animationFrameId = requestAnimationFrame(() => setCurrentTime(0));
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [audioRef, currentItemId, currentSong?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    hasInitializedFeedRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    lyricRefs.current = [];
  }, [currentItemId]);

  useEffect(() => {
    if (activeLyricIndex === -1 || !lyricRefs.current[activeLyricIndex]) {
      return;
    }

    lyricRefs.current[activeLyricIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLyricIndex]);

  const handleNext = () => {
    if (derivedIndex < feed.length - 1) {
      playSong(feed[derivedIndex + 1], feed);
    }
  };

  const handlePrev = () => {
    if (derivedIndex > 0) {
      playSong(feed[derivedIndex - 1], feed);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentItem) return;

    const wasFavorite = currentItemIsFavorite;
    const optimisticLikeCount = Math.max(0, (displayedCurrentItem?.likeCount || 0) + (wasFavorite ? -1 : 1));
    setFeed((items) => items.map((song) => (
      song.id === currentItem.id
        ? {
            ...song,
            likeCount: optimisticLikeCount,
            isFavorite: !wasFavorite,
          }
        : song
    )));

    const result = await toggleFavorite(currentItem);
    if (!result) {
      setFeed((items) => items.map((song) => (
        song.id === currentItem.id
          ? {
              ...song,
              likeCount: displayedCurrentItem?.likeCount || 0,
              isFavorite: wasFavorite,
            }
          : song
      )));
      return;
    }

    setFeed((items) => items.map((song) => (
      song.id === currentItem.id
        ? {
            ...song,
            likeCount: result.so_luot_thich,
            isFavorite: result.da_thich,
          }
        : song
    )));
  };

  if (loadingFeed) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-nct-primary border-t-transparent" />
      </div>
    );
  }

  if (!feed.length) {
    return (
      <div className="flex h-[calc(100vh-140px)] flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
        <FiMusic className="h-14 w-14 opacity-30" />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có dữ liệu cho Dành Cho Bạn</p>
          <p className="mt-1 text-sm">Hãy nghe vài bài hát hoặc thêm bài yêu thích để hệ thống gợi ý tốt hơn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-140px)] w-full flex-col">
      <div className="mb-4 flex items-end justify-between px-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dành Cho Bạn</h2>
        </div>
      </div>

      <div className="relative flex h-full flex-1 gap-8 overflow-hidden">
        <div className="relative flex h-full w-[520px] shrink-0 flex-row items-center justify-center gap-6 rounded-3xl border border-gray-200/50 bg-white/40 backdrop-blur-md shadow-sm dark:border-white/5 dark:bg-white/5">
          <div className="group relative aspect-[4/5] w-[320px] shrink-0 overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className={`h-full w-full object-cover transition-transform duration-[20s] ${isPlaying && currentSong?.id === currentItem.id ? "scale-110" : "scale-100"}`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <button
              onClick={() => {
                if (currentSong?.id === currentItem.id) {
                  togglePlay();
                } else {
                  playSong(currentItem, feed);
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30">
                {isPlaying && currentSong?.id === currentItem.id ? <FiPause className="h-8 w-8" /> : <FiPlay className="ml-1 h-8 w-8" />}
              </div>
            </button>

            <div className="absolute bottom-6 left-6 right-6">
              <Link to={`/song/${currentItem.id}`} className="block">
                <h3 className="line-clamp-1 text-2xl font-bold text-white hover:text-cyan-300">{currentItem.title}</h3>
              </Link>
              {currentItem.artistId ? (
                <Link to={`/artist/${currentItem.artistId}`} className="text-lg text-gray-300 hover:text-white">
                  {currentItem.artist}
                </Link>
              ) : (
                <p className="text-lg text-gray-300">{currentItem.artist}</p>
              )}
            </div>
          </div>

          <div className="z-20 ml-2 flex shrink-0 items-center gap-8">
            <div className="flex flex-col items-center gap-6">
              <div className="group mb-2 cursor-pointer">
                {currentItem.artistId ? (
                  <Link to={`/artist/${currentItem.artistId}`} className="block">
                    <img
                      src={currentItem.artistAvatar || currentItem.image}
                      alt={currentItem.artist}
                      className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md transition-transform hover:scale-110"
                    />
                  </Link>
                ) : (
                  <img
                    src={currentItem.artistAvatar || currentItem.image}
                    alt={currentItem.artist}
                    className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md transition-transform hover:scale-110"
                  />
                )}
              </div>

              <button
                onClick={handleToggleFavorite}
                className="group flex flex-col items-center gap-1"
                type="button"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-sm transition-colors group-hover:bg-gray-200 dark:bg-white/5 dark:group-hover:bg-white/10">
                  <FiHeart className={`h-6 w-6 ${currentItemIsFavorite ? "fill-red-500 text-red-500" : "text-gray-700 dark:text-white"}`} />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stats.likes}</span>
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="group flex flex-col items-center gap-1"
                  type="button"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-sm transition-colors group-hover:bg-gray-200 dark:bg-white/5 dark:group-hover:bg-white/10">
                    <FiMoreHorizontal className="h-6 w-6 text-gray-700 dark:text-white" />
                  </div>
                </button>

                {showMenu ? (
                  <div className="absolute bottom-0 right-[120%] z-50 w-56 rounded-xl border border-gray-200 bg-white p-1.5 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:border-white/10 dark:bg-[#1a221f] dark:text-gray-200">
                    <button
                      onClick={() => {
                        openAddToPlaylistModal(currentItem);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                      type="button"
                    >
                      <FiPlus className="h-4 w-4" /> Thêm vào playlist
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handlePrev}
                disabled={derivedIndex === 0}
                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all ${
                  derivedIndex === 0
                    ? "cursor-not-allowed border-transparent bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600"
                    : "border-gray-200 bg-white/80 text-gray-900 hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
                type="button"
              >
                <FiArrowUp className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={derivedIndex === feed.length - 1}
                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all ${
                  derivedIndex === feed.length - 1
                    ? "cursor-not-allowed border-transparent bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-gray-600"
                    : "border-gray-200 bg-white/80 text-gray-900 hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
                type="button"
              >
                <FiArrowDown className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="mask-image-vertical relative mx-auto flex h-full max-w-[600px] flex-1 flex-col justify-center rounded-3xl border border-gray-200/50 bg-white/40 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-white/5">
          <div
            className="hide-scrollbar flex h-full flex-col items-center gap-8 overflow-y-auto px-12 py-20 text-center"
          >
            {currentLyrics.length === 0 ? (
              <div className="my-auto max-w-md">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">Chưa có lời bài hát</p>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                  Bài hát này đã có trong gợi ý, nhưng hiện chưa có lyric để hiển thị.
                </p>
              </div>
            ) : (
              currentLyrics.map((line, idx) => {
                const isActive = lyricIsTimed && idx === activeLyricIndex;

                return (
                  <p
                    key={`${currentItem.id}-${idx}`}
                    ref={(element) => {
                      lyricRefs.current[idx] = element;
                    }}
                    className={`max-w-[26ch] text-center text-4xl font-bold leading-tight transition-all duration-500 ${
                      lyricIsTimed
                        ? isActive
                          ? "scale-105 text-gray-900 opacity-100 dark:text-white"
                          : "text-gray-400 opacity-30 dark:text-gray-600"
                        : "text-gray-900 opacity-90 dark:text-white"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
