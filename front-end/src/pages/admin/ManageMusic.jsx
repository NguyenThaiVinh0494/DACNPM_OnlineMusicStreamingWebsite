import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCheck,
  FiDisc,
  FiEdit2,
  FiFilter,
  FiFolderPlus,
  FiImage,
  FiMic,
  FiMusic,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiUploadCloud,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import { albumService, artistService, genreService, songService, uploadService } from '../../api/services';
import { getSongArtistNames, getSongArtists } from '../../utils/songArtists';

const TAB_CONFIG = [
  { key: 'songs', label: 'Bài hát', icon: FiMusic, accent: 'from-cyan-500 to-blue-500' },
  { key: 'albums', label: 'Album', icon: FiDisc, accent: 'from-emerald-500 to-teal-500' },
  { key: 'artists', label: 'Nghệ sĩ', icon: FiUsers, accent: 'from-amber-500 to-orange-500' },
  { key: 'genres', label: 'Thể loại', icon: FiTag, accent: 'from-fuchsia-500 to-pink-500' },
];

const STATUS_OPTIONS = [
  { value: 'PUBLIC', label: 'Công khai' },
  { value: 'PENDING', label: 'Chờ duyệt' },
];

const TAB_DEFAULT_SORT = {
  songs: 'newest',
  albums: 'release_desc',
  artists: 'name_asc',
  genres: 'name_asc',
};

const SORT_OPTIONS = {
  songs: [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'title_asc', label: 'Tên A-Z' },
    { value: 'title_desc', label: 'Tên Z-A' },
    { value: 'listens_desc', label: 'Lượt nghe cao nhất' },
    { value: 'year_desc', label: 'Năm phát hành mới nhất' },
  ],
  albums: [
    { value: 'release_desc', label: 'Ngày phát hành mới nhất' },
    { value: 'title_asc', label: 'Tên A-Z' },
    { value: 'title_desc', label: 'Tên Z-A' },
  ],
  artists: [
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
    { value: 'song_count_desc', label: 'Nhiều bài hát nhất' },
  ],
  genres: [
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
    { value: 'song_count_desc', label: 'Nhiều bài hát nhất' },
  ],
};

const IMAGE_FIELDS = new Set(['image_file', 'cover_file', 'artist_image_file', 'topic_image_file']);
const AUDIO_FIELDS = new Set(['audio_file']);
const UPLOAD_TYPE_BY_FIELD = {
  image_file: 'song_image',
  audio_file: 'song_audio',
  cover_file: 'album_cover',
  artist_image_file: 'artist_image',
  topic_image_file: 'topic_image',
};
const IMAGE_LIMIT_BYTES = 8 * 1024 * 1024;
const AUDIO_LIMIT_BYTES = 25 * 1024 * 1024;
const CATALOG_CACHE_TTL_MS = 60_000;
const catalogCache = {
  songs: [],
  albums: [],
  artists: [],
  genres: [],
  fetchedAt: {
    songs: 0,
    albums: 0,
    artists: 0,
    genres: 0,
  },
};

const ENTITY_FETCHERS = {
  songs: () => songService.getAll(),
  albums: () => albumService.getAll(),
  artists: () => artistService.getAll(),
  genres: () => genreService.getAll(),
};

const ENTITY_DEPENDENCIES = {
  songs: ['albums', 'artists', 'genres'],
  albums: ['songs', 'artists'],
  artists: ['songs', 'albums'],
  genres: ['songs'],
};

const MUTATION_STALE_KEYS = {
  songs: [],
  albums: ['songs'],
  artists: ['songs', 'albums'],
  genres: ['songs'],
};

function isCatalogKeyFresh(key) {
  return Date.now() - (catalogCache.fetchedAt[key] || 0) < CATALOG_CACHE_TTL_MS;
}

function hasCatalogKeyData(key) {
  return Boolean(catalogCache.fetchedAt[key]);
}

function getCachedCatalogSnapshot() {
  return {
    songs: catalogCache.songs,
    albums: catalogCache.albums,
    artists: catalogCache.artists,
    genres: catalogCache.genres,
  };
}

function markCatalogCacheStale(keys) {
  keys.forEach((key) => {
    catalogCache.fetchedAt[key] = 0;
  });
}

function upsertCachedItem(key, item) {
  const existingIndex = catalogCache[key].findIndex((existing) => existing.id === item.id);
  if (existingIndex === -1) {
    catalogCache[key] = [item, ...catalogCache[key]];
  } else {
    catalogCache[key] = catalogCache[key].map((existing) => (existing.id === item.id ? item : existing));
  }
  catalogCache.fetchedAt[key] = Date.now();
}

function removeCachedItem(key, id) {
  catalogCache[key] = catalogCache[key].filter((item) => item.id !== id);
  catalogCache.fetchedAt[key] = Date.now();
}

function syncCachedAlbumSongs(album, songIds = []) {
  if (!hasCatalogKeyData('songs') && !catalogCache.songs.length) return;

  const selectedIds = new Set(songIds.map((songId) => String(songId)));
  catalogCache.songs = catalogCache.songs.map((song) => {
    const belongsToAlbum = song.id_album?.id === album.id;
    const shouldBelongToAlbum = selectedIds.has(String(song.id));

    if (shouldBelongToAlbum) return { ...song, id_album: album };
    if (belongsToAlbum) return { ...song, id_album: null };
    return song;
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Không rõ thời lượng';
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getTextValue(value) {
  return (value || '').toString().trim().toLowerCase();
}

function getSongCountForArtist(catalog, artistId) {
  return catalog.songs.filter((song) => getSongArtists(song).some((artist) => artist.id === artistId)).length;
}

function getAlbumCountForArtist(catalog, artistId) {
  return catalog.albums.filter((album) => album.id_nghe_si === artistId).length;
}

function getSongsForAlbum(catalog, albumId) {
  return catalog.songs.filter((song) => song.id_album?.id === albumId);
}

function getSongCountForGenre(catalog, genreId) {
  return catalog.songs.filter((song) => song.the_loais?.some(g => g.id === genreId)).length;
}

function getEntityTitle(item) {
  return item?.tieu_de || item?.ten_nghe_si || item?.ten_the_loai || 'bản ghi';
}

function validateSelectedFile(field, file) {
  if (!file) return null;

  if (IMAGE_FIELDS.has(field)) {
    if (!file.type?.startsWith('image/')) {
      return 'File ảnh không hợp lệ. Hãy chọn JPG, PNG, WEBP hoặc định dạng ảnh tương đương.';
    }
    if (file.size > IMAGE_LIMIT_BYTES) {
      return 'Ảnh vượt quá 8MB. Hãy nén ảnh trước khi tải lên.';
    }
  }

  if (AUDIO_FIELDS.has(field)) {
    const isAudioType = file.type?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
    if (!isAudioType) {
      return 'File audio không hợp lệ. Hãy chọn MP3, WAV, OGG, M4A, AAC hoặc FLAC.';
    }
    if (file.size > AUDIO_LIMIT_BYTES) {
      return 'Audio vượt quá 25MB. Hãy giảm dung lượng trước khi tải lên.';
    }
  }

  return null;
}

function readImageMetadata(objectUrl, fileSize) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(`${image.naturalWidth}x${image.naturalHeight} • ${formatBytes(fileSize)}`);
    image.onerror = () => resolve(formatBytes(fileSize));
    image.src = objectUrl;
  });
}

