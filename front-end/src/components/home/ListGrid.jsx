import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMusic } from "../../context/MusicContext";
import { optimizeCloudinaryImage } from "../../utils/media";

export default function LuoiDanhSachPhat({ tieuDeKhuVuc, link, items }) {
  const { t } = useTranslation();
  const { playSong } = useMusic();

  const danhSach = items && items.length > 0 ? items : [];

  if (!danhSach.length) {
    return null;
  }

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
            to={item.audioUrl ? `/song/${item.id}` : (item.type === 'album' ? `/album/${item.id}` : `/playlist/${index + 1}`)}
            key={index}
            className="group cursor-pointer"
            onClick={(e) => handleItemClick(e, item)}
          >
            {/* Khung ảnh */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <img
                src={optimizeCloudinaryImage(item.image || item.anh, { width: 320, height: 320 })}
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
