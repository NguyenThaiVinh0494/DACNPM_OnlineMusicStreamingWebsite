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

// Bạn có thể thêm các service cho nghệ sĩ, thể loại ở đây sau...