function readAudioMetadata(objectUrl, fileSize) {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const cleanup = () => {
      audio.removeAttribute('src');
      audio.load();
    };

    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      resolve({
        text: `${formatDuration(audio.duration)} • ${formatBytes(fileSize)}`,
        duration: Number.isFinite(audio.duration) ? Math.round(audio.duration) : null,
      });
      cleanup();
    };
    audio.onerror = () => {
      resolve({ text: formatBytes(fileSize), duration: null });
      cleanup();
    };
    audio.src = objectUrl;
  });
}

function validateForm(entity, values, previews) {
  const currentYear = new Date().getFullYear() + 1;

  if (entity === 'songs') {
    if (!values.tieu_de.trim()) return 'Tên bài hát là bắt buộc.';
    if (!values.id_nghe_si_ids.length) return 'Bạn cần chọn ít nhất một nghệ sĩ cho bài hát.';
    if (!previews.imageUrl) return 'Bài hát cần có ảnh đại diện.';
    if (!previews.audioUrl) return 'Bài hát cần có file audio.';
    if (values.nam_phat_hanh) {
      const year = Number(values.nam_phat_hanh);
      if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        return `Năm phát hành phải nằm trong khoảng 1900 - ${currentYear}.`;
      }
    }
  }

  if (entity === 'albums') {
    if (!values.tieu_de.trim()) return 'Tên album là bắt buộc.';
    if (!values.id_nghe_si) return 'Bạn cần chọn nghệ sĩ cho album.';
    if (!previews.imageUrl) return 'Album cần có ảnh bìa.';
  }

  if (entity === 'artists') {
    if (!values.ten_nghe_si.trim()) return 'Tên nghệ sĩ là bắt buộc.';
    if (!previews.imageUrl) return 'Nghệ sĩ cần có ảnh đại diện.';
  }

  if (entity === 'genres') {
    if (!values.ten_the_loai.trim()) return 'Tên thể loại là bắt buộc.';
    if (!previews.imageUrl) return 'Thể loại cần có ảnh đại diện.';
  }

  return null;
}

function sortItems(items, activeTab, sortOption, catalog) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (activeTab === 'songs') {
      if (sortOption === 'title_asc') return getTextValue(a.tieu_de).localeCompare(getTextValue(b.tieu_de), 'vi');
      if (sortOption === 'title_desc') return getTextValue(b.tieu_de).localeCompare(getTextValue(a.tieu_de), 'vi');
      if (sortOption === 'listens_desc') return (b.luot_nghe ?? 0) - (a.luot_nghe ?? 0);
      if (sortOption === 'year_desc') return (b.nam_phat_hanh ?? 0) - (a.nam_phat_hanh ?? 0);
      return (b.id ?? 0) - (a.id ?? 0);
    }

    if (activeTab === 'albums') {
      if (sortOption === 'title_asc') return getTextValue(a.tieu_de).localeCompare(getTextValue(b.tieu_de), 'vi');
      if (sortOption === 'title_desc') return getTextValue(b.tieu_de).localeCompare(getTextValue(a.tieu_de), 'vi');
      return (b.ngay_phat_hanh || '').localeCompare(a.ngay_phat_hanh || '') || (b.id ?? 0) - (a.id ?? 0);
    }

    if (activeTab === 'artists') {
      if (sortOption === 'song_count_desc') {
        return getSongCountForArtist(catalog, b.id) - getSongCountForArtist(catalog, a.id);
      }
      if (sortOption === 'name_desc') return getTextValue(b.ten_nghe_si).localeCompare(getTextValue(a.ten_nghe_si), 'vi');
      return getTextValue(a.ten_nghe_si).localeCompare(getTextValue(b.ten_nghe_si), 'vi');
    }

    if (sortOption === 'song_count_desc') {
      return getSongCountForGenre(catalog, b.id) - getSongCountForGenre(catalog, a.id);
    }
    if (sortOption === 'name_desc') return getTextValue(b.ten_the_loai).localeCompare(getTextValue(a.ten_the_loai), 'vi');
    return getTextValue(a.ten_the_loai).localeCompare(getTextValue(b.ten_the_loai), 'vi');
  });

  return sorted;
}

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results ?? [];
}

function getFileNameFromUrl(url) {
  if (!url) return '';

  try {
    const path = url.split('?')[0].split('/');
    return decodeURIComponent(path[path.length - 1] || '');
  } catch {
    return url;
  }
}

function extractErrorMessage(error) {
  const payload = error?.response?.data;
  if (!payload) return 'Có lỗi xảy ra. Vui lòng thử lại.';
  if (typeof payload === 'string') return payload;
  if (payload.detail) return payload.detail;
  if (payload.error) return payload.error;

  const firstEntry = Object.values(payload)[0];
  if (Array.isArray(firstEntry)) return firstEntry[0];
  if (typeof firstEntry === 'string') return firstEntry;
  return 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại biểu mẫu.';
}

function getEmptyForm(entity) {
  if (entity === 'songs') {
    return {
      tieu_de: '',
      quoc_gia: '',
      nam_phat_hanh: '',
      loi_bai_hat: '',
      trang_thai: 'PUBLIC',
      id_nghe_si_ids: [],
      id_album_id: '',
      the_loai_ids: [],
      thoi_luong: '',
      image_file: null,
      audio_file: null,
    };
  }

  if (entity === 'albums') {
    return {
      tieu_de: '',
      id_nghe_si: '',
      ngay_phat_hanh: '',
      trang_thai: 'PUBLIC',
      song_ids: [],
      cover_file: null,
    };
  }

  if (entity === 'artists') {
    return {
      ten_nghe_si: '',
      tieu_su: '',
      artist_image_file: null,
    };
  }

  return {
    ten_the_loai: '',
    mo_ta_the_loai: '',
    topic_image_file: null,
  };
}

function getInitialForm(entity, item, catalog) {
  const empty = getEmptyForm(entity);
  if (!item) return empty;

  if (entity === 'songs') {
    return {
      ...empty,
      tieu_de: item.tieu_de || '',
      quoc_gia: item.quoc_gia || '',
      nam_phat_hanh: item.nam_phat_hanh?.toString() || '',
      loi_bai_hat: item.loi_bai_hat || '',
      thoi_luong: item.thoi_luong?.toString() || '',
      trang_thai: item.trang_thai || 'PUBLIC',
      id_nghe_si_ids: getSongArtists(item).map((artist) => artist.id.toString()),
      id_album_id: item.id_album?.id?.toString() || '',
      the_loai_ids: (item.the_loais || []).map(g => g.id.toString()),
    };
  }

  if (entity === 'albums') {
    const selectedSongs = catalog ? getSongsForAlbum(catalog, item.id) : [];

    return {
      ...empty,
      tieu_de: item.tieu_de || '',
      id_nghe_si: item.id_nghe_si?.toString() || '',
      ngay_phat_hanh: item.ngay_phat_hanh || '',
      trang_thai: item.trang_thai || 'PUBLIC',
      song_ids: selectedSongs.map((song) => song.id.toString()),
    };
  }

  if (entity === 'artists') {
    return {
      ...empty,
      ten_nghe_si: item.ten_nghe_si || '',
      tieu_su: item.tieu_su || '',
    };
  }

  return {
    ...empty,
    ten_the_loai: item.ten_the_loai || '',
    mo_ta_the_loai: item.mo_ta_the_loai || '',
  };
}

