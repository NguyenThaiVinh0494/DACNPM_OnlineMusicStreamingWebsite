import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiPlay,
  FiHeart,
  FiUserPlus,
  FiCheck,
  FiClock,
  FiMusic,
} from "react-icons/fi";
import { useMusic } from "../../context/MusicContext";

// ── Mock artist data keyed by id ───────────────────────────────────────────
const ARTISTS_DATA = {
  1: {
    id: 1,
    name: "Ngô Mạnh Thắng",
    followers: 97,
    banner:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
    image: null,
    songs: [
      {
        id: 101,
        title: "Yêu Em Thì Gật Đầu (Lofi Ver)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "03:45",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop",
      },
      {
        id: 102,
        title: "Yêu Em Thì Gật Đầu (Piano Lofi)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "04:02",
        image:
          "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=80&h=80&fit=crop",
      },
      {
        id: 103,
        title: "Yêu Em Thì Gật Đầu (Tú Remix)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "03:58",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop",
      },
      {
        id: 104,
        title: "Yêu Em Thì Gật Đầu (ZoneH Remix)",
        artist: "Ngô Mạnh Thắng",
        uploader: "Meme Media",
        duration: "04:15",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop",
      },
    ],
    albums: [
      {
        id: 1,
        title: "Yêu Em Thì Gật Đầu (Lofi Mem...)",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      },
      {
        id: 4,
        title: "Yêu Em Thì Gật Đầu (Tú Remix)",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      },
      {
        id: 5,
        title: "Yêu Em Thì Gật Đầu (ZoneH R...)",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      },
    ],
  },
  4: {
    id: 4,
    name: 'EM XINH "SAY HI"',
    followers: 19372,
    banner:
      "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=1200&h=400&fit=crop",
    image:
      "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=300&h=300&fit=crop",
    songs: [
      {
        id: 401,
        title: "Say Hi",
        artist: 'EM XINH "SAY HI"',
        uploader: "Say Hi Music",
        duration: "03:22",
        image:
          "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=80&h=80&fit=crop",
      },
      {
        id: 402,
        title: "Yêu Thì Yêu Thôi",
        artist: 'EM XINH "SAY HI"',
        uploader: "Say Hi Music",
        duration: "04:05",
        image:
          "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=80&h=80&fit=crop",
      },
    ],
    albums: [
      {
        id: 10,
        title: "Say Hi - EP",
        image:
          "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=300&h=300&fit=crop",
      },
    ],
  },
  5: {
    id: 5,
    name: "Đặng Thập Yêu Quân",
    followers: 6357,
    banner:
      "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=1200&h=400&fit=crop",
    image:
      "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=300&h=300&fit=crop",
    songs: [
      {
        id: 501,
        title: "Bài Hát Đầu Tiên",
        artist: "Đặng Thập Yêu Quân",
        uploader: "VietStar",
        duration: "04:30",
        image:
          "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=80&h=80&fit=crop",
      },
    ],
    albums: [],
  },
  6: {
    id: 6,
    name: "Sơn Tùng M-TP",
    followers: 245000,
    banner:
      "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=1200&h=400&fit=crop",
    image:
      "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop",
    songs: [
      {
        id: 601,
        title: "Nơi Này Có Anh",
        artist: "Sơn Tùng M-TP",
        uploader: "SkyMusic",
        duration: "04:20",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop",
      },
      {
        id: 602,
        title: "Lạc Trôi",
        artist: "Sơn Tùng M-TP",
        uploader: "SkyMusic",
        duration: "03:52",
        image:
          "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=80&h=80&fit=crop",
      },
      {
        id: 603,
        title: "Chúng Ta Của Hiện Tại",
        artist: "Sơn Tùng M-TP",
        uploader: "SkyMusic",
        duration: "05:01",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop",
      },
      {
        id: 604,
        title: "Muộn Rồi Mà Sao Còn",
        artist: "Sơn Tùng M-TP",
        uploader: "SkyMusic",
        duration: "04:45",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop",
      },
    ],
    albums: [
      {
        id: 20,
        title: "Sky Tour",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      },
      {
        id: 21,
        title: "M-TP Hits",
        image:
          "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=300&h=300&fit=crop",
      },
    ],
  },
  7: {
    id: 7,
    name: "Bích Phương",
    followers: 180000,
    banner:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&h=400&fit=crop",
    image:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
    songs: [
      {
        id: 701,
        title: "Nâng Chén Tiêu Sầu",
        artist: "Bích Phương",
        uploader: "YIN YANG MEDIA",
        duration: "03:22",
        image:
          "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=80&h=80&fit=crop",
      },
      {
        id: 702,
        title: "Đi Đu Đưa Đi",
        artist: "Bích Phương",
        uploader: "YIN YANG MEDIA",
        duration: "03:55",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop",
      },
    ],
    albums: [
      {
        id: 30,
        title: "Bích Phương Collection",
        image:
          "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
      },
    ],
  },
  8: {
    id: 8,
    name: "Jack - J97",
    followers: 310000,
    banner:
      "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=1200&h=400&fit=crop",
    image:
      "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=300&h=300&fit=crop",
    songs: [
      {
        id: 801,
        title: "Thiên Lý Ơi",
        artist: "Jack - J97",
        uploader: "J97 Music",
        duration: "04:10",
        image:
          "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=80&h=80&fit=crop",
      },
      {
        id: 802,
        title: "Hoa Hải Đường",
        artist: "Jack - J97",
        uploader: "J97 Music",
        duration: "03:48",
        image:
          "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=80&h=80&fit=crop",
      },
    ],
    albums: [],
  },
};

