import { useState } from "react";

import { useTranslation } from 'react-i18next';

const TopicCard = ({ item }) => (
  <div className={`h-28 rounded-lg bg-gradient-to-br ${item.color} relative overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all`}>
    <h4 className="absolute top-3 left-4 text-white font-bold text-lg z-10">{item.name}</h4>
    <img
      src={item.image}
      alt={item.name}
      className="absolute -right-4 -bottom-2 w-20 h-20 object-cover rounded-md rotate-[25deg] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg"
    />
  </div>
);

export default function MoodTopics() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: t('tab_all', 'Tất cả') },
    { id: 'genre', label: t('tab_genre', 'Thể loại') },
    { id: 'context', label: t('tab_context', 'Khung cảnh') },
    { id: 'mood', label: t('tab_mood', 'Tâm trạng') }
  ];

  const forYou = [
    { name: "Nhạc Trẻ", color: "from-teal-400 to-emerald-400", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { name: "TikTok", color: "from-black to-gray-900", image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=200&fit=crop" },
    { name: "Rap Việt", color: "from-indigo-500 to-purple-600", image: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=200&h=200&fit=crop" },
    { name: "Pop", color: "from-fuchsia-400 to-pink-500", image: "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop" },
    { name: "Indie Việt", color: "from-red-500 to-orange-500", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { name: "Remix", color: "from-blue-600 to-indigo-700", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
  ];

  const genres = [
    { name: "Pop Ballad", color: "from-orange-300 to-rose-400", image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop" },
    { name: "Nhạc Hoa", color: "from-amber-600 to-orange-800", image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=200&h=200&fit=crop" },
    { name: "Nhạc Hàn", color: "from-slate-600 to-slate-800", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop" },
    { name: "Âu Mỹ Khác", color: "from-emerald-400 to-teal-500", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { name: "Indie Việt", color: "from-red-500 to-rose-600", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { name: "EDM", color: "from-cyan-400 to-blue-500", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
    { name: "Rock", color: "from-purple-600 to-fuchsia-600", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop" },
    { name: "Country", color: "from-blue-800 to-indigo-900", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop" },
    { name: "Nhạc Phim", color: "from-sky-500 to-blue-600", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop" },
    { name: "Nhạc Disco", color: "from-green-400 to-emerald-500", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
    { name: "Jazz", color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&h=200&fit=crop" },
    { name: "Lofi", color: "from-fuchsia-600 to-purple-800", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { name: "Anime", color: "from-red-600 to-rose-700", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop" },
    { name: "Giao Hưởng", color: "from-pink-500 to-rose-600", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&h=200&fit=crop" },
    { name: "Không Lời", color: "from-green-300 to-emerald-400", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { name: "Acoustic", color: "from-teal-700 to-emerald-800", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { name: "Nhạc Nhật", color: "from-indigo-500 to-purple-600", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop" },
    { name: "Nhạc Thái", color: "from-orange-500 to-amber-600", image: "https://images.unsplash.com/photo-1543840950-5917415d18d0?w=200&h=200&fit=crop" },
    { name: "Bolero", color: "from-violet-800 to-purple-900", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" }
  ];

  const contexts = [
    { name: "Cafe", color: "from-amber-500 to-yellow-600", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200&h=200&fit=crop" },
    { name: "Câu Lạc Bộ Đêm", color: "from-rose-600 to-pink-700", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop" },
    { name: "Giảm Căng Thẳng", color: "from-slate-600 to-gray-700", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=200&fit=crop" },
    { name: "Buổi Tối", color: "from-stone-600 to-stone-800", image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=200&h=200&fit=crop" },
    { name: "Họp Mặt", color: "from-emerald-500 to-green-600", image: "https://images.unsplash.com/photo-1529156069898-49953eb1f5ce?w=200&h=200&fit=crop" },
    { name: "Tập Luyện", color: "from-blue-500 to-indigo-600", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop" },
    { name: "Lễ Tình Nhân", color: "from-red-400 to-rose-500", image: "https://images.unsplash.com/photo-1518192161663-5a423329cc6b?w=200&h=200&fit=crop" },
    { name: "Tết", color: "from-orange-400 to-red-500", image: "https://images.unsplash.com/photo-1547483238-2cbf88bc3bdf?w=200&h=200&fit=crop" },
    { name: "Party", color: "from-orange-500 to-rose-500", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop" },
    { name: "Du Lịch", color: "from-yellow-400 to-orange-500", image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200&h=200&fit=crop" },
    { name: "Buổi Trưa", color: "from-amber-200 to-yellow-400", image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=200&h=200&fit=crop" },
    { name: "Buổi Sáng", color: "from-sky-300 to-blue-400", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=200&fit=crop" }
  ];

  const moods = [
    { name: "Tình Yêu", color: "from-rose-300 to-pink-400", image: "https://images.unsplash.com/photo-1518192161663-5a423329cc6b?w=200&h=200&fit=crop" },
    { name: "Thư Giãn", color: "from-cyan-400 to-blue-500", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=200&fit=crop" },
    { name: "Buồn", color: "from-amber-700 to-orange-900", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
    { name: "Nhớ Nhung", color: "from-emerald-800 to-green-900", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=200&h=200&fit=crop" },
    { name: "Ngọt Ngào", color: "from-pink-400 to-rose-400", image: "https://images.unsplash.com/photo-1518192161663-5a423329cc6b?w=200&h=200&fit=crop" },
    { name: "Cô Đơn", color: "from-fuchsia-600 to-purple-800", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop" },
  ];

  return (
    <div className="space-y-10 pb-20 mt-2">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-6">{t('topics_page_title', 'Topics')}</h2>
      
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 dark:border-white/10 pb-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-bold uppercase tracking-wide transition-colors relative pb-4 -mb-[17px] ${
              activeTab === tab.id 
                ? 'text-teal-500 dark:text-teal-400' 
                : 'text-gray-500 dark:text-[#a7a7a7] hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 dark:bg-teal-400 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'all' && (
        <div className="space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-5">Dành Cho Bạn</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {forYou.map(item => <TopicCard key={item.name} item={item} />)}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-5">
              <h3 className="text-2xl font-bold text-black dark:text-white">Thể Loại</h3>
              <button onClick={() => setActiveTab('genre')} className="text-sm font-bold text-gray-500 dark:text-[#a7a7a7] hover:text-black dark:hover:text-white transition-colors">{t('more', 'Thêm')}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {genres.slice(0, 5).map(item => <TopicCard key={item.name} item={item} />)}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-5">
              <h3 className="text-2xl font-bold text-black dark:text-white">Khung Cảnh</h3>
              <button onClick={() => setActiveTab('context')} className="text-sm font-bold text-gray-500 dark:text-[#a7a7a7] hover:text-black dark:hover:text-white transition-colors">{t('more', 'Thêm')}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {contexts.slice(0, 5).map(item => <TopicCard key={item.name} item={item} />)}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-5">
              <h3 className="text-2xl font-bold text-black dark:text-white">Tâm Trạng</h3>
              <button onClick={() => setActiveTab('mood')} className="text-sm font-bold text-gray-500 dark:text-[#a7a7a7] hover:text-black dark:hover:text-white transition-colors">{t('more', 'Thêm')}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {moods.slice(0, 5).map(item => <TopicCard key={item.name} item={item} />)}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'genre' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {genres.map(item => <TopicCard key={item.name} item={item} />)}
        </div>
      )}

      {activeTab === 'context' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {contexts.map(item => <TopicCard key={item.name} item={item} />)}
        </div>
      )}

      {activeTab === 'mood' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {moods.map(item => <TopicCard key={item.name} item={item} />)}
        </div>
      )}
    </div>
  );
}