function getInitialPreview(entity, item) {
  if (!item) {
    return {
      imageUrl: '',
      imageLabel: '',
      imageMeta: '',
      audioUrl: '',
      audioLabel: '',
      audioMeta: '',
    };
  }

  if (entity === 'songs') {
    return {
      imageUrl: item.duong_dan_hinh_anh || '',
      imageLabel: getFileNameFromUrl(item.duong_dan_hinh_anh),
      imageMeta: item.duong_dan_hinh_anh ? 'Ảnh hiện tại trên Cloudinary' : '',
      audioUrl: item.duong_dan_am_thanh || '',
      audioLabel: getFileNameFromUrl(item.duong_dan_am_thanh),
      audioMeta: item.duong_dan_am_thanh ? 'Audio hiện tại trên Cloudinary' : '',
    };
  }

  if (entity === 'albums') {
    return {
      imageUrl: item.anh_bia || '',
      imageLabel: getFileNameFromUrl(item.anh_bia),
      imageMeta: item.anh_bia ? 'Ảnh hiện tại trên Cloudinary' : '',
      audioUrl: '',
      audioLabel: '',
      audioMeta: '',
    };
  }

  if (entity === 'artists') {
    return {
      imageUrl: item.anh_nghe_si || '',
      imageLabel: getFileNameFromUrl(item.anh_nghe_si),
      imageMeta: item.anh_nghe_si ? 'Ảnh hiện tại trên Cloudinary' : '',
      audioUrl: '',
      audioLabel: '',
      audioMeta: '',
    };
  }

  return {
    imageUrl: item.anh_the_loai || '',
    imageLabel: getFileNameFromUrl(item.anh_the_loai),
    imageMeta: item.anh_the_loai ? 'Ảnh hiện tại trên Cloudinary' : '',
    audioUrl: '',
    audioLabel: '',
    audioMeta: '',
  };
}

function buildFormData(entity, values) {
  const formData = new FormData();

  if (entity === 'songs') {
    formData.append('tieu_de', values.tieu_de);
    formData.append('trang_thai', values.trang_thai);
    formData.append('id_album_id', values.id_album_id || '');
    values.the_loai_ids.forEach((genreId) => formData.append('the_loai_ids', genreId));
    values.id_nghe_si_ids.forEach((artistId) => formData.append('id_nghe_si_ids', artistId));

    if (values.quoc_gia) formData.append('quoc_gia', values.quoc_gia);
    if (values.nam_phat_hanh !== '') formData.append('nam_phat_hanh', values.nam_phat_hanh);
    if (values.loi_bai_hat) formData.append('loi_bai_hat', values.loi_bai_hat);
    if (values.thoi_luong !== '') formData.append('thoi_luong', values.thoi_luong);
    if (values.duong_dan_hinh_anh) formData.append('duong_dan_hinh_anh', values.duong_dan_hinh_anh);
    if (values.duong_dan_am_thanh) formData.append('duong_dan_am_thanh', values.duong_dan_am_thanh);
    if (values.image_file) formData.append('image_file', values.image_file);
    if (values.audio_file) formData.append('audio_file', values.audio_file);
    return formData;
  }

  if (entity === 'albums') {
    formData.append('tieu_de', values.tieu_de);
    formData.append('id_nghe_si', values.id_nghe_si);
    formData.append('trang_thai', values.trang_thai);
    values.song_ids.forEach((songId) => formData.append('song_ids', songId));
    if (values.ngay_phat_hanh) formData.append('ngay_phat_hanh', values.ngay_phat_hanh);
    if (values.anh_bia) formData.append('anh_bia', values.anh_bia);
    if (values.cover_file) formData.append('cover_file', values.cover_file);
    return formData;
  }

  if (entity === 'artists') {
    formData.append('ten_nghe_si', values.ten_nghe_si);
    if (values.tieu_su) formData.append('tieu_su', values.tieu_su);
    if (values.anh_nghe_si) formData.append('anh_nghe_si', values.anh_nghe_si);
    if (values.artist_image_file) formData.append('artist_image_file', values.artist_image_file);
    return formData;
  }

  formData.append('ten_the_loai', values.ten_the_loai);
  if (values.mo_ta_the_loai) formData.append('mo_ta_the_loai', values.mo_ta_the_loai);
  if (values.anh_the_loai) formData.append('anh_the_loai', values.anh_the_loai);
  if (values.topic_image_file) formData.append('topic_image_file', values.topic_image_file);
  return formData;
}

async function uploadPendingFiles(entity, values) {
  const nextValues = { ...values };
  const fieldMap = {
    songs: [
      ['image_file', 'duong_dan_hinh_anh'],
      ['audio_file', 'duong_dan_am_thanh'],
    ],
    albums: [['cover_file', 'anh_bia']],
    artists: [['artist_image_file', 'anh_nghe_si']],
    genres: [['topic_image_file', 'anh_the_loai']],
  };

  const completedUploads = await Promise.all(
    (fieldMap[entity] || [])
      .filter(([fileField]) => values[fileField])
      .map(async ([fileField, urlField]) => {
        const signatureData = await uploadService.getSignature(UPLOAD_TYPE_BY_FIELD[fileField]);
        const uploaded = await uploadService.uploadToCloudinary(values[fileField], signatureData);
        return { fileField, urlField, uploaded };
      }),
  );

  completedUploads.forEach(({ fileField, urlField, uploaded }) => {
    nextValues[urlField] = uploaded.secure_url;
    nextValues[fileField] = null;

    if (fileField === 'audio_file' && uploaded.duration) {
      nextValues.thoi_luong = Math.round(uploaded.duration).toString();
    }
  });

  return nextValues;
}

function buildTabStats(catalog) {
  return {
    songs: catalog.songs.length,
    albums: catalog.albums.length,
    artists: catalog.artists.length,
    genres: catalog.genres.length,
  };
}

function statusBadge(status) {
  return status === 'PUBLIC'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
}

