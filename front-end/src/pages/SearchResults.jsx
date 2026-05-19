import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiPlay, FiChevronRight } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";
import SongItem from "../components/common/SongItem";
import LazyImage from "../components/common/LazyImage";
import EmptyState from "../components/common/EmptyState";
import { songService, artistService, albumService, playlistService } from "../api/services";
import { getSongArtistNames } from "../utils/songArtists";

// ── Mock Data ──────────────────────────────────────────────────────────────


// ── Card Components ────────────────────────────────────────────────────────

function ArtistCard({ artist }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <Link to={`/artist/${artist.id}`} className="flex flex-col items-center gap-2 cursor-pointer">
        <div className="w-[160px] h-[160px] rounded-full overflow-hidden bg-white/5 relative shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
          {artist.image ? (
            <LazyImage src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <span className="text-4xl font-bold text-white/20">{artist.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-nct-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <FiPlay className="w-6 h-6 text-white fill-current ml-1" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-white group-hover:text-nct-primary transition-colors leading-tight">{artist.name}</p>
          <p className="text-xs text-nct-text-dim mt-1">{artist.followers}</p>
        </div>
      </Link>
    </div>
  );
}

function AlbumCard({ album }) {
  const { playSong } = useMusic();
  const [hovered, setHovered] = useState(false);
  return (
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link to={`/album/${album.id}`} className="block relative rounded-lg overflow-hidden aspect-square mb-3 bg-white/5 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
        <LazyImage src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-20 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); playSong({ ...album, artist: album.artists }); }}
            className="w-12 h-12 rounded-full bg-nct-primary hover:bg-[#2591c4] flex items-center justify-center shadow-lg transform scale-90 hover:scale-105 transition-all"
          >
            <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
          </button>
        </div>
      </Link>
      <Link to={`/album/${album.id}`}>
        <p className="text-sm font-bold text-white group-hover:text-nct-primary transition-colors line-clamp-2 leading-snug">{album.title}</p>
      </Link>
      <p className="text-xs text-nct-text-dim mt-1 truncate">{album.artists}</p>
    </div>
  );
}

function PlaylistCard({ playlist }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link to={`/playlist/${playlist.id}`} className="block relative rounded-lg overflow-hidden aspect-square mb-3 bg-white/5 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
        <LazyImage src={playlist.image} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-20 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button className="w-12 h-12 rounded-full bg-nct-primary hover:bg-[#2591c4] flex items-center justify-center shadow-lg transform scale-90 hover:scale-105 transition-all">
            <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
          </button>
        </div>
      </Link>
      <Link to={`/playlist/${playlist.id}`}>
        <p className="text-sm font-bold text-white group-hover:text-nct-primary transition-colors line-clamp-2 leading-snug">{playlist.title}</p>
      </Link>
      <p className="text-xs text-nct-text-dim mt-1">{playlist.songs} bài · {playlist.creator}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "songs", label: "Bài hát" },
  { id: "playlists", label: "Playlist" },
  { id: "artists", label: "Nghệ sĩ" },
  { id: "albums", label: "Album" },
  { id: "videos", label: "Video" },
];

const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Sơn Tùng M-TP | CHÚNG TA CỦA TƯƠNG LAI | Official Music Video",
    artist: "Sơn Tùng M-TP",
    views: "45Tr",
    duration: "04:15",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=350&fit=crop",
    youtubeId: "vB8D3S1zO9Y"
  },
  {
    id: 2,
    title: "BÍCH PHƯƠNG - Nâng Chén Tiêu Sầu (Official Music Video)",
    artist: "Bích Phương",
    views: "18Tr",
    duration: "03:40",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=350&fit=crop",
    youtubeId: "h8mKipg2hWw"
  },
  {
    id: 3,
    title: "Sau Lời Từ Khước (Mai OST) | PHAN MẠNH QUỲNH | Official Music Video",
    artist: "Phan Mạnh Quỳnh",
    views: "32Tr",
    duration: "05:10",
    image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=600&h=350&fit=crop",
    youtubeId: "J38L47F9dG8"
  },
  {
    id: 4,
    title: "Jack - J97 | THIÊN LÝ ƠI | Official Music Video",
    artist: "Jack - J97",
    views: "25Tr",
    duration: "04:20",
    image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=600&h=350&fit=crop",
    youtubeId: "d2n28oexB4w"
  }
];

