import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LazyImage from "../../components/common/LazyImage";
import { FiHeart, FiShare2, FiMoreHorizontal, FiPlay, FiDownload, FiChevronDown, FiChevronUp, FiPlus, FiFlag, FiFacebook, FiLink } from 'react-icons/fi';

// Mock Data cho bài hát "Chúng Ta Không Thuộc Về Nhau"
const mockSongDetail = {
  id: 1,
  title: "Chúng Ta Không Thuộc Về Nhau",
  artist: "Sơn Tùng M-TP",
  artistFollowers: 130057,
  artistAvatar: "https://avatar-ex-swe.nixcdn.com/singer/avatar/2019/10/29/4/b/a/b/1572338166649_600.jpg",
  cover: "https://avatar-ex-swe.nixcdn.com/song/2016/08/02/b/e/8/2/1470146059275_640.jpg",
  likes: "282816",
  shares: "3606",
  contributor: "Thái Trần",
  lyrics: `Niềm tin đã mất, giọt nước mắt cuốn kí ức anh chìm sâu\nTình về nơi đâu, cô đơn đôi chân lạc trôi giữa bầu trời\nMàn đêm che giấu, từng góc tối khuất lấp phía sau bờ môi\n\nNơi này có em, nơi này có anh, nơi này có chúng ta\nNhưng mà tại sao tình yêu kia nay đã vội vã rời xa\nThanh xuân kia như một cơn gió bay ngang qua đời nhau\n\nChúng ta không thuộc về nhau... chúng ta không thuộc về nhau\nChúng ta không thuộc về nhau... em hãy cứ đi bên người mà em ước ao.`,
  featuredSongs: [
    { id: 1, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2017/02/13/a/c/c/c/1487002011166_640.jpg", uploader: "VIVI ENM", duration: "04:20" },
    { id: 2, title: "Âm Thầm Bên Em", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2015/08/21/f/7/f/d/1440150993074_640.jpg", uploader: "VIVI ENM", duration: "04:51" },
    { id: 3, title: "Hãy Trao Cho Anh", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2019/07/01/a/2/c/9/1561994348270_640.jpg", uploader: "VIVI ENM", duration: "04:05" },
    { id: 4, title: "Chúng Ta Không Thuộc Về Nhau", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2016/08/02/b/e/8/2/1470146059275_640.jpg", uploader: "VIVI ENM", duration: "03:53", isActive: true },
    { id: 5, title: "Buông Đôi Tay Nhau Ra", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2015/12/02/b/5/e/7/1449048128330_640.jpg", uploader: "VIVI ENM", duration: "03:46" },
    { id: 6, title: "Chạy Ngay Đi", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2018/05/12/7/b/c/2/1526058097560_640.jpg", uploader: "VIVI ENM", duration: "04:08" },
    { id: 7, title: "Chúng Ta Của Hiện Tại", artist: "Sơn Tùng M-TP", cover: "https://avatar-ex-swe.nixcdn.com/song/2020/12/20/9/a/6/9/1608479532851_640.jpg", uploader: "VIVI ENM", duration: "05:01" },
  ],
  featuredAlbums: [
    { id: 1, title: "Album Remix #2", artist: "Sơn Tùng M-TP", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80" },
    { id: 2, title: "KOV Remix #1", artist: "Sơn Tùng M-TP", cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5956020?w=400&q=80" },
    { id: 3, title: "KOV Remix #1 (Instrumental)", artist: "Sơn Tùng M-TP", cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
    { id: 4, title: "You Of Yesterday", artist: "Sơn Tùng M-TP, Khắc Hưng", cover: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&q=80" },
    { id: 5, title: "SKY DECADE (EP)", artist: "Sơn Tùng M-TP", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80" },
  ]
};

export default function SongDetail() {
  const { id } = useParams();
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [isHeaderPopupOpen, setIsHeaderPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const headerPopupRef = useRef(null);
  const data = mockSongDetail; // Thực tế sẽ gọi API fetch data theo id

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
            <span className="text-[17px] font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-nct-primary dark:hover:text-nct-primary transition-colors">
              {data.artist}
            </span>
          </div>
          
          {/* Interaction Stats */}
          <div className="flex items-center gap-8 mb-8 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2 cursor-pointer group hover:text-nct-primary transition-colors">
              <FiHeart className="text-2xl group-hover:fill-nct-primary" />
              <span className="text-[15px] font-bold">{data.likes}</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-nct-primary transition-colors">
              <FiShare2 className="text-2xl" />
              <span className="text-[15px] font-bold">{data.shares}</span>
            </div>
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
                  
                  {/* Chia sẻ with Sub-menu */}
                  <div className="relative group/share-header w-full">
                    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                      <div className="flex items-center gap-3">
                        <FiShare2 className="text-lg" />
                        <span>Chia sẻ</span>
                      </div>
                      <FiChevronDown className="text-sm opacity-50 -rotate-90" />
                    </button>
                    
                    {/* Sub-menu Chia sẻ (Mở sang phải do pop-up này ở bên trái màn hình) */}
                    <div className="absolute left-full top-0 ml-1 hidden group-hover/share-header:block w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl border border-gray-100 dark:border-white/10 z-50 py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                        <FiFacebook className="text-lg" />
                        <span>Facebook</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                        <FiLink className="text-lg" />
                        <span>Sao chép đường dẫn</span>
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                    <FiFlag className="text-lg" />
                    <span>Báo cáo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Call to Actions */}
          <div className="flex items-center gap-4 mt-auto">
            <button className="flex items-center gap-2 px-10 py-[14px] bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:opacity-90 hover:scale-105 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(0,242,254,0.3)] transition-all">
              <FiPlay className="text-xl fill-white" />
              <span className="text-[15px]">Phát</span>
            </button>
            <button className="flex items-center gap-2 px-8 py-[14px] bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white font-bold rounded-full transition-all border border-gray-200 dark:border-transparent">
              <FiDownload className="text-xl" />
              <span className="text-[15px]">Tải về</span>
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
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white cursor-pointer hover:text-nct-primary transition-colors">
                {data.artist}
              </h3>
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
                      {/* Tải về with Sub-menu */}
                      <div className="relative group/download w-full">
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                          <div className="flex items-center gap-3">
                            <FiDownload className="text-lg" />
                            <span>Tải về</span>
                          </div>
                          <FiChevronDown className="text-sm opacity-50 -rotate-90" />
                        </button>
                        
                        {/* Sub-menu Tải về */}
                        <div className="absolute right-full top-0 mr-1 hidden group-hover/download:block w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden py-2">
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            Chất lượng tiêu chuẩn (~4.1MB)
                          </button>
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            Chất lượng cao (~10.2MB)
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                        <div className="flex items-center gap-3">
                          <FiPlus className="text-lg" />
                          <span>Thêm vào playlist</span>
                        </div>
                      </button>
                      
                      {/* Chia sẻ with Sub-menu */}
                      <div className="relative group/share w-full">
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                          <div className="flex items-center gap-3">
                            <FiShare2 className="text-lg" />
                            <span>Chia sẻ</span>
                          </div>
                          <FiChevronDown className="text-sm opacity-50 -rotate-90" />
                        </button>
                        
                        {/* Sub-menu Chia sẻ */}
                        <div className="absolute right-full top-0 mr-1 hidden group-hover/share:block w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden py-2">
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            <FiFacebook className="text-lg" />
                            <span>Facebook</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[13px] font-semibold transition-colors">
                            <FiLink className="text-lg" />
                            <span>Sao chép đường dẫn</span>
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-[14px] font-semibold transition-colors">
                        <FiFlag className="text-lg" />
                        <span>Báo cáo</span>
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
            <div key={album.id} className="flex flex-col gap-3 group cursor-pointer">
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
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