const FALLBACK_ARTIST = {
  id: 99,
  name: "Nghệ sĩ không tồn tại",
  followers: 0,
  banner:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop",
  image: null,
  songs: [],
  albums: [],
};

// ── Song Row ───────────────────────────────────────────────────────────────
function SongRow({ song, index, songList }) {
  const { playSong, currentSong, isPlaying, toggleFavorite, favorites } =
    useMusic();
  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.some((f) => f.id === song.id);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => playSong(song, songList)}
      className={`grid grid-cols-[40px_1fr_160px_1fr_60px_40px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors items-center group
        ${isCurrent ? "bg-teal-50 dark:bg-teal-900/20" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}
    >
      {/* Index / Play */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
        {hovered || isCurrent ? (
          <span className="text-teal-500 font-bold">
            {isCurrent && isPlaying ? "▐▐" : "▶"}
          </span>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Thumbnail + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
          <img
            src={song.image}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          {hovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <FiPlay className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>
        <span
          className={`text-sm font-semibold truncate ${isCurrent ? "text-teal-500" : "text-gray-900 dark:text-white"}`}
        >
          {song.title}
        </span>
      </div>

      {/* Uploader */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <FiMusic className="w-2.5 h-2.5 text-teal-500" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {song.uploader}
        </span>
      </div>

      {/* Artist */}
      <span className="text-sm text-gray-600 dark:text-gray-400 truncate hover:text-teal-500 transition-colors cursor-pointer">
        {song.artist}
      </span>

      {/* Duration */}
      <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {song.duration}
      </span>

      {/* Heart */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          className={`p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100
            ${isFav ? "text-red-500 opacity-100" : "text-gray-400 dark:text-gray-500 hover:text-red-500"}`}
        >
          <FiHeart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}

// ── Album Mini Card ────────────────────────────────────────────────────────
function AlbumMiniCard({ album }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/album/${album.id}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative rounded-lg overflow-hidden aspect-square mb-2 bg-gray-200 dark:bg-gray-700 shadow-md group-hover:shadow-xl transition-shadow">
          <img
            src={album.image}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center shadow-lg">
                <FiPlay className="w-5 h-5 text-white fill-current ml-0.5" />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
          {album.title}
        </p>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ArtistDetail() {
  const { id } = useParams();
  const artist = ARTISTS_DATA[parseInt(id)] || FALLBACK_ARTIST;
  const { playAll } = useMusic();

  const [followed, setFollowed] = useState(false);

  const handlePlayAll = () => playAll(artist.songs);

  const formatFollowers = (n) => {
    if (n >= 1000)
      return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 3).replace(/\.?0+$/, "")} nghìn`;
    return n.toString();
  };

  return (
    <div className="pb-24 -mx-8 -mt-6">
      {/* ── Hero Banner ── */}
      <div className="relative h-[320px] overflow-hidden">
        {/* Background image */}
        <img
          src={artist.banner}
          alt={artist.name}
          className="w-full h-full object-cover object-top"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />

        {/* Artist content over banner */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
            {artist.name}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 font-medium">
              {formatFollowers(artist.followers)} followers
            </span>
            <button
              onClick={() => setFollowed((f) => !f)}
              className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                followed
                  ? "bg-teal-500 border-teal-500 text-white"
                  : "border-white/60 text-white hover:bg-white/10"
              }`}
            >
              {followed ? (
                <FiCheck className="w-3.5 h-3.5" />
              ) : (
                <FiUserPlus className="w-3.5 h-3.5" />
              )}
              {followed ? "Đang theo dõi" : "Theo dõi"}
            </button>
          </div>

          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-7 py-2.5 rounded-full font-bold text-sm transition-all w-fit shadow-lg hover:shadow-teal-500/30 active:scale-95 mt-1"
          >
            <FiPlay className="w-4 h-4 fill-current" />
            Phát tất cả
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-8 pt-8 space-y-10">
        {/* Songs Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bài hát
          </h2>

          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_160px_1fr_60px_40px] gap-4 px-4 py-2 border-b border-gray-200 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <span className="text-center">#</span>
            <span>Tiêu đề</span>
            <span>Người đăng</span>
            <span>Nghệ sĩ</span>
            <span className="flex items-center justify-center">
              <FiClock className="w-3.5 h-3.5" />
            </span>
            <span></span>
          </div>

          {artist.songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <p>Chưa có bài hát nào</p>
            </div>
          ) : (
            <div className="mt-1">
              {artist.songs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  songList={artist.songs}
                />
              ))}
            </div>
          )}
        </section>

        {/* Albums Section */}
        {artist.albums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Album
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {artist.albums.map((alb) => (
                <AlbumMiniCard key={alb.id} album={alb} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
