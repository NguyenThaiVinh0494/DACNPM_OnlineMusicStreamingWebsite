/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

// Giải mã JWT để lấy user_id và kiểm tra hạn
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Khởi tạo state đồng bộ (tránh render 2 lần chớp nhoáng)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        return savedUser ? JSON.parse(savedUser) : { id: decoded.user_id, token };
      }
    }
    return null;
  });
  
  // Vì ta đã tính toán user ngay từ đầu, loading có thể set là false luôn
  const loading = false;

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
    toast.success('Đã đăng xuất!');
  };

  useEffect(() => {
    // useEffect giờ chỉ dùng để dọn dẹp (side-effect) nếu token đã hết hạn
    // và lấy thông tin user mới nhất
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeToken(token);
      if (!decoded || decoded.exp * 1000 <= Date.now()) {
        // Chỉ dọn dẹp rác trong localStorage, không gọi hàm setter
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
      } else {
        // Token còn hạn -> fetch thông tin mới nhất
        axios.get('/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setUser(prev => {
            if (!prev) return prev;
            const updatedUser = {
              ...prev,
              username: res.data.username,
              email: res.data.email,
              first_name: res.data.first_name,
              last_name: res.data.last_name,
              vai_tro: res.data.vai_tro,
              avatar: res.data.anh_dai_dien || `https://ui-avatars.com/api/?name=${res.data.username}&background=random`
            };
            localStorage.setItem('user_info', JSON.stringify(updatedUser));
            return updatedUser;
          });
        }).catch(err => console.error("Failed to fetch fresh user info", err));
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      const decoded = decodeToken(data.access);
      
      // Gọi API lấy thông tin user thực sự
      const userRes = await axios.get('/users/me/', {
        headers: { Authorization: `Bearer ${data.access}` }
      });
      
      const userInfo = { 
        id: decoded.user_id, 
        token: data.access, 
        username: userRes.data.username,
        email: userRes.data.email,
        first_name: userRes.data.first_name,
        last_name: userRes.data.last_name,
        vai_tro: userRes.data.vai_tro,
        avatar: userRes.data.anh_dai_dien || 'https://ui-avatars.com/api/?name=' + userRes.data.username + '&background=random' 
      };
      
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      setUser(userInfo);
      
      toast.success('Đăng nhập thành công!');

      // Nếu là Admin, mở tab mới chứa Admin Dashboard
      if (userRes.data.vai_tro === 'ADMIN') {
        window.open('/admin', '_blank');
      }

      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Đăng nhập thất bại. Kiểm tra tài khoản/mật khẩu!');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('Đăng ký thành công! Đang tự động đăng nhập...');
      // Tự động đăng nhập luôn sau khi đăng ký thành công
      return await login(userData.username, userData.password);
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] || 
                       error.response?.data?.email?.[0] || 
                       error.response?.data?.detail || 
                       'Đăng ký thất bại. Kiểm tra lại thông tin!';
      toast.error(errorMsg);
      return false;
    }
  };



  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
