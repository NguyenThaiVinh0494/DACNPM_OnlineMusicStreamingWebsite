import { useTranslation } from "react-i18next";

export default function BangXepHang() {
  const { t } = useTranslation();
  return (
    <div className="mb-8">
      {/* Tiêu đề vùng */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">Bảng Xếp Hạng</h3>
        <button className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium hover:text-black dark:hover:text-white transition-colors">
          {t('more')}
        </button>
      </div>

      {/* Lưới 3 cột */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Cột 1: Thịnh Hành */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-[#4a2a2a] dark:to-[#2d1a1a] transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-black dark:text-white">Top 50 Bài Hát Thịnh Hành</h4>
            <button className="bg-black/10 dark:bg-white/20 text-gray-800 dark:text-white rounded-full px-3 py-1 text-xs hover:bg-black/20 dark:hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
          
          <div className="space-y-1">
            {/* Hàng bài hát 1 */}
            <div className="flex items-center p-2 -mx-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <span className="w-6 font-bold text-center mr-3 text-green-600 dark:text-green-400">1</span>
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop" alt="Song" className="w-12 h-12 rounded-md object-cover mr-3" />
              <div className="flex-1 overflow-hidden">
                <p className="text-black dark:text-white text-sm font-semibold truncate mb-0.5">Người Im Lặng Gặp Ngườ...</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">HIEUTHUHAI</p>
              </div>
            </div>

            {/* Hàng bài hát 2 */}
            <div className="flex items-center p-2 -mx-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <span className="w-6 font-bold text-center mr-3 text-black dark:text-white">2</span>
              <img src="https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=50&h=50&fit=crop" alt="Song" className="w-12 h-12 rounded-md object-cover mr-3" />
              <div className="flex-1 overflow-hidden">
                <p className="text-black dark:text-white text-sm font-semibold truncate mb-0.5">Dạo Gần Đây Anh Thấy...</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">HIEUTHUHAI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột 2: Nhạc Việt */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-lime-100 to-lime-50 dark:from-[#2a3a1f] dark:to-[#1a2412] transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-black dark:text-white">Top 50 Nhạc Việt</h4>
            <button className="bg-black/10 dark:bg-white/20 text-gray-800 dark:text-white rounded-full px-3 py-1 text-xs hover:bg-black/20 dark:hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
          {/* Chèn thêm các bài hát tương tự Cột 1 vào đây */}
        </div>

        {/* Cột 3: Nhạc Hoa */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-[#3d2244] dark:to-[#241429] transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-black dark:text-white">Top 50 Nhạc Hoa</h4>
            <button className="bg-black/10 dark:bg-white/20 text-gray-800 dark:text-white rounded-full px-3 py-1 text-xs hover:bg-black/20 dark:hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
           {/* Chèn thêm các bài hát tương tự Cột 1 vào đây */}
        </div>

      </div>
    </div>
  );
}