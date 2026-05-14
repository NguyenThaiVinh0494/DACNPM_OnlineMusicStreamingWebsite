import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMusic } from "../../context/MusicContext";

export default function LuoiDanhSachPhat({ tieuDeKhuVuc, link, items }) {
  const { t } = useTranslation();
  const { playSong } = useMusic();

  // Dữ liệu mẫu
  const danhSachFallback = [
    { title: "Hit Việt Quốc Dân", artist: "HIEUTHUHAI, Trọng Nhân...", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { title: "TikTok Remix Việt", artist: "Inso, Ness Remix...", image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=200&fit=crop" },
    { title: "V-Pop Thịnh Hành", artist: "GREY D, Đặng Thanh Tuyền...", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { title: "Gen Gì Gen Z", artist: "HIEUTHUHAI, Ogenus...", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop" },
    { title: "Ballad Việt", artist: "Lyly, Đỗ Hoàng Long...", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop" }
  ];
  
  const danhSach = items && items.length > 0 ? items : danhSachFallback;

  const handleItemClick = (e, item) => {
    // Nếu là bài hát (có audioUrl) thì phát nhạc
    if (item.audioUrl) {
      e.preventDefault();
      playSong(item, danhSach.filter(i => i.audioUrl));
    }
  };

  return (
    <div className="mb-8">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">{tieuDeKhuVuc}</h3>
        {link ? (
          <Link to={link} className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium hover:text-black dark:hover:text-white transition-colors">
            {t('more')}
          </Link>
        ) : (
          <button className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium hover:text-black dark:hover:text-white transition-colors">
            {t('more')}
          </button>
        )}
      </div>

      {/* Lưới thẻ (5 thẻ trên 1 hàng) */}
      <div className="grid grid-cols-5 gap-5">
        {danhSach.map((item, index) => (
          <Link 
            to={item.audioUrl ? `/song/${item.id}` : `/playlist/${index + 1}`} 
            key={index} 
            className="group cursor-pointer"
            onClick={(e) => handleItemClick(e, item)}
          >
            {/* Khung ảnh */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <img 
                src={item.image || item.anh} 
                alt={item.title || item.ten} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            {/* Thông tin */}
            <h4 className="text-black dark:text-white text-base font-bold mb-1 truncate">{item.title || item.ten}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.artist || item.moTa}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}