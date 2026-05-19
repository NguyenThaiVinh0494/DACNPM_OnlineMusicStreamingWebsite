import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Footer from "../components/layout/Footer";
import ListGrid from "../components/home/ListGrid";
import MusicChart from "../components/home/MusicChart";
import DanhSachPhatNgang from "../components/home/HorizontalPlaylist";
import { songService, genreService } from "../api/services";
import { getSongArtistNames } from "../utils/songArtists";

// Gradient colors for topic cards
const GRADIENT_COLORS = [
  "from-teal-400 to-emerald-500",
  "from-purple-500 to-indigo-600",
  "from-rose-400 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-600",
  "from-emerald-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-indigo-500 to-purple-600",
  "from-lime-400 to-green-500",
  "from-pink-400 to-rose-500",
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1516280440502-6c382101e4a6?w=200&h=200&fit=crop",
];



// Fisher-Yates shuffle
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const { t } = useTranslation();
  const [newSongs, setNewSongs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchNewSongs = async () => {
      try {
        const data = await songService.getAll({ ordering: '-ngay_tao', limit: 5 });
        if (!active) return;
        const songs = data.results || data;
        const mappedSongs = songs.slice(0, 5).map(song => ({
          ten: song.tieu_de,
          moTa: getSongArtistNames(song, "Đang cập nhật..."),
          anh: song.duong_dan_hinh_anh || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=200&h=200&fit=crop"
        }));
        setNewSongs(mappedSongs);
      } catch (error) {
        console.error("Lỗi khi tải bài hát mới:", error);
      }
    };
    fetchNewSongs();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchGenres = async () => {
      setLoadingTopics(true);
      try {
        const data = await genreService.getAll();
        if (!active) return;
        const genreList = data.results || data;
        const mapped = genreList.map((genre, index) => ({
          id: genre.id,
          name: genre.ten_the_loai,
          color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
          image: genre.anh_the_loai || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        }));
        const randomTopics = shuffleArray(mapped).slice(0, 10);
        setTopics(randomTopics);
      } catch (error) {
        console.error("Lỗi khi tải thể loại:", error);
      } finally {
        if (active) setLoadingTopics(false);
      }
    };
    fetchGenres();
    return () => {
      active = false;
    };
  }, []);

  // 1. Tạo hàm lấy lời chào dựa vào giờ hệ thống
  const layLoiChao = () => {
    const gioHienTai = new Date().getHours();

    if (gioHienTai >= 5 && gioHienTai < 12) {
      return t('good_morning', "Chào buổi sáng");
    } else if (gioHienTai >= 12 && gioHienTai < 18) {
      return t('good_afternoon', "Chào buổi chiều");
    } else {
      return t('good_evening', "Chào buổi tối");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">{layLoiChao()}</h2>

      {/* Banners */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden h-48 relative group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92d?w=800&h=300&fit=crop"
            alt="Banner 1"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <h3 className="text-2xl font-bold text-white">Daydream on Sofa</h3>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden h-48 relative group cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center p-8">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-white mb-2">{t('banner_title', 'Nghe nhạc, hát hò')}</h3>
            <p className="text-white/90 mb-4">{t('banner_subtitle', 'giải trí đỉnh cao cùng NCT TV')}</p>
            <button className="bg-white text-emerald-600 px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform">
              {t('view_details', 'Xem chi tiết')}
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black dark:text-white">{t('topics', 'Chủ đề')}</h3>
          <Link to="/discover/topics" className="text-sm text-gray-500 dark:text-nct-text-dim hover:text-black dark:hover:text-white uppercase font-medium tracking-wider transition-colors">{t('more', 'Thêm')}</Link>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {loadingTopics ? (
            Array(10).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-24 rounded-lg bg-gray-200 dark:bg-white/5 animate-pulse" />
            ))
          ) : topics.length > 0 ? (
            topics.map((topic) => (
              <Link
                to={`/genre/${topic.id}`}
                key={topic.id}
                className={`h-24 rounded-lg bg-gradient-to-br ${topic.color} relative overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all shadow-sm hover:shadow-md`}
              >
                <h4 className="absolute top-3 left-3 text-white font-bold text-lg z-10 drop-shadow-md">{topic.name}</h4>
                <img
                  src={topic.image}
                  alt={topic.name}
                  className="absolute -right-4 -bottom-2 w-16 h-16 object-cover rounded-md rotate-[25deg] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg"
                />
              </Link>
            ))
          ) : null}
        </div>
      </div>
      {/* Ráp các component mới vào đây */}
      <MusicChart />

      {/* Tái sử dụng component lưới cho tất cả các phần còn lại! */}
      <ListGrid tieuDeKhuVuc="Vũ Trụ Nhạc Việt" link="/discover/vu-tru-nhac-viet" />
      <ListGrid tieuDeKhuVuc="Tâm Trạng Hôm Nay" link="/discover/mood" />
      <ListGrid tieuDeKhuVuc="Top 100" link="/top-100" />

      {/* Thêm 2 cụm danh sách mới theo yêu cầu */}
      <DanhSachPhatNgang tieuDeKhuVuc="Single Mới Phát Hành" />
      <DanhSachPhatNgang tieuDeKhuVuc="TikTok Top Mix" />

      <ListGrid tieuDeKhuVuc="Đang được yêu thích" link="/discover/popular" />
      <ListGrid tieuDeKhuVuc="Mới phát hành" link="/discover/new-releases" items={newSongs} />
      <Footer />
    </div>
  );
}
