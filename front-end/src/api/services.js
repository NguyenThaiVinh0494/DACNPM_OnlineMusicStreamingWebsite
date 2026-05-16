import api from './axios';

// ============================
// Authentication
// ============================
export const authService = {
  login: async (username, password) => {
    const response = await api.post('login/', { username, password });
    return response.data; // Trả về { access, refresh }
  },
  register: async (userData) => {
    const response = await api.post('register/', userData);
    return response.data;
  }
};

// ============================
// Songs
// ============================
export const songService = {
  getAll: async (params = {}) => {
    const response = await api.get('songs/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`songs/${id}/`);
    return response.data;
  }
};

// ============================
// Playlists
// ============================
export const playlistService = {
  getAll: async () => {
    const response = await api.get('playlists/');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`playlists/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('playlists/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`playlists/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`playlists/${id}/`);
    return response.data;
  },
  addSong: async (playlistId, songId) => {
    const response = await api.post(`playlists/${playlistId}/add_song/`, { song_id: songId });
    return response.data;
  },
  removeSong: async (playlistId, songId) => {
    const response = await api.post(`playlists/${playlistId}/remove_song/`, { song_id: songId });
    return response.data;
  }
};

// ============================
// Favorites
// ============================
export const favoriteService = {
  getAll: async () => {
    const response = await api.get('favorites/');
    return response.data;
  },
  toggle: async (songId) => {
    // Nếu đã thích thì xóa, nếu chưa thì thêm
    // Thực tế có thể tách riêng add/remove tùy vào logic BE
    const response = await api.post('favorites/', { id_bai_hat: songId });
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`favorites/${id}/`);
    return response.data;
  }
};