function VideoCard({ video, onPlay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="group cursor-pointer space-y-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(video)}
    >
      <div className="relative rounded-xl overflow-hidden aspect-video bg-white/5 shadow-lg group-hover:shadow-2xl transition-all group-hover:-translate-y-1">
        <LazyImage src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white tracking-wider z-10">
          {video.duration}
        </div>
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-20 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <div className="w-14 h-14 rounded-full bg-nct-primary hover:bg-[#2591c4] flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
            <FiPlay className="w-6 h-6 text-white fill-current ml-1" />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-nct-primary transition-colors line-clamp-2 leading-snug">{video.title}</h4>
        <p className="text-xs text-nct-text-dim mt-1.5">{video.artist} · {video.views} lượt xem</p>
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = searchParams.get("t") || "all";
  const { playSong, currentSong, isPlaying } = useMusic();

  const [realSongs, setRealSongs] = useState([]);
  const [realPlaylists, setRealPlaylists] = useState([]);
  const [realArtists, setRealArtists] = useState([]);
  const [realAlbums, setRealAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const isWhitespace = !query || query.trim() === "";

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const songParams = isWhitespace
          ? { ordering: "-luot_nghe", limit: 20 }
          : { search: query };

        const artistParams = isWhitespace
          ? { limit: 10 }
          : { search: query };

        const albumParams = isWhitespace
          ? { ordering: "-ngay_phat_hanh", limit: 10 }
          : { search: query };

        const [songsData, artistsData, albumsData, playlistsData] = await Promise.all([
          songService.getAll(songParams),
          artistService.getAll(artistParams),
          albumService.getAll(albumParams),
          playlistService.getAll().catch(() => [])
        ]);

        const songsRes = songsData.results || songsData;
        const mappedSongs = songsRes.map(s => ({
          id: s.id,
          title: s.tieu_de,
          artist: getSongArtistNames(s, "Không rõ"),
          image: s.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop",
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat,
          duration: s.thoi_luong || "04:00"
        }));
        setRealSongs(mappedSongs);

        const artistsRes = artistsData.results || artistsData;
        const mappedArtists = artistsRes.map(a => ({
          id: a.id,
          name: a.ten_nghe_si,
          image: a.anh_nghe_si || null,
          followers: "Nghệ sĩ"
        }));
        setRealArtists(mappedArtists);

        const albumsRes = albumsData.results || albumsData;
        const mappedAlbums = albumsRes.map(a => ({
          id: a.id,
          title: a.tieu_de,
          artists: a.ten_nghe_si || "Nghệ sĩ",
          image: a.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop"
        }));
        setRealAlbums(mappedAlbums);

        const playlistsRes = playlistsData.results || playlistsData;
        const filteredPlaylists = isWhitespace
          ? playlistsRes
          : playlistsRes.filter(p => p.tieu_de?.toLowerCase().includes(query.toLowerCase()));

        const mappedPlaylists = filteredPlaylists.map(p => ({
          id: p.id,
          title: p.tieu_de,
          creator: p.ten_chu_so_huu || "User",
          songs: p.so_luong_bai_hat || 0,
          image: p.bai_hats_detail?.[0]?.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=300&fit=crop"
        }));
        setRealPlaylists(mappedPlaylists);

      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [query, isWhitespace]);

  const setActiveTab = (id) => {
    setSearchParams({ q: query, t: id });
  };

  const totalResults = realSongs.length + realPlaylists.length + realArtists.length + realAlbums.length;

  return (
    <div className="pb-24 space-y-8">
      <div className="flex flex-col gap-1">
        {isWhitespace ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">
              🔥 Khám phá nhạc Hot
            </h1>
            <p className="text-sm text-gray-500 dark:text-nct-text-dim">Gợi ý các bản nhạc có lượt nghe cao nhất dành cho bạn</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kết quả cho <span className="text-nct-primary">"{query}"</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-nct-text-dim">Tìm thấy {totalResults} kết quả</p>
          </>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-8 border-b border-gray-200 dark:border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-4 text-sm font-bold transition-all whitespace-nowrap ${tabParam === tab.id
              ? "text-nct-primary"
              : "text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            {tab.label}
            {tabParam === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-nct-primary rounded-t-full shadow-[0_-2px_8px_rgba(0,210,210,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-nct-primary border-t-transparent" />
          </div>
        ) : totalResults === 0 ? (
          <EmptyState type="search" title="Không tìm thấy kết quả nào" description="Thử tìm kiếm với từ khóa khác" className="py-24" />
        ) : (
          <>
            {/* Tất cả */}
            {tabParam === "all" && (
              <div className="space-y-12">
                {/* Songs Section */}
                {realSongs.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Bài hát</h2>
                      <button onClick={() => setActiveTab("songs")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả bài hát <FiChevronRight className="inline w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-1">
                      {realSongs.slice(0, 6).map((song) => (
                        <SongItem
                          key={song.id}
                          song={song}
                          isCurrent={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                          onPlay={() => playSong(song, realSongs)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Playlist Section */}
                {realPlaylists.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Playlist</h2>
                      <button onClick={() => setActiveTab("playlists")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả playlist <FiChevronRight className="inline w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {realPlaylists.slice(0, 6).map(p => <PlaylistCard key={p.id} playlist={p} />)}
                    </div>
                  </section>
                )}

                {/* Albums Section */}
                {realAlbums.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Album</h2>
                      <button onClick={() => setActiveTab("albums")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả album <FiChevronRight className="inline w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {realAlbums.slice(0, 6).map(a => <AlbumCard key={a.id} album={a} />)}
                    </div>
                  </section>
                )}

                {/* Artists Section */}
                {realArtists.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Nghệ sĩ</h2>
                      <button onClick={() => setActiveTab("artists")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả nghệ sĩ <FiChevronRight className="inline w-3 h-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                      {realArtists.slice(0, 6).map(a => <ArtistCard key={a.id} artist={a} />)}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Bài hát */}
            {tabParam === "songs" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-1">
                {realSongs.map((song) => (
                  <SongItem
                    key={song.id}
                    song={song}
                    isCurrent={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    onPlay={() => playSong(song, realSongs)}
                  />
                ))}
              </div>
            )}

            {/* Playlist */}
            {tabParam === "playlists" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {realPlaylists.map(p => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
            )}

            {/* Nghệ sĩ */}
            {tabParam === "artists" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {realArtists.map(a => <ArtistCard key={a.id} artist={a} />)}
              </div>
            )}

            {/* Album */}
            {(tabParam === "albums" || tabParam === "album") && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {realAlbums.map(a => <AlbumCard key={a.id} album={a} />)}
              </div>
            )}

            {/* Video */}
            {tabParam === "videos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {MOCK_VIDEOS.map(v => (
                  <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 md:p-8">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-up">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-50 px-4 py-2 rounded-full bg-black/75 hover:bg-black text-white font-bold text-xs transition-colors border border-white/20 shadow-lg"
            >
              ✕ ĐÓNG
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
