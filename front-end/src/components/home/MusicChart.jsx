
export default function BangXepHang() {
  return (
    <div className="mb-8">
      {/* Tiêu đề vùng */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <h3 className="text-2xl font-bold text-white">Bảng Xếp Hạng</h3>
        <button className="text-sm text-gray-400 uppercase font-medium hover:text-white transition-colors">
          Thêm
        </button>
      </div>

      {/* Lưới 3 cột */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Cột 1: Thịnh Hành */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#4a2a2a] to-[#2d1a1a]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">Top 50 Bài Hát Thịnh Hành</h4>
            <button className="bg-white/20 text-white rounded-full px-3 py-1 text-xs hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
          
          <div className="space-y-1">
            {/* Hàng bài hát 1 */}
            <div className="flex items-center p-2 -mx-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <span className="w-6 font-bold text-center mr-3 text-green-400">1</span>
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop" alt="Song" className="w-12 h-12 rounded-md object-cover mr-3" />
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-semibold truncate mb-0.5">Người Im Lặng Gặp Ngườ...</p>
                <p className="text-gray-400 text-xs truncate">HIEUTHUHAI</p>
              </div>
            </div>

            {/* Hàng bài hát 2 */}
            <div className="flex items-center p-2 -mx-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <span className="w-6 font-bold text-center mr-3 text-white">2</span>
              <img src="https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=50&h=50&fit=crop" alt="Song" className="w-12 h-12 rounded-md object-cover mr-3" />
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-semibold truncate mb-0.5">Dạo Gần Đây Anh Thấy...</p>
                <p className="text-gray-400 text-xs truncate">HIEUTHUHAI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột 2: Nhạc Việt */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#2a3a1f] to-[#1a2412]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">Top 50 Nhạc Việt</h4>
            <button className="bg-white/20 text-white rounded-full px-3 py-1 text-xs hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
          {/* Chèn thêm các bài hát tương tự Cột 1 vào đây */}
        </div>

        {/* Cột 3: Nhạc Hoa */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#3d2244] to-[#241429]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white">Top 50 Nhạc Hoa</h4>
            <button className="bg-white/20 text-white rounded-full px-3 py-1 text-xs hover:bg-white/30 transition-colors">
              Phát ▶
            </button>
          </div>
           {/* Chèn thêm các bài hát tương tự Cột 1 vào đây */}
        </div>

      </div>
    </div>
  );
}