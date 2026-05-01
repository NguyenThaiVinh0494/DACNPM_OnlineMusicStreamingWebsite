import { Link } from "react-router-dom";

export default function MoodTopics() {
  const categories = [
    { name: "Mood", items: ["Chill", "Buồn", "Hạnh Phúc", "Tập Trung", "Tiệc Tùng", "Cô Đơn", "Hưng Phấn", "Nhẹ Nhàng"] },
    { name: "Activity", items: ["Làm Việc", "Học Tập", "Thể Thao", "Du Lịch", "Lái Xe", "Nấu Ăn", "Ngủ", "Yoga"] },
    { name: "Genre", items: ["V-Pop", "K-Pop", "US-UK", "J-Pop", "Rap", "Rock", "EDM", "Jazz", "Classical", "Acoustic"] },
    { name: "Special", items: ["Mới Phát Hành", "Trending", "NCT Chart", "Top 100", "Nostalgia", "Indie"] },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-3 text-gray-500 dark:text-[#b3b3b3] text-sm uppercase font-bold tracking-widest">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Khám phá</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Chủ đề & Thể loại</span>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Chủ đề & Thể loại</h2>

      <div className="space-y-12">
        {categories.map(cat => (
          <div key={cat.name} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-500 dark:text-[#b3b3b3] uppercase tracking-wider">{cat.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cat.items.map(item => (
                <div key={item} className="h-20 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl flex items-center justify-center cursor-pointer hover:bg-nct-primary hover:text-white transition-all font-bold text-lg border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg group">
                  <span className="group-hover:scale-110 transition-transform">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
