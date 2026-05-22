import { FaRandom } from 'react-icons/fa'; // Icon trộn bài
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';

export default function DanhSachPhatNgang({ tieuDeKhuVuc, items }) {
  const { t } = useTranslation();
  const { playSong } = useMusic();

  const danhSachBaiHat = items && items.length > 0 ? items : Array(12).fill(0).map((_, i) => ({
    id: i + 1,
    ten: i % 2 === 0 ? "Ngừng Trôi" : "Nhẹ nhàng va vào nhau...",
    caSi: "Kha, SONY MUSIC",
    anh: `https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop`
  }));

  return (
    <div className="mb-10">
      {/* Phần Tiêu đề & Nút Nghe ngẫu nhiên */}
      <div className="flex justify-between items-center mb-5 mt-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">{tieuDeKhuVuc}</h3>
        <button className="flex items-center gap-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
          {t('shuffle', 'Nghe ngẫu nhiên')}
          <FaRandom size={12} className="text-green-600 dark:text-teal-400" />
        </button>
      </div>

      {/* Lưới 4 cột */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-3">
        {danhSachBaiHat.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => {
              if (item.audioUrl) {
                playSong(item, danhSachBaiHat.filter(i => i.audioUrl));
              }
            }}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 group transition-colors"
          >
            {/* Ảnh bìa */}
            <div className="w-14 h-14 flex-shrink-0 relative">
              <img
                src={item.anh}
                alt={item.ten}
                className="w-full h-full object-cover rounded-md"
              />
              {/* Lớp phủ mờ khi hover (Tùy chọn cho đẹp) */}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-md">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1"></div>
              </div>
            </div>

            {/* Thông tin bài hát */}
            <div className="flex-1 min-w-0">
              <h4 className="text-black dark:text-white text-sm font-bold truncate mb-0.5 group-hover:text-green-600 dark:group-hover:text-teal-400 transition-colors">
                {item.ten}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {item.caSi}
              </p>

              {/* Mô phỏng icon Hãng đĩa (Label) như trong ảnh */}
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] text-gray-800 dark:text-white">🎵</span>
                </div>
                <span className="text-gray-500 text-[11px] truncate uppercase tracking-wider font-semibold">
                  {item.label || "UNIVERSAL MUSIC"}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}