function InputField({ label, required, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function StatusPicker({ label, value, onChange }) {
  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="grid grid-cols-2 gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm">
        {STATUS_OPTIONS.map((option) => {
          const active = value === option.value;
          const Icon = option.value === 'PUBLIC' ? FiCheck : FiAlertCircle;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold outline-none transition ${
                active
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
              } focus:ring-4 focus:ring-cyan-50`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SingleSelectPicker({
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon: Icon = FiTag,
  allowClear = true,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const selectedOption = options.find((option) => option.value.toString() === value?.toString());
  const filteredOptions = options.filter((option) => {
    if (!deferredSearchTerm) return true;
    return [option.label, option.subtitle].some((text) => text?.toLowerCase().includes(deferredSearchTerm));
  });

  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="rounded-2xl bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-bold ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
                  {selectedOption?.label || placeholder}
                </p>
                {selectedOption?.subtitle ? (
                  <p className="mt-0.5 truncate text-xs text-slate-400">{selectedOption.subtitle}</p>
                ) : null}
              </div>
            </div>
            {allowClear && selectedOption ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              >
                Bỏ chọn
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={options.length ? searchPlaceholder : emptyText}
            disabled={!options.length}
            className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          {filteredOptions.length ? (
            filteredOptions.slice(0, 20).map((option) => {
              const active = option.value.toString() === value?.toString();

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearchTerm('');
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-cyan-200 bg-cyan-50'
                      : 'border-slate-200 bg-slate-50/80 hover:border-cyan-300 hover:bg-cyan-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      active ? 'bg-cyan-500 text-white' : 'bg-white text-cyan-600'
                    }`}>
                      {active ? <FiCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">{option.label}</p>
                      {option.subtitle ? <p className="truncate text-xs text-slate-400">{option.subtitle}</p> : null}
                    </div>
                  </div>
                  {active ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cyan-700 shadow-sm">
                      Đã chọn
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-600">Không có lựa chọn phù hợp</p>
              <p className="mt-1 text-xs text-slate-400">{emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArtistTagPicker({ label, required, artists, values, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const selectedArtistIds = new Set(values);
  const selectedArtists = artists.filter((artist) => selectedArtistIds.has(artist.id.toString()));
  const suggestedArtists = artists.filter((artist) => {
    const artistId = artist.id.toString();
    if (selectedArtistIds.has(artistId)) return false;
    if (!deferredSearchTerm) return true;
    return artist.ten_nghe_si.toLowerCase().includes(deferredSearchTerm);
  });

  const addArtist = (artistId) => {
    if (selectedArtistIds.has(artistId)) return;
    onChange([...values, artistId]);
    setSearchTerm('');
  };

  const removeArtist = (artistId) => {
    onChange(values.filter((value) => value !== artistId));
  };

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={artists.length ? 'Tìm tên nghệ sĩ để thêm vào bài hát' : 'Chưa có nghệ sĩ nào trong hệ thống'}
            disabled={!artists.length}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiUsers className="h-4 w-4 text-cyan-500" />
              <span>Nghệ sĩ đã chọn</span>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {selectedArtists.length} người
            </span>
          </div>

          <div className="mt-3 flex min-h-[44px] flex-wrap gap-2">
            {selectedArtists.length ? (
              selectedArtists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => removeArtist(artist.id.toString())}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <span>{artist.ten_nghe_si}</span>
                  <FiX className="h-3.5 w-3.5" />
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">Chưa chọn ca sĩ nào. Tìm kiếm và bấm vào nghệ sĩ bên dưới để thêm.</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Gợi ý nghệ sĩ</p>
              <p className="text-xs text-slate-400">Nhấn vào tên để thêm nhanh, không cần giữ Ctrl/Shift như trước.</p>
            </div>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                Xóa tìm kiếm
              </button>
            ) : null}
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {suggestedArtists.length ? (
              suggestedArtists.slice(0, 12).map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => addArtist(artist.id.toString())}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-2 text-cyan-600 shadow-sm">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{artist.ten_nghe_si}</p>
                      <p className="text-xs text-slate-400">Bấm để thêm vào danh sách thể hiện</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
                    Thêm
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-600">Không tìm thấy nghệ sĩ phù hợp</p>
                <p className="mt-1 text-xs text-slate-400">Thử từ khóa khác hoặc tạo nghệ sĩ mới ở trang quản trị nghệ sĩ.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}

function SongTagPicker({ label, songs, values, onChange, artistId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const selectedSongIds = new Set(values);
  const filteredSongs = songs.filter((song) => {
    if (artistId && song.id_nghe_si?.id?.toString() !== artistId && !getSongArtists(song).some((artist) => artist.id.toString() === artistId)) {
      return false;
    }
    if (selectedSongIds.has(song.id.toString())) return false;
    if (!deferredSearchTerm) return true;
    return [song.tieu_de, getSongArtistNames(song, '')].some((value) => value?.toLowerCase().includes(deferredSearchTerm));
  });
  const selectedSongs = songs.filter((song) => selectedSongIds.has(song.id.toString()));

  const addSong = (songId) => {
    if (selectedSongIds.has(songId)) return;
    onChange([...values, songId]);
    setSearchTerm('');
  };

  const removeSong = (songId) => {
    onChange(values.filter((value) => value !== songId));
  };

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={songs.length ? 'Tìm bài hát để thêm vào album' : 'Chưa có bài hát nào trong hệ thống'}
            disabled={!songs.length}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiMusic className="h-4 w-4 text-cyan-500" />
              <span>Bài hát đã chọn</span>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {selectedSongs.length} bài
            </span>
          </div>

          <div className="mt-3 flex min-h-[44px] flex-wrap gap-2">
            {selectedSongs.length ? (
              selectedSongs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => removeSong(song.id.toString())}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <span>{song.tieu_de}</span>
                  <FiX className="h-3.5 w-3.5" />
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">Chưa chọn bài hát nào cho album.</p>
            )}
          </div>
        </div>

        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          {filteredSongs.length ? (
            filteredSongs.slice(0, 20).map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => addSong(song.id.toString())}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">{song.tieu_de}</p>
                  <p className="truncate text-xs text-slate-400">{getSongArtistNames(song, 'Không rõ nghệ sĩ')}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
                  Thêm
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-600">Không có bài hát phù hợp</p>
              <p className="mt-1 text-xs text-slate-400">Hãy thêm bài hát trước hoặc đổi nghệ sĩ/từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

function MultiSelectDropdown({ label, options, values, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const selectedValues = new Set(values);
  const selectedOptions = options.filter((option) => selectedValues.has(option.value));
  const suggestedOptions = options.filter((option) => {
    if (selectedValues.has(option.value)) return false;
    if (!deferredSearchTerm) return true;
    return option.label.toLowerCase().includes(deferredSearchTerm);
  });

  const toggleOption = (value) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
      setSearchTerm('');
    }
  };

  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="rounded-2xl bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiTag className="h-4 w-4 text-cyan-500" />
              <span>Thể loại đã chọn</span>
            </div>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
              {selectedOptions.length}
            </span>
          </div>

          <div className="mt-3 flex min-h-[44px] flex-wrap gap-2">
            {selectedOptions.length ? (
              selectedOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <span>{option.label}</span>
                  <FiX className="h-3.5 w-3.5" />
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">Chưa gán thể loại cho bài hát.</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={options.length ? 'Tìm thể loại để thêm vào bài hát' : 'Chưa có thể loại nào trong hệ thống'}
            disabled={!options.length}
            className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          {suggestedOptions.length ? (
            suggestedOptions.slice(0, 20).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-2xl bg-white p-2 text-cyan-600 shadow-sm">
                    <FiTag className="h-4 w-4" />
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-700">{option.label}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-600 shadow-sm">
                  Thêm
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-600">Không có thể loại phù hợp</p>
              <p className="mt-1 text-xs text-slate-400">Thử từ khóa khác hoặc tạo thể loại mới ở trang quản trị thể loại.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TextareaField({ label, required, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <textarea
        {...props}
        className="min-h-[120px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function UploadField({
  label,
  hint,
  accept,
  icon: Icon,
  previewUrl,
  previewLabel,
  previewMeta,
  audioUrl,
  audioLabel,
  audioMeta,
  onChange,
  required,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </span>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-center transition hover:border-cyan-400 hover:bg-cyan-50/60">
        <div className="rounded-2xl bg-white p-3 text-cyan-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Chọn file từ máy</p>
        </div>
        <input type="file" accept={accept} className="hidden" onChange={onChange} />
      </label>

      {previewUrl ? (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <img src={previewUrl} alt={label} className="h-48 w-full object-cover" />
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-700">{previewLabel || 'Ảnh hiện tại'}</p>
            {previewMeta ? <p className="mt-1 text-xs text-slate-400">{previewMeta}</p> : null}
          </div>
        </div>
      ) : null}

      {audioUrl ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 truncate text-sm font-semibold text-slate-700">{audioLabel || 'Audio hiện tại'}</p>
          {audioMeta ? <p className="mb-3 text-xs text-slate-400">{audioMeta}</p> : null}
          <audio controls src={audioUrl} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function EntityModal({
  modalState,
  formValues,
  previews,
  catalog,
  saving,
  formAlert,
  onClose,
  onSubmit,
  onValueChange,
  onFileChange,
}) {
  if (!modalState.open) return null;

  const { entity, mode } = modalState;
  const isSong = entity === 'songs';
  const isAlbum = entity === 'albums';
  const isArtist = entity === 'artists';
  const EntityIcon = {
    songs: FiMusic,
    albums: FiDisc,
    artists: FiUser,
    genres: FiFolderPlus,
  }[entity];
  const title = mode === 'create'
    ? {
        songs: 'Thêm bài hát',
        albums: 'Thêm album',
        artists: 'Thêm nghệ sĩ',
        genres: 'Thêm thể loại',
      }[entity]
    : {
        songs: 'Cập nhật bài hát',
        albums: 'Cập nhật album',
        artists: 'Cập nhật nghệ sĩ',
        genres: 'Cập nhật thể loại',
      }[entity];
  const submitLabel = saving ? 'Đang lưu...' : mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6 backdrop-blur-sm sm:px-4 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(244,247,251,0.98))] shadow-[0_30px_120px_rgba(15,23,42,0.30)] sm:rounded-[36px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <EntityIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-500">Admin Studio</p>
              <h3 id="entity-modal-title" className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 outline-none transition hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-cyan-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {formAlert ? (
            <div className="mb-5 flex items-start gap-3 rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">{formAlert}</p>
            </div>
          ) : null}

          {isSong ? (
            <div className="space-y-7">
              <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
                <FormSection icon={FiMusic} title="Thông tin bài hát">
                  <div className="grid gap-5 md:grid-cols-[1fr_260px]">
                    <InputField
                      label="Tên bài hát"
                      required
                      value={formValues.tieu_de}
                      onChange={(event) => onValueChange('tieu_de', event.target.value)}
                      placeholder="Ví dụ: Mưa Tháng Sáu"
                    />
                    <StatusPicker
                      label="Trạng thái"
                      value={formValues.trang_thai}
                      onChange={(nextValue) => onValueChange('trang_thai', nextValue)}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Quốc gia"
                      value={formValues.quoc_gia}
                      onChange={(event) => onValueChange('quoc_gia', event.target.value)}
                      placeholder="Việt Nam"
                    />
                    <InputField
                      label="Năm phát hành"
                      type="number"
                      value={formValues.nam_phat_hanh}
                      onChange={(event) => onValueChange('nam_phat_hanh', event.target.value)}
                      placeholder="2026"
                    />
                  </div>

                  <TextareaField
                    label="Lời bài hát"
                    value={formValues.loi_bai_hat}
                    onChange={(event) => onValueChange('loi_bai_hat', event.target.value)}
                    placeholder="Nhập lời bài hát nếu có..."
                  />
                </FormSection>

                <FormSection icon={FiUploadCloud} title="Tệp & hình ảnh">
                  <UploadField
                    label="Ảnh bài hát"
                    required={mode === 'create'}
                    hint="JPG, PNG, WEBP..."
                    accept="image/*"
                    icon={FiImage}
                    previewUrl={previews.imageUrl}
                    previewLabel={previews.imageLabel}
                    previewMeta={previews.imageMeta}
                    onChange={(event) => onFileChange('image_file', event.target.files?.[0] || null)}
                  />
                  <UploadField
                    label="File audio"
                    required={mode === 'create'}
                    hint="MP3, WAV, M4A..."
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                    icon={FiUploadCloud}
                    audioUrl={previews.audioUrl}
                    audioLabel={previews.audioLabel}
                    audioMeta={previews.audioMeta}
                    onChange={(event) => onFileChange('audio_file', event.target.files?.[0] || null)}
                  />
                </FormSection>
              </div>

              <FormSection icon={FiUsers} title="Ca sĩ, album và thể loại">
                <div className="grid gap-5 xl:grid-cols-2">
                  <ArtistTagPicker
                    label="Ca sĩ thể hiện"
                    required
                    artists={catalog.artists}
                    values={formValues.id_nghe_si_ids}
                    onChange={(selectedValues) => onValueChange('id_nghe_si_ids', selectedValues)}
                  />
                  <SingleSelectPicker
                    label="Album"
                    value={formValues.id_album_id}
                    onChange={(nextValue) => onValueChange('id_album_id', nextValue)}
                    options={catalog.albums.map((album) => ({
                      value: album.id.toString(),
                      label: album.tieu_de,
                      subtitle: album.id_nghe_si_detail?.ten_nghe_si || 'Chưa gán nghệ sĩ',
                    }))}
                    placeholder="Không gán album"
                    searchPlaceholder="Tìm album để gán cho bài hát"
                    emptyText="Chưa có album nào trong hệ thống"
                    icon={FiDisc}
                  />
                </div>
                <MultiSelectDropdown
                  label="Thể loại"
                  options={catalog.genres.map(g => ({ value: g.id.toString(), label: g.ten_the_loai }))}
                  values={formValues.the_loai_ids}
                  onChange={(selectedValues) => onValueChange('the_loai_ids', selectedValues)}
                />
              </FormSection>
            </div>
          ) : null}

          {isAlbum ? (
            <div className="space-y-7">
              <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
                <FormSection icon={FiDisc} title="Thông tin album">
                  <InputField
                    label="Tên album"
                    required
                    value={formValues.tieu_de}
                    onChange={(event) => onValueChange('tieu_de', event.target.value)}
                    placeholder="Ví dụ: Những Mùa Yêu"
                  />
                  <SingleSelectPicker
                    label="Nghệ sĩ"
                    required
                    value={formValues.id_nghe_si}
                    onChange={(nextValue) => onValueChange('id_nghe_si', nextValue)}
                    options={catalog.artists.map((artist) => ({
                      value: artist.id.toString(),
                      label: artist.ten_nghe_si,
                      subtitle: artist.tieu_su || 'Nghệ sĩ trong hệ thống',
                    }))}
                    placeholder="Chọn nghệ sĩ"
                    searchPlaceholder="Tìm nghệ sĩ cho album"
                    emptyText="Chưa có nghệ sĩ nào trong hệ thống"
                    icon={FiUser}
                    allowClear={false}
                  />
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Ngày phát hành"
                      type="date"
                      value={formValues.ngay_phat_hanh}
                      onChange={(event) => onValueChange('ngay_phat_hanh', event.target.value)}
                    />
                    <StatusPicker
                      label="Trạng thái"
                      value={formValues.trang_thai}
                      onChange={(nextValue) => onValueChange('trang_thai', nextValue)}
                    />
                  </div>
                </FormSection>

                <FormSection icon={FiImage} title="Ảnh bìa">
                  <UploadField
                    label="Ảnh bìa album"
                    required={mode === 'create'}
                    accept="image/*"
                    icon={FiDisc}
                    previewUrl={previews.imageUrl}
                    previewLabel={previews.imageLabel}
                    previewMeta={previews.imageMeta}
                    onChange={(event) => onFileChange('cover_file', event.target.files?.[0] || null)}
                  />
                </FormSection>
              </div>

              <FormSection icon={FiMusic} title="Bài hát trong album">
                <SongTagPicker
                  label="Danh sách bài hát"
                  songs={catalog.songs}
                  values={formValues.song_ids}
                  onChange={(selectedValues) => onValueChange('song_ids', selectedValues)}
                  artistId={formValues.id_nghe_si}
                />
              </FormSection>
            </div>
          ) : null}

          {!isSong && !isAlbum ? (
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                {isArtist ? (
                  <FormSection icon={FiUser} title="Thông tin nghệ sĩ">
                    <InputField
                      label="Tên nghệ sĩ"
                      required
                      value={formValues.ten_nghe_si}
                      onChange={(event) => onValueChange('ten_nghe_si', event.target.value)}
                      placeholder="Ví dụ: Bùi Trường Linh"
                    />
                    <TextareaField
                      label="Tiểu sử"
                      value={formValues.tieu_su}
                      onChange={(event) => onValueChange('tieu_su', event.target.value)}
                      placeholder="Mô tả ngắn về nghệ sĩ..."
                    />
                  </FormSection>
                ) : (
                  <FormSection icon={FiFolderPlus} title="Thông tin thể loại">
                    <InputField
                      label="Tên thể loại"
                      required
                      value={formValues.ten_the_loai}
                      onChange={(event) => onValueChange('ten_the_loai', event.target.value)}
                      placeholder="Ví dụ: Chill, Ballad, Tâm trạng"
                    />
                    <TextareaField
                      label="Mô tả"
                      value={formValues.mo_ta_the_loai}
                      onChange={(event) => onValueChange('mo_ta_the_loai', event.target.value)}
                      placeholder="Mô tả ngắn cho thể loại..."
                    />
                  </FormSection>
                )}
              </div>

              <FormSection icon={FiUploadCloud} title="Hình ảnh">
                {isArtist ? (
                  <UploadField
                    label="Ảnh nghệ sĩ"
                    required={mode === 'create'}
                    hint="Ảnh chân dung hoặc avatar"
                    accept="image/*"
                    icon={FiUser}
                    previewUrl={previews.imageUrl}
                    previewLabel={previews.imageLabel}
                    previewMeta={previews.imageMeta}
                    onChange={(event) => onFileChange('artist_image_file', event.target.files?.[0] || null)}
                  />
                ) : (
                  <UploadField
                    label="Ảnh thể loại"
                    required={mode === 'create'}
                    hint="Ảnh đại diện cho thể loại/mood"
                    accept="image/*"
                    icon={FiFolderPlus}
                    previewUrl={previews.imageUrl}
                    previewLabel={previews.imageLabel}
                    previewMeta={previews.imageMeta}
                    onChange={(event) => onFileChange('topic_image_file', event.target.files?.[0] || null)}
                  />
                )}
              </FormSection>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 mt-7 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/90 px-5 py-5 backdrop-blur sm:-mx-7 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white outline-none transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiUploadCloud className="h-4 w-4" />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SongsTable({ items, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-400">
              <th className="px-6 py-4 font-semibold">Bài hát</th>
              <th className="px-6 py-4 font-semibold">Nghệ sĩ</th>
              <th className="px-6 py-4 font-semibold">Album</th>
              <th className="px-6 py-4 font-semibold">Thể loại</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold">Lượt nghe</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((song) => (
              <tr key={song.id} className="transition hover:bg-slate-50/80">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {song.duong_dan_hinh_anh ? (
                      <img src={song.duong_dan_hinh_anh} alt={song.tieu_de} className="h-12 w-12 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FiMusic className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{song.tieu_de}</p>
                      <p className="truncate text-xs text-slate-400">{song.quoc_gia || 'Không rõ quốc gia'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{getSongArtistNames(song, '—')}</td>
                <td className="px-6 py-4 text-slate-500">{song.id_album?.tieu_de || 'Chưa gán'}</td>
                <td className="px-6 py-4 text-slate-500">
                  {song.the_loais?.length ? song.the_loais.map(g => g.ten_the_loai).join(', ') : 'Chưa gán'}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(song.trang_thai)}`}>
                    {song.trang_thai === 'PUBLIC' ? 'Công khai' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{(song.luot_nghe ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(song)}
                      className="rounded-xl bg-cyan-50 p-2 text-cyan-600 transition hover:bg-cyan-100"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(song)}
                      className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                      title="Xóa"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardList({ items, onEdit, onDelete, renderCard }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => renderCard(item, onEdit, onDelete))}
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function ManageMusic({
  initialEntity = 'songs',
  hideTabs = false,
  pageTitle,
}) {
  const [catalog, setCatalog] = useState(() => getCachedCatalogSnapshot());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [activeTab, setActiveTab] = useState(initialEntity);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState(TAB_DEFAULT_SORT[initialEntity]);
  const [modalState, setModalState] = useState({ open: false, entity: 'songs', mode: 'create', item: null });
  const [formValues, setFormValues] = useState(getEmptyForm('songs'));
  const [previews, setPreviews] = useState({
    imageUrl: '',
    imageLabel: '',
    imageMeta: '',
    audioUrl: '',
    audioLabel: '',
    audioMeta: '',
  });
  const [formAlert, setFormAlert] = useState('');
  const previewRef = useRef(previews);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    previewRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      if (previewRef.current.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(previewRef.current.imageUrl);
      if (previewRef.current.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(previewRef.current.audioUrl);
    };
  }, []);

  const loadCatalog = useCallback(async (tabKey = activeTab, { force = false } = {}) => {
    const requestId = ++loadRequestIdRef.current;
    const primaryKey = tabKey;
    const supportingKeys = (ENTITY_DEPENDENCIES[tabKey] || []).filter((key) => force || !isCatalogKeyFresh(key));
    const shouldFetchPrimary = force || !isCatalogKeyFresh(primaryKey);

    startTransition(() => {
      setCatalog(getCachedCatalogSnapshot());
    });

    if (!shouldFetchPrimary && !supportingKeys.length) {
      setLoading(false);
      return;
    }

    if (shouldFetchPrimary && !hasCatalogKeyData(primaryKey)) {
      setLoading(true);
    }

    try {
      if (shouldFetchPrimary) {
        const primaryItems = normalizeList(await ENTITY_FETCHERS[primaryKey]());
        if (requestId !== loadRequestIdRef.current) return;
        catalogCache[primaryKey] = primaryItems;
        catalogCache.fetchedAt[primaryKey] = Date.now();
      }

      startTransition(() => {
        setCatalog(getCachedCatalogSnapshot());
      });
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      toast.error(extractErrorMessage(error));
      setCatalog((prev) => ({ ...prev, [primaryKey]: [] }));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }

    if (!supportingKeys.length) return;

    Promise.allSettled(
      supportingKeys.map(async (key) => [key, normalizeList(await ENTITY_FETCHERS[key]())]),
    ).then((results) => {
      if (requestId !== loadRequestIdRef.current) return;
      let hasNewData = false;
      results.forEach((result) => {
        if (result.status !== 'fulfilled') return;
        const [key, items] = result.value;
        catalogCache[key] = items;
        catalogCache.fetchedAt[key] = Date.now();
        hasNewData = true;
      });

      if (hasNewData) {
        startTransition(() => {
          setCatalog(getCachedCatalogSnapshot());
        });
      }
    });
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCatalog(activeTab);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadCatalog]);

  function replacePreview(nextPreviewOrUpdater) {
    setPreviews((prev) => {
      const nextPreview = typeof nextPreviewOrUpdater === 'function' ? nextPreviewOrUpdater(prev) : nextPreviewOrUpdater;
      if (prev.imageUrl?.startsWith('blob:') && prev.imageUrl !== nextPreview.imageUrl) {
        URL.revokeObjectURL(prev.imageUrl);
      }
      if (prev.audioUrl?.startsWith('blob:') && prev.audioUrl !== nextPreview.audioUrl) {
        URL.revokeObjectURL(prev.audioUrl);
      }
      return nextPreview;
    });
  }

  function openModal(entity, mode, item = null) {
    setModalState({ open: true, entity, mode, item });
    setFormValues(getInitialForm(entity, item, catalog));
    setFormAlert('');
    replacePreview(getInitialPreview(entity, item));
  }

  function handleTabChange(tabKey) {
    setActiveTab(tabKey);
    setStatusFilter('ALL');
    setSortOption(TAB_DEFAULT_SORT[tabKey]);
    setSearch('');
    setFormAlert('');
  }

  function closeModal() {
    setModalState({ open: false, entity: activeTab, mode: 'create', item: null });
    setFormValues(getEmptyForm(activeTab));
    setFormAlert('');
    replacePreview({
      imageUrl: '',
      imageLabel: '',
      imageMeta: '',
      audioUrl: '',
      audioLabel: '',
      audioMeta: '',
    });
  }

  function handleValueChange(field, value) {
    setFormAlert('');
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileChange(field, file) {
    setFormAlert('');
    setFormValues((prev) => ({ ...prev, [field]: file }));
    if (!file) return;

    const validationError = validateSelectedFile(field, file);
    if (validationError) {
      setFormValues((prev) => ({ ...prev, [field]: null }));
      setFormAlert(validationError);
      toast.error(validationError);
      return;
    }

    if (field === 'audio_file') {
      const audioObjectUrl = URL.createObjectURL(file);
      replacePreview((prev) => ({
        ...prev,
        audioUrl: audioObjectUrl,
        audioLabel: file.name,
        audioMeta: `Đang đọc metadata • ${formatBytes(file.size)}`,
      }));
      const audioMeta = await readAudioMetadata(audioObjectUrl, file.size);
      if (audioMeta.duration) {
        setFormValues((prev) => (prev.audio_file === file ? { ...prev, thoi_luong: audioMeta.duration.toString() } : prev));
      }
      replacePreview((prev) => (prev.audioUrl === audioObjectUrl ? { ...prev, audioMeta: audioMeta.text } : prev));
      return;
    }

    const imageObjectUrl = URL.createObjectURL(file);
    replacePreview((prev) => ({
      ...prev,
      imageUrl: imageObjectUrl,
      imageLabel: file.name,
      imageMeta: `Đang đọc metadata • ${formatBytes(file.size)}`,
    }));
    const imageMeta = await readImageMetadata(imageObjectUrl, file.size);
    replacePreview((prev) => (prev.imageUrl === imageObjectUrl ? { ...prev, imageMeta } : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { entity, mode, item } = modalState;
    const validationError = validateForm(entity, formValues, previews);
    if (validationError) {
      setFormAlert(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);

    try {
      const uploadReadyValues = await uploadPendingFiles(entity, formValues);
      const payload = buildFormData(entity, uploadReadyValues);
      let savedItem;

      if (entity === 'songs') {
        savedItem = mode === 'create' ? await songService.create(payload) : await songService.update(item.id, payload);
      }

      if (entity === 'albums') {
        savedItem = mode === 'create' ? await albumService.create(payload) : await albumService.update(item.id, payload);
      }

      if (entity === 'artists') {
        savedItem = mode === 'create' ? await artistService.create(payload) : await artistService.update(item.id, payload);
      }

      if (entity === 'genres') {
        savedItem = mode === 'create' ? await genreService.create(payload) : await genreService.update(item.id, payload);
      }

      upsertCachedItem(entity, savedItem);
      if (entity === 'albums') {
        syncCachedAlbumSongs(savedItem, uploadReadyValues.song_ids);
      }
      markCatalogCacheStale(MUTATION_STALE_KEYS[entity]);
      startTransition(() => {
        setCatalog(getCachedCatalogSnapshot());
      });
      closeModal();
      toast.success(mode === 'create' ? 'Đã tạo thành công.' : 'Đã cập nhật thành công.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entity, item) {
    const entityLabel = {
      songs: 'bài hát',
      albums: 'album',
      artists: 'nghệ sĩ',
      genres: 'thể loại',
    }[entity];

    if (!window.confirm(`Xóa ${entityLabel} "${getEntityTitle(item)}"?`)) {
      return;
    }

    try {
      if (entity === 'songs') await songService.delete(item.id);
      if (entity === 'albums') await albumService.delete(item.id);
      if (entity === 'artists') await artistService.delete(item.id);
      if (entity === 'genres') await genreService.delete(item.id);

      removeCachedItem(entity, item.id);
      if (entity === 'albums') {
        syncCachedAlbumSongs(item);
      }
      markCatalogCacheStale(MUTATION_STALE_KEYS[entity]);
      startTransition(() => {
        setCatalog(getCachedCatalogSnapshot());
      });
      toast.success(`Đã xóa ${entityLabel}.`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  const stats = buildTabStats(catalog);

  const visibleItems = sortItems(catalog[activeTab].filter((item) => {
    const keyword = deferredSearch.trim().toLowerCase();
    const statusMatched = statusFilter === 'ALL'
      || (activeTab === 'songs' || activeTab === 'albums' ? item.trang_thai === statusFilter : true);

    if (!statusMatched) return false;
    if (!keyword) return true;

    if (activeTab === 'songs') {
      return [
        item.tieu_de,
        getSongArtistNames(item, ''),
        item.id_album?.tieu_de,
        item.the_loais?.map(g => g.ten_the_loai).join(', '),
      ].some((value) => value?.toLowerCase().includes(keyword));
    }

    if (activeTab === 'albums') {
      return [item.tieu_de, item.id_nghe_si_detail?.ten_nghe_si].some((value) => value?.toLowerCase().includes(keyword));
    }

    if (activeTab === 'artists') {
      return [item.ten_nghe_si, item.tieu_su].some((value) => value?.toLowerCase().includes(keyword));
    }

    return [item.ten_the_loai, item.mo_ta_the_loai].some((value) => value?.toLowerCase().includes(keyword));
  }), activeTab, sortOption, catalog);

  const currentTabMeta = TAB_CONFIG.find((tab) => tab.key === activeTab);
  const shouldShowStatusFilter = activeTab === 'songs' || activeTab === 'albums';
  const showResetFilters = search || statusFilter !== 'ALL' || sortOption !== TAB_DEFAULT_SORT[activeTab];
  const resolvedPageTitle = pageTitle || {
    songs: 'Quản lý bài hát',
    albums: 'Quản lý album',
    artists: 'Quản lý nghệ sĩ',
    genres: 'Quản lý thể loại',
  }[activeTab];
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(45,170,237,0.24),transparent_34%),linear-gradient(135deg,#ffffff,#eef7ff_48%,#f8fbff)] p-6 text-slate-950 shadow-[0_22px_70px_rgba(45,170,237,0.14)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              {(() => {
                const ActiveIcon = currentTabMeta?.icon || FiMusic;
                return <ActiveIcon className="h-3.5 w-3.5" />;
              })()}
              Admin Studio
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">{resolvedPageTitle}</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-bold text-sky-600">Tổng mục</p>
              <p className="text-xl font-black">{stats[activeTab]}</p>
            </div>
            <button
              type="button"
              onClick={() => openModal(activeTab, 'create')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:from-sky-600 hover:to-cyan-600"
            >
              <FiPlus className="h-4 w-4" />
              {activeTab === 'songs' ? 'Thêm bài hát' : activeTab === 'albums' ? 'Thêm album' : activeTab === 'artists' ? 'Thêm nghệ sĩ' : 'Thêm thể loại'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/70 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {hideTabs ? (
            <div className="flex items-center gap-3 rounded-[22px] bg-sky-50 px-4 py-3 text-sky-700 shadow-sm ring-1 ring-sky-100">
              <div className="rounded-2xl bg-white p-2">
                {(() => {
                  const ActiveIcon = currentTabMeta?.icon || FiMusic;
                  return <ActiveIcon className="h-4 w-4" />;
                })()}
              </div>
              <div>
                <p className="text-sm font-semibold">{currentTabMeta?.label}</p>
                <p className="text-xs text-sky-500">{stats[activeTab]}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TAB_CONFIG.map((tab) => {
                const Icon = tab.icon;
                const active = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-3 text-left transition ${
                      active
                        ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`rounded-2xl p-2 ${active ? 'bg-white' : 'bg-white'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tab.label}</p>
                      <p className={`text-xs ${active ? 'text-sky-500' : 'text-slate-400'}`}>{stats[tab.key]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-[280px]">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Tìm ${currentTabMeta?.label?.toLowerCase() || 'dữ liệu'}...`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
              />
            </div>
            {shouldShowStatusFilter ? (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-slate-600">
                <FiFilter className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="bg-transparent text-sm font-medium outline-none"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ) : null}
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            >
              {SORT_OPTIONS[activeTab].map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {showResetFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setSortOption(TAB_DEFAULT_SORT[activeTab]);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                Xóa bộ lọc
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => openModal(activeTab, 'create')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              <FiPlus className="h-4 w-4" />
              Tạo mới
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-white/70 bg-white/95 px-6 py-20 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : visibleItems.length === 0 ? (
        <EmptyPanel
          icon={FiAlertCircle}
          title={`Chưa có ${currentTabMeta?.label?.toLowerCase() || 'dữ liệu'} phù hợp`}
          description="Thử đổi từ khóa tìm kiếm hoặc tạo mới trực tiếp từ giao diện quản trị này."
        />
      ) : activeTab === 'songs' ? (
        <SongsTable
          items={visibleItems}
          onEdit={(item) => openModal('songs', 'edit', item)}
          onDelete={(item) => handleDelete('songs', item)}
        />
      ) : activeTab === 'albums' ? (
        <CardList
          items={visibleItems}
          onEdit={(item) => openModal('albums', 'edit', item)}
          onDelete={(item) => handleDelete('albums', item)}
          renderCard={(album, onEdit, onDelete) => (
            <div key={album.id} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <div className="relative h-52 bg-slate-100">
                {album.anh_bia ? (
                  <img src={album.anh_bia} alt={album.tieu_de} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <FiDisc className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute right-4 top-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(album.trang_thai)}`}>
                    {album.trang_thai === 'PUBLIC' ? 'Công khai' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{album.tieu_de}</h3>
                    <p className="mt-1 text-sm text-slate-500">{album.id_nghe_si_detail?.ten_nghe_si || 'Chưa gán nghệ sĩ'}</p>
                    <p className="mt-1 text-xs text-slate-400">{album.ngay_phat_hanh || 'Chưa có ngày phát hành'}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">{album.song_count ?? getSongsForAlbum(catalog, album.id).length} bài hát</p>
                  </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => onEdit(album)} className="rounded-xl bg-cyan-50 p-2 text-cyan-600 transition hover:bg-cyan-100">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(album)} className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      ) : activeTab === 'artists' ? (
        <CardList
          items={visibleItems}
          onEdit={(item) => openModal('artists', 'edit', item)}
          onDelete={(item) => handleDelete('artists', item)}
          renderCard={(artist, onEdit, onDelete) => {
            const albumCount = getAlbumCountForArtist(catalog, artist.id);
            const songCount = getSongCountForArtist(catalog, artist.id);

            return (
              <div key={artist.id} className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  {artist.anh_nghe_si ? (
                    <img src={artist.anh_nghe_si} alt={artist.ten_nghe_si} className="h-20 w-20 rounded-[24px] object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-amber-50 text-amber-500">
                      <FiMic className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900">{artist.ten_nghe_si}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {artist.tieu_su || 'Chưa có tiểu sử cho nghệ sĩ này.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{songCount} bài hát</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{albumCount} album</span>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => onEdit(artist)} className="rounded-xl bg-cyan-50 p-2 text-cyan-600 transition hover:bg-cyan-100">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(artist)} className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          }}
        />
      ) : (
        <CardList
          items={visibleItems}
          onEdit={(item) => openModal('genres', 'edit', item)}
          onDelete={(item) => handleDelete('genres', item)}
          renderCard={(genre, onEdit, onDelete) => {
            const songCount = getSongCountForGenre(catalog, genre.id);

            return (
              <div key={genre.id} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <div className="relative h-44 bg-slate-100">
                  {genre.anh_the_loai ? (
                    <img src={genre.anh_the_loai} alt={genre.ten_the_loai} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <FiFolderPlus className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{songCount} bài hát</p>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{genre.ten_the_loai}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {genre.mo_ta_the_loai || 'Chưa có mô tả cho thể loại này.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(genre)} className="rounded-xl bg-cyan-50 p-2 text-cyan-600 transition hover:bg-cyan-100">
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onDelete(genre)} className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}

      <EntityModal
        modalState={modalState}
        formValues={formValues}
        previews={previews}
        catalog={catalog}
        saving={saving}
        formAlert={formAlert}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onValueChange={handleValueChange}
        onFileChange={handleFileChange}
      />
    </div>
  );
}
