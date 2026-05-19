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

export const adminUserService = {
  getAll: async (params = {}) => {
    const response = await api.get('admin/users/', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('admin/users/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`admin/users/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`admin/users/${id}/`);
    return response.data;
  },
};

// ============================
// Songs
// ============================
export const songService = {
  getAll: async (params = {}) => {
    const response = await api.get('songs/', { params });
    return response.data;
  },
  getRecommended: async (params = {}) => {
    const response = await api.get('songs/recommended/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`songs/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('songs/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`songs/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`songs/${id}/`);
    return response.data;
  }
};

export const artistService = {
  getAll: async (params = {}) => {
    const response = await api.get('artists/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`artists/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('artists/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`artists/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`artists/${id}/`);
    return response.data;
  }
};

export const albumService = {
  getAll: async (params = {}) => {
    const response = await api.get('albums/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`albums/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('albums/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`albums/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`albums/${id}/`);
    return response.data;
  }
};

export const genreService = {
  getAll: async (params = {}) => {
    const response = await api.get('genres/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`genres/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('genres/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`genres/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`genres/${id}/`);
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
  getMine: async () => {
    const response = await api.get('playlists/mine/');
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
