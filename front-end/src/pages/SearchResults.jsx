import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiPlay, FiChevronRight } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";
import SongItem from "../components/common/SongItem";
import LazyImage from "../components/common/LazyImage";
import EmptyState from "../components/common/EmptyState";
import { songService } from "../api/services";

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_SONGS = [
  { id: 101, title: "Yêu Em Thì Gật Đầu", artist: "Ngô Mạnh Thắng, Meme Media", duration: "04:02", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" },
  { id: 102, title: "Yêu Em Thì Gật Đầu (Lofi)", artist: "Ngô Mạnh Thắng", duration: "03:45", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop" },
  { id: 103, title: "Nếu Yêu Em Thì Gật Đầu", artist: "Thanh Thơ", duration: "04:20", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop" },
  { id: 104, title: "Yêu Em Thì Gật Đầu (Tú Remix)", artist: "Ngô Mạnh Thắng", duration: "03:58", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
  { id: 105, title: "Yêu Em Thì Gật Đầu (ZoneH Remix)", artist: "Ngô Mạnh Thắng", duration: "04:15", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=100&h=100&fit=crop" },
  { id: 106, title: "Yêu Em Thì Gật Đầu (Acoustic)", artist: "Lê Bảo Hân", duration: "03:30", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=100&h=100&fit=crop" },
];

const MOCK_PLAYLISTS = [
  { id: 201, title: "Nhạc Trẻ Hay 2024", creator: "NCT Music", songs: 42, image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 202, title: "Top Hits Việt Nam", creator: "NCT Official", songs: 30, image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop" },
  { id: 203, title: "Ballad Tâm Trạng", creator: "NCT Music", songs: 25, image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 204, title: "Remix Hot TikTok", creator: "DJ Minh Trí", songs: 38, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 205, title: "Acoustic Covers", creator: "Lê Bảo Hân", songs: 20, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
];

const MOCK_ARTISTS = [
  { id: 1, name: "Ngô Mạnh Thắng", followers: "97 người theo dõi", image: null },
  { id: 4, name: 'EM XINH "SAY HI"', followers: "19.372 người theo dõi", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=300&h=300&fit=crop" },
  { id: 5, name: "Đặng Thập Yêu Quân", followers: "6.357 người theo dõi", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 6, name: "Sơn Tùng M-TP", followers: "245.000 người theo dõi", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop" },
];

const MOCK_ALBUMS = [
  { id: 1, title: "Yêu Em Thì Gật Đầu (Lofi Memories)", artists: "Ngô Mạnh Thắng", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 2, title: "Yêu Em Thì Gật Đầu", artists: "Lê Bảo Hân", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 3, title: "Nếu Yêu Em Thì Gật Đầu", artists: "Thanh Thơ", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 4, title: "Yêu Em Thì Gật Đầu (Tú Remix)", artists: "Ngô Mạnh Thắng", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
];

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
      <div className="relative rounded-lg overflow-hidden aspect-square mb-3 bg-white/5 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
        <LazyImage src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <Link to={`/album/${album.id}`} className="absolute inset-0 z-10" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-20 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); playSong({ ...album, artist: album.artists }); }}
            className="w-12 h-12 rounded-full bg-nct-primary hover:bg-[#2591c4] flex items-center justify-center shadow-lg transform scale-90 hover:scale-105 transition-all"
          >
            <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
          </button>
        </div>
      </div>
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
      <div className="relative rounded-lg overflow-hidden aspect-square mb-3 bg-white/5 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
        <LazyImage src={playlist.image} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button className="w-12 h-12 rounded-full bg-nct-primary hover:bg-[#2591c4] flex items-center justify-center shadow-lg transform scale-90 hover:scale-105 transition-all">
            <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
          </button>
        </div>
      </div>
      <p className="text-sm font-bold text-white group-hover:text-nct-primary transition-colors line-clamp-2 leading-snug">{playlist.title}</p>
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

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = searchParams.get("t") || "all";
  const { playSong, currentSong, isPlaying } = useMusic();
  
  const [realSongs, setRealSongs] = useState([]);

  useEffect(() => {
    const fetchRealSongs = async () => {
      if (!query) return;
      try {
        const data = await songService.getAll({ search: query });
        const results = data.results || data;
        const mapped = results.map(s => ({
          id: s.id,
          title: s.tieu_de,
          artist: s.id_nghe_si?.ten_nghe_si || "Không rõ",
          image: s.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop",
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat,
          duration: s.thoi_luong || null
        }));
        setRealSongs(mapped);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      }
    };
    fetchRealSongs();
  }, [query]);

  const setActiveTab = (id) => {
    setSearchParams({ q: query, t: id });
  };

  const q = query.toLowerCase();
  const mockSongs = MOCK_SONGS.filter(s => 
    s.title.toLowerCase().includes(q) || 
    s.artist.toLowerCase().includes(q)
  );
  const filteredSongs = [...realSongs, ...mockSongs];

  return (
    <div className="pb-24 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kết quả cho <span className="text-nct-primary">"{query}"</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-nct-text-dim">Tìm thấy {filteredSongs.length} bài hát</p>
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
        {!query ? (
          <EmptyState type="search" title="Nhập từ khóa để tìm kiếm" className="py-24" />
        ) : (
          <>
            {/* Tất cả */}
            {tabParam === "all" && (
              <div className="space-y-12">
                {/* Songs Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Bài hát</h2>
                    <button onClick={() => setActiveTab("songs")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả bài hát <FiChevronRight className="inline w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-1">
                    {filteredSongs.slice(0, 6).map((song) => (
                      <SongItem 
                        key={song.id} 
                        song={song} 
                        isCurrent={currentSong?.id === song.id}
                        isPlaying={isPlaying}
                        onPlay={() => playSong(song, filteredSongs)}
                      />
                    ))}
                  </div>
                </section>

                {/* Playlist Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Playlist</h2>
                    <button onClick={() => setActiveTab("playlists")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả playlist <FiChevronRight className="inline w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {MOCK_PLAYLISTS.slice(0, 6).map(p => <PlaylistCard key={p.id} playlist={p} />)}
                  </div>
                </section>

                {/* Albums Section (NEW) */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Album</h2>
                    <button onClick={() => setActiveTab("albums")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả album <FiChevronRight className="inline w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {MOCK_ALBUMS.slice(0, 6).map(a => <AlbumCard key={a.id} album={a} />)}
                  </div>
                </section>

                {/* Artists Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">Nghệ sĩ</h2>
                    <button onClick={() => setActiveTab("artists")} className="text-[14px] text-gray-500 dark:text-nct-text-dim hover:text-gray-900 dark:hover:text-white transition-colors">Tất cả nghệ sĩ <FiChevronRight className="inline w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                    {MOCK_ARTISTS.slice(0, 6).map(a => <ArtistCard key={a.id} artist={a} />)}
                  </div>
                </section>
              </div>
            )}

            {/* Bài hát */}
            {tabParam === "songs" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-1">
                {filteredSongs.map((song) => (
                  <SongItem 
                    key={song.id} 
                    song={song} 
                    isCurrent={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    onPlay={() => playSong(song, filteredSongs)}
                  />
                ))}
              </div>
            )}

            {/* Playlist */}
            {tabParam === "playlists" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {MOCK_PLAYLISTS.map(p => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
            )}

            {/* Nghệ sĩ */}
            {tabParam === "artists" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {MOCK_ARTISTS.map(a => <ArtistCard key={a.id} artist={a} />)}
              </div>
            )}

            {/* Album */}
            {(tabParam === "albums" || tabParam === "album") && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {MOCK_ALBUMS.map(a => <AlbumCard key={a.id} album={a} />)}
              </div>
            )}

            {/* Video */}
            {tabParam === "videos" && (
              <EmptyState type="search" title="Không tìm thấy video nào" description="Thử tìm kiếm với từ khóa khác" className="py-24" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
