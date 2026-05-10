import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiPlay, FiHeart, FiMoreHorizontal, FiUserPlus, FiCheck } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_SONGS = [
  { id: 1, title: "Yêu Em Thì Gật Đầu", artist: "Ngô Mạnh Thắng, Meme Media", duration: "04:02", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" },
  { id: 2, title: "Yêu Em Thì Gật Đầu (Lofi)", artist: "Ngô Mạnh Thắng", duration: "03:45", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop" },
  { id: 3, title: "Nếu Yêu Em Thì Gật Đầu", artist: "Thanh Thơ", duration: "04:20", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop" },
  { id: 4, title: "Yêu Em Thì Gật Đầu (Tú Remix)", artist: "Ngô Mạnh Thắng", duration: "03:58", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
  { id: 5, title: "Yêu Em Thì Gật Đầu (ZoneH Remix)", artist: "Ngô Mạnh Thắng", duration: "04:15", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=100&h=100&fit=crop" },
  { id: 6, title: "Yêu Em Thì Gật Đầu (Acoustic)", artist: "Lê Bảo Hân", duration: "03:30", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=100&h=100&fit=crop" },
];

const MOCK_PLAYLISTS = [
  { id: 1, title: "Nhạc Trẻ Hay 2024", creator: "NCT Music", songs: 42, image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 2, title: "Top Hits Việt Nam", creator: "NCT Official", songs: 30, image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop" },
  { id: 3, title: "Ballad Tâm Trạng", creator: "NCT Music", songs: 25, image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 4, title: "Remix Hot TikTok", creator: "DJ Minh Trí", songs: 38, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 5, title: "Acoustic Covers", creator: "Lê Bảo Hân", songs: 20, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
];

const MOCK_ARTISTS = [
  { id: 1, name: "Ngô Mạnh Thắng", followers: "97 người theo dõi", image: null },
  { id: 2, name: "Đậu Thị Hoài Thanh", followers: "1 người theo dõi", image: null },
  { id: 3, name: "Trần Thị Phượng Em", followers: "0 người theo dõi", image: null },
  { id: 4, name: "EM XINH \"SAY HI\"", followers: "19.372 người theo dõi", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=300&h=300&fit=crop" },
  { id: 5, name: "Đặng Thập Yêu Quân", followers: "6.357 người theo dõi", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 6, name: "Sơn Tùng M-TP", followers: "245.000 người theo dõi", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop" },
  { id: 7, name: "Bích Phương", followers: "180.000 người theo dõi", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 8, name: "Jack - J97", followers: "310.000 người theo dõi", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=300&h=300&fit=crop" },
];

const MOCK_ALBUMS = [
  { id: 1, title: "Yêu Em Thì Gật Đầu (Lofi Mem...)", artists: "Ngô Mạnh Thắng, Meme Media", year: "2024", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 2, title: "Yêu Em Thì Gật Đầu", artists: "Lê Bảo Hân", year: "2024", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 3, title: "Nếu Yêu Em Thì Gật Đầu", artists: "Thanh Thơ", year: "2024", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 4, title: "Yêu Em Thì Gật Đầu (Tú Remix)", artists: "Ngô Mạnh Thắng, Meme Media", year: "2024", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 5, title: "Yêu Em Thì Gật Đầu (ZoneH R...)", artists: "Ngô Mạnh Thắng, Meme Media", year: "2024", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
  { id: 6, title: "Yêu Em Thì Gật Đầu (Acoustic)", artists: "Lê Bảo Hân", year: "2024", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop" },
  { id: 7, title: "Yêu Em Thì Gật Đầu (Piano Ver)", artists: "Ngô Mạnh Thắng", year: "2024", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=300&h=300&fit=crop" },
  { id: 8, title: "Yêu Em Thì Gật Đầu (EDM Mix)", artists: "DJ Remix", year: "2024", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=300&h=300&fit=crop" },
  { id: 9, title: "Yêu Em Thì Gật Đầu (Slow)", artists: "Thanh Thơ", year: "2023", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop" },
  { id: 10, title: "Yêu Em Thì Gật Đầu (OST)", artists: "Ngô Mạnh Thắng", year: "2023", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function ArtistCard({ artist }) {
  const [followed, setFollowed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3 group">
      <Link to={`/artist/${artist.id}`} className="flex flex-col items-center gap-2 cursor-pointer">
        <div className="w-[160px] h-[160px] rounded-full overflow-hidden bg-gray-700 relative flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
          {artist.image ? (
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-gray-400 fill-current">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <FiPlay className="w-10 h-10 text-white fill-current ml-1" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors leading-tight">{artist.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{artist.followers}</p>
        </div>
      </Link>
      <button
        onClick={() => setFollowed(f => !f)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
          followed
            ? "bg-teal-500 border-teal-500 text-white"
            : "border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-500 dark:hover:text-teal-400"
        }`}
      >
        {followed ? <FiCheck className="w-3 h-3" /> : <FiUserPlus className="w-3 h-3" />}
        {followed ? "Đang theo dõi" : "Theo dõi"}
      </button>
    </div>
  );
}

function AlbumCard({ album }) {
  const [hovered, setHovered] = useState(false);
  const { playSong } = useMusic();

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/album/${album.id}`}>
        <div className="relative rounded-lg overflow-hidden mb-3 aspect-square bg-gray-200 dark:bg-gray-700 shadow-md group-hover:shadow-xl transition-shadow">
          <img src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); playSong({ id: album.id, title: album.title, artist: album.artists, image: album.image, duration: "03:45" }); }}
              className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-lg transition-colors"
            >
              <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
            </button>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
          {album.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{album.artists}</p>
      </Link>
    </div>
  );
}

function PlaylistCard({ playlist }) {
  const [hovered, setHovered] = useState(false);


  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative rounded-lg overflow-hidden mb-3 aspect-square bg-gray-200 dark:bg-gray-700 shadow-md group-hover:shadow-xl transition-shadow">
        <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-lg transition-colors">
            <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">{playlist.title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{playlist.songs} bài · {playlist.creator}</p>
    </div>
  );
}

function SongRow({ song, index }) {
  const { playSong, currentSong, isPlaying, toggleFavorite, favorites } = useMusic();
  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.some(f => f.id === song.id);

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-white/5 ${isCurrent ? "bg-teal-50 dark:bg-teal-900/20" : ""}`}
      onClick={() => playSong(song, MOCK_SONGS)}
    >
      <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
        {isCurrent && isPlaying ? (
          <span className="text-teal-500">▶</span>
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        {!isCurrent && <FiPlay className="w-4 h-4 hidden group-hover:block mx-auto text-teal-500" />}
      </div>
      <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrent ? "text-teal-500" : "text-gray-900 dark:text-white"}`}>{song.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(song); }}
          className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${isFav ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          <FiHeart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>
        <button className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
          <FiMoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{song.duration}</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "songs", label: "Bài hát" },
  { id: "playlists", label: "Playlist" },
  { id: "artists", label: "Nghệ sĩ" },
  { id: "albums", label: "Album" },
  { id: "videos", label: "Video" },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = searchParams.get("t") || "all";
  const [activeTab, setActiveTab] = useState(tabParam);

  return (
    <div className="pb-24 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kết quả tìm kiếm</h1>

      {/* Tab Bar */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`search-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-teal-500 dark:text-teal-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 dark:bg-teal-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tất cả */}
      {activeTab === "all" && (
        <div className="space-y-10">
          {/* Songs preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bài hát</h2>
              <button onClick={() => setActiveTab("songs")} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 uppercase tracking-wider transition-colors">Tất cả</button>
            </div>
            <div className="flex flex-col">
              {MOCK_SONGS.slice(0, 4).map((song, i) => <SongRow key={song.id} song={song} index={i} />)}
            </div>
          </section>

          {/* Artists preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nghệ sĩ</h2>
              <button onClick={() => setActiveTab("artists")} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 uppercase tracking-wider transition-colors">Tất cả</button>
            </div>
            <div className="flex flex-wrap gap-8">
              {MOCK_ARTISTS.slice(0, 5).map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          </section>

          {/* Albums preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Album</h2>
              <button onClick={() => setActiveTab("albums")} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 uppercase tracking-wider transition-colors">Tất cả</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {MOCK_ALBUMS.slice(0, 5).map(a => <AlbumCard key={a.id} album={a} />)}
            </div>
          </section>
        </div>
      )}

      {/* Bài hát */}
      {activeTab === "songs" && (
        <div className="flex flex-col">
          {MOCK_SONGS.map((song, i) => <SongRow key={song.id} song={song} index={i} />)}
        </div>
      )}

      {/* Playlist */}
      {activeTab === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {MOCK_PLAYLISTS.map(p => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      )}

      {/* Nghệ sĩ */}
      {activeTab === "artists" && (
        <div className="flex flex-wrap gap-10">
          {MOCK_ARTISTS.map(a => <ArtistCard key={a.id} artist={a} />)}
        </div>
      )}

      {/* Album */}
      {activeTab === "albums" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {MOCK_ALBUMS.map(a => <AlbumCard key={a.id} album={a} />)}
        </div>
      )}

      {/* Video */}
      {activeTab === "videos" && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
          <svg className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.277A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-lg font-medium">Không tìm thấy video nào</p>
          <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-medium">Nhập từ khóa để tìm kiếm</p>
        </div>
      )}
    </div>
  );
}
