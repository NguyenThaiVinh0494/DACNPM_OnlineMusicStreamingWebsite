import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import LazyImage from "../../components/common/LazyImage";
import { FiHeart, FiMoreHorizontal, FiPlay, FiChevronDown, FiChevronUp, FiPlus, FiMusic, FiHeadphones } from 'react-icons/fi';
import { useMusic } from '../../context/MusicContext';
import { albumService, songService } from '../../api/services';
import { enrichSongsWithDuration } from '../../utils/duration';
import { getSongArtistNames, getSongPrimaryArtist } from '../../utils/songArtists';

export default function SongDetail() {
  const { id } = useParams();
  const { playSong, toggleFavorite, favorites, currentSong } = useMusic();
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [isHeaderPopupOpen, setIsHeaderPopupOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef(null);
  const headerPopupRef = useRef(null);
  const formatCount = (value) => Number(value || 0).toLocaleString('vi-VN');

  // Fetch bài hát từ API theo id
  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const raw = await songService.getById(id);
        const primaryArtist = getSongPrimaryArtist(raw);
        const primaryArtistId = primaryArtist?.id;
        const [featuredSongsData, featuredAlbumsData] = primaryArtistId
          ? await Promise.all([
              songService.getAll({ id_nghe_si: primaryArtistId, ordering: '-luot_nghe', limit: 6 }),
              albumService.getAll({ id_nghe_si: primaryArtistId, ordering: '-ngay_phat_hanh', limit: 5 }),
            ])
          : [[], []];

        const featuredSongsRes = featuredSongsData.results || featuredSongsData || [];
        const featuredAlbumsRes = featuredAlbumsData.results || featuredAlbumsData || [];

        const featuredSongs = await enrichSongsWithDuration(
          featuredSongsRes.filter((song) => song.id !== raw.id).slice(0, 5),
          (song) => ({
            id: song.id,
            title: song.tieu_de,
            cover: song.duong_dan_hinh_anh || primaryArtist?.anh_nghe_si || raw.duong_dan_hinh_anh || 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop',
            uploader: song.id_nguoi_dang?.username || 'Hệ thống',
            duration: song.thoi_luong || null,
            isActive: false,
            artist: getSongArtistNames(song, primaryArtist?.ten_nghe_si || 'Không rõ'),
            audioUrl: song.duong_dan_am_thanh,
            lyrics: song.loi_bai_hat || 'Chưa có lời bài hát.',
          }),
        );

        const featuredAlbums = featuredAlbumsRes.slice(0, 5).map((album) => ({
          id: album.id,
          title: album.tieu_de,
          cover: album.anh_bia || raw.duong_dan_hinh_anh || 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop',
          artist: album.id_nghe_si_detail?.ten_nghe_si || primaryArtist?.ten_nghe_si || 'Không rõ',
        }));

        setData({
          id: raw.id,
          title: raw.tieu_de,
          artist: getSongArtistNames(raw, 'Không rõ'),
          artistId: primaryArtist?.id || null,
          artistAvatar: primaryArtist?.anh_nghe_si || null,
          artistFollowers: 0,
          cover: raw.duong_dan_hinh_anh || 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=400&h=400&fit=crop',
          audioUrl: raw.duong_dan_am_thanh,
          lyrics: raw.loi_bai_hat || 'Chưa có lời bài hát.',
          plays: raw.luot_nghe || 0,
          likes: raw.so_luot_thich || 0,
          isFavorite: Boolean(raw.da_thich),
          contributor: raw.id_nguoi_dang?.username || 'Hệ thống',
          featuredSongs,
          featuredAlbums,
        });
      } catch (err) {
        console.error('Không thể tải bài hát:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null);
      }
      if (headerPopupRef.current && !headerPopupRef.current.contains(event.target)) {
        setIsHeaderPopupOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cuộn lên đầu trang khi vào
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const currentSongMatches = data && currentSong?.id === data.id;
  const displayPlays = currentSongMatches ? currentSong.plays ?? data.plays : data?.plays;
  const displayLikes = currentSongMatches ? currentSong.likeCount ?? data.likes : data?.likes;
  const isFavorite = data
    ? favorites.some((song) => song.id === data.id) || data.isFavorite || (currentSongMatches && currentSong.isFavorite)
    : false;

  const handleToggleFavorite = async () => {
    if (!data) return;

    const result = await toggleFavorite({
      id: data.id,
      title: data.title,
      artist: data.artist,
      image: data.cover,
      audioUrl: data.audioUrl,
      lyrics: data.lyrics,
      plays: displayPlays,
      likeCount: displayLikes,
      isFavorite,
    });

    if (result) {
      setData((prev) => ({
        ...prev,
        likes: result.so_luot_thich,
        isFavorite: result.da_thich,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-nct-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500 dark:text-gray-400">
        <FiMusic className="w-12 h-12 opacity-30" />
        <p>Không tìm thấy bài hát.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pb-24 px-4 pt-6 max-w-7xl mx-auto">
      
      {/* 1. Header (Ảnh bìa + Thông tin chính) */}
      <div className="flex flex-col md:flex-row gap-10 mb-16">
        {/* Cover Image */}
        <div className="w-[300px] h-[300px] shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
          <LazyImage src={data.cover} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        
        {/* Info */}
        <div className="flex flex-col justify-center py-2">
          <span className="text-[13px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-3">Bài hát</span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-5">
            {data.title}
          </h1>
          
          {/* Artist Row */}
          <div className="flex items-center gap-3 mb-8">
            <LazyImage src={data.artistAvatar} alt={data.artist} className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200 dark:border-white/10" />
            {data.artistId ? (
              <Link
                to={`/artist/${data.artistId}`}
                className="text-[17px] font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-nct-primary dark:hover:text-nct-primary transition-colors"
              >
                {data.artist}
              </Link>
            ) : (
              <span className="text-[17px] font-bold text-gray-800 dark:text-gray-200">
                {data.artist}
              </span>
            )}
          </div>
          
          {/* Interaction Stats */}
          <div className="flex items-center gap-8 mb-8 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <FiHeadphones className="text-2xl text-nct-primary" />
              <span className="text-[15px] font-bold">{formatCount(displayPlays)} lượt nghe</span>
            </div>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="flex items-center gap-2 cursor-pointer group hover:text-nct-primary transition-colors"
            >
              <FiHeart className={`text-2xl ${isFavorite ? 'fill-red-500 text-red-500' : 'group-hover:fill-nct-primary'}`} />
              <span className="text-[15px] font-bold">{formatCount(displayLikes)} tym</span>
            </button>
            <div className="relative">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHeaderPopupOpen(!isHeaderPopupOpen);
                }}
                className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${isHeaderPopupOpen ? 'bg-gray-200 dark:bg-white/10' : ''}`}
              >
                <FiMoreHorizontal className="text-xl" />
              </div>

              {/* Pop-up menu cho Header */}
              {isHeaderPopupOpen && (
                <div 
                  ref={headerPopupRef}
                  className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 py-2"
                >
                  <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                    <div className="flex items-center gap-3">
                      <FiPlus className="text-lg" />
                      <span>Thêm vào playlist</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Call to Actions */}
          <div className="flex items-center gap-4 mt-auto">
            <button
              onClick={() => playSong({ id: data.id, title: data.title, artist: data.artist, image: data.cover, audioUrl: data.audioUrl, lyrics: data.lyrics, plays: displayPlays, likeCount: displayLikes, isFavorite })}
              className="flex items-center gap-2 px-10 py-[14px] bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:opacity-90 hover:scale-105 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(0,242,254,0.3)] transition-all"
            >
              <FiPlay className="text-xl fill-white" />
              <span className="text-[15px]">Phát</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lời bài hát & Nghệ sĩ */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 mb-20">
        
        {/* Cột trái: Lời bài hát */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lời bài hát</h2>
          
          <div className="bg-gray-50 dark:bg-[#1f2422] rounded-2xl p-7 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[13px] text-gray-500 dark:text-gray-400">Đóng góp bởi:</span>
              <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{data.contributor}</span>
            </div>
            
            <div className="w-full h-px bg-gray-200 dark:bg-white/5 mb-6"></div>
            
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">
              Bài hát: {data.title} - {data.artist}
            </h3>
            
            <div className={`text-[15px] text-gray-700 dark:text-gray-300 leading-[2.2] ${!showFullLyrics ? 'line-clamp-4 mask-image-bottom' : ''} whitespace-pre-line`}>
              {data.lyrics}
            </div>
            
            <button 
              onClick={() => setShowFullLyrics(!showFullLyrics)}
              className="mt-6 flex items-center gap-1 text-[15px] font-bold text-gray-900 dark:text-white hover:text-nct-primary dark:hover:text-nct-primary transition-colors"
            >
              {showFullLyrics ? 'Thu gọn' : 'Xem thêm'}
              {showFullLyrics ? <FiChevronUp className="text-lg" /> : <FiChevronDown className="text-lg" />}
            </button>
          </div>
        </div>
        
        {/* Cột phải: Nghệ sĩ */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nghệ sĩ</h2>
          
          <div className="flex items-center gap-4">
            <LazyImage src={data.artistAvatar} alt={data.artist} className="w-[72px] h-[72px] rounded-full object-cover shadow-md border-2 border-transparent dark:border-white/5" />
            
            <div className="flex flex-col gap-1">
              {data.artistId ? (
                <Link
                  to={`/artist/${data.artistId}`}
                  className="text-[17px] font-bold text-gray-900 dark:text-white cursor-pointer hover:text-nct-primary transition-colors"
                >
                  {data.artist}
                </Link>
              ) : (
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                  {data.artist}
                </h3>
              )}
              <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {data.artistFollowers.toLocaleString()} người theo dõi
              </span>
            </div>
            
            <button className="ml-auto px-5 py-1.5 border-[1.5px] border-gray-300 dark:border-white/30 hover:border-gray-800 dark:hover:border-white text-gray-800 dark:text-white text-[13px] font-bold rounded-full transition-all">
              Theo dõi
            </button>
          </div>
        </div>

      </div>

      {/* 3. Bài hát nổi bật */}
      <div className="mb-20">
        <h2 className="text-[26px] font-bold text-gray-900 dark:text-white mb-8">
          Bài hát nổi bật của <span className="text-[#00f2fe]">{data.artist}</span>
        </h2>
        
        <div className="flex flex-col">
          {data.featuredSongs.map((song) => (
            <div 
              key={song.id} 
              onClick={() => playSong({ id: song.id, title: song.title, artist: song.artist, image: song.cover, audioUrl: song.audioUrl, lyrics: song.lyrics })}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-100 dark:border-transparent"
            >
              <div className="flex items-center gap-5">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                  <LazyImage src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <FiPlay className="text-white fill-white text-lg" />
                  </div>
                </div>
                <h4 className={`text-[15px] font-bold ${song.isActive ? 'text-[#00f2fe]' : 'text-gray-900 dark:text-white'} group-hover:text-nct-primary transition-colors`}>
                  {song.title}
                </h4>
              </div>
              
              <div className="flex items-center gap-16 pr-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-[#1a2b3c] flex items-center justify-center text-[10px] text-[#00f2fe] font-bold border border-[#00f2fe]/30">W</div>
                  <span className="hidden sm:inline">{song.uploader}</span>
                </div>
                
                <div className="flex items-center gap-4 relative">
                  <span className="text-[13px] text-gray-500 dark:text-gray-400 font-bold">{song.duration}</span>
                  
                  {/* Nút 3 chấm (Chỉ hiện khi hover vào group) */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopup(activePopup === song.id ? null : song.id);
                    }}
                    className={`w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all ${activePopup === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <FiMoreHorizontal className="text-lg" />
                  </button>

                  {/* Pop-up menu */}
                  {activePopup === song.id && (
                    <div 
                      ref={popupRef}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 py-2"
                    >
                      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                        <div className="flex items-center gap-3">
                          <FiPlus className="text-lg" />
                          <span>Thêm vào playlist</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Album nổi bật */}
      <div>
        <h2 className="text-[26px] font-bold text-gray-900 dark:text-white mb-8">
          Album nổi bật của <span className="text-[#00f2fe]">{data.artist}</span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {data.featuredAlbums.map(album => (
            <Link to={`/album/${album.id}`} key={album.id} className="flex flex-col gap-3 group cursor-pointer">
              <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm relative">
                <LazyImage src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <div className="w-12 h-12 rounded-full bg-black/50 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                      <FiPlay className="text-xl ml-1 fill-white" />
                   </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-nct-primary transition-colors line-clamp-1">
                  {album.title}
                </h4>
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{album.artist}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
