import { useTranslation } from "react-i18next";

export default function LuoiDanhSachPhat({ tieuDeKhuVuc }) {
  const { t } = useTranslation();
  // Dữ liệu mẫu
  const danhSach = [
    { ten: "Hit Việt Quốc Dân", moTa: "HIEUTHUHAI, Trọng Nhân...", anh: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { ten: "TikTok Remix Việt", moTa: "Inso, Ness Remix...", anh: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=200&fit=crop" },
    { ten: "V-Pop Thịnh Hành", moTa: "GREY D, Đặng Thanh Tuyền...", anh: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { ten: "Gen Gì Gen Z", moTa: "HIEUTHUHAI, Ogenus...", anh: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop" },
    { ten: "Ballad Việt", moTa: "Lyly, Đỗ Hoàng Long...", anh: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop" }
  ];

  return (
    <div className="mb-8">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <h3 className="text-2xl font-bold text-black dark:text-white">{tieuDeKhuVuc}</h3>
        <button className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium hover:text-black dark:hover:text-white transition-colors">
          {t('more')}
        </button>
      </div>

      {/* Lưới thẻ (5 thẻ trên 1 hàng) */}
      <div className="grid grid-cols-5 gap-5">
        {danhSach.map((item, index) => (
          <div key={index} className="group cursor-pointer">
            {/* Khung ảnh */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
              <img 
                src={item.anh} 
                alt={item.ten} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            {/* Thông tin */}
            <h4 className="text-black dark:text-white text-base font-bold mb-1 truncate">{item.ten}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.moTa}</p>
          </div>
        ))}
      </div>
    </div>
  );
}