import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { albumService } from "../../api/services";
import { optimizeCloudinaryImage } from "../../utils/media";

const mapAlbumItem = (album) => ({
  id: album.id,
  title: album.tieu_de || album.title,
  artist: album.id_nghe_si_detail?.ten_nghe_si || "Nhiều nghệ sĩ",
  image: album.anh_bia || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
  totalPlays: album.tong_luot_nghe ?? 0,
});

function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="group cursor-pointer">
      <div className="relative aspect-square rounded-3xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 shadow-sm">
        <img
          src={optimizeCloudinaryImage(album.image, { width: 400, height: 400 })}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{album.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{album.artist}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{album.totalPlays ?? 0} lượt nghe</p>
      </div>
    </Link>
  );
}

export default function MoodPlaylists() {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchMoodAlbums = async () => {
      setLoading(true);
      try {
        const data = await albumService.getAll({ id_the_loai: 4, trang_thai: 'PUBLIC', ordering: '-tong_luot_nghe', limit: 50 });
        if (!active) return;
        const rawAlbums = data.results || data || [];
        setAlbums(rawAlbums.map(mapAlbumItem));
      } catch (error) {
        console.error("Lỗi khi tải Tâm trạng hôm nay:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMoodAlbums();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 text-gray-500 dark:text-[#b3b3b3] text-sm uppercase font-bold tracking-widest">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('home', 'Trang chủ')}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{t('today_mood', 'Tâm trạng hôm nay')}</span>
      </div>

      <div className="relative rounded-2xl overflow-hidden h-56">
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&h=400&fit=crop"
          alt="Tâm trạng hôm nay"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 via-purple-800/60 to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1311] via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-7">
          <p className="text-nct-primary text-xs font-bold uppercase tracking-[0.2em] mb-1">{t('mood_curated', 'Bộ sưu tập tâm trạng')}</p>
          <h1 className="text-4xl font-black text-white leading-tight mb-2">{t('today_mood', 'Tâm trạng hôm nay')}</h1>
          <p className="text-white/70 text-sm max-w-lg">
            {t('discover_mood_albums', 'Những album phù hợp với không khí hôm nay, lựa chọn theo tâm trạng và thể loại phổ biến.')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-100 dark:bg-white/5">
          <span className="text-gray-500">{t('loading_content', 'Đang tải nội dung...')}</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
          {t('no_albums_found', 'Không tìm thấy album nào.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
