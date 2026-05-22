import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { FiPlay, FiChevronRight } from "react-icons/fi";
import { useMusic } from "../context/MusicContext";
import SongItem from "../components/common/SongItem";
import LazyImage from "../components/common/LazyImage";
import EmptyState from "../components/common/EmptyState";
import { songService, artistService, albumService } from "../api/services";
import { enrichSongsWithDuration } from "../utils/duration";
import { getSongArtistNames } from "../utils/songArtists";



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
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link to={`/album/${album.id}`} className="block relative rounded-lg overflow-hidden aspect-square mb-3 bg-white/5 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
        <LazyImage src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-20 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/album/${album.id}`);
            }}
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




const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "songs", label: "Bài hát" },
  { id: "artists", label: "Nghệ sĩ" },
  { id: "albums", label: "Album" },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = searchParams.get("t") || "all";
  const { playSong, currentSong, isPlaying, toggleFavorite, favorites } = useMusic();

  const [realSongs, setRealSongs] = useState([]);
  const [realArtists, setRealArtists] = useState([]);
  const [realAlbums, setRealAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

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

        const [songsData, artistsData, albumsData] = await Promise.all([
          songService.getAll(songParams),
          artistService.getAll(artistParams),
          albumService.getAll(albumParams)
        ]);

        const songsRes = songsData.results || songsData;
        const mappedSongs = await enrichSongsWithDuration(songsRes, (s) => ({
          id: s.id,
          title: s.tieu_de,
          artist: getSongArtistNames(s, "Không rõ"),
          image: s.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=100&h=100&fit=crop",
          audioUrl: s.duong_dan_am_thanh,
          lyrics: s.loi_bai_hat,
          duration: s.thoi_luong || null
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
          artists: a.id_nghe_si_detail?.ten_nghe_si || "Nghệ sĩ",
          image: a.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop"
        }));
        setRealAlbums(mappedAlbums);
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

  const totalResults = realSongs.length + realArtists.length + realAlbums.length;

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
                          isFavorite={favorites.some((favorite) => favorite.id === song.id)}
                          onPlay={() => playSong(song, realSongs)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
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
                    isFavorite={favorites.some((favorite) => favorite.id === song.id)}
                    onPlay={() => playSong(song, realSongs)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
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

          </>
        )}
      </div>
    </div>
  );
}
