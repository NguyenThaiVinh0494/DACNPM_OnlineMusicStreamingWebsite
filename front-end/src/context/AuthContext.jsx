/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import axios, { AUTH_CLEARED_EVENT } from '../api/axios';
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
  const [authModal, setAuthModal] = useState(null);
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

  const closeExternalWindow = (externalWindow) => {
    if (!externalWindow || externalWindow.closed) return;
    try {
      externalWindow.close();
    } catch {
      // Ignore popup close errors from the browser.
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
    toast.success('Đã đăng xuất!');
  };

  const openLoginModal = () => setAuthModal('login');
  const openRegisterModal = () => setAuthModal('register');
  const closeAuthModal = () => setAuthModal(null);

  const persistAuthData = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    const decoded = decodeToken(data.access);
    const apiUser = data.user || {};
    const username = apiUser.username || decoded?.username || 'User';
    const userInfo = {
      id: apiUser.id || decoded?.user_id,
      token: data.access,
      username,
      email: apiUser.email || '',
      first_name: apiUser.first_name || '',
      last_name: apiUser.last_name || '',
      vai_tro: apiUser.vai_tro || 'USER',
      avatar: apiUser.anh_dai_dien || `https://ui-avatars.com/api/?name=${username}&background=random`,
    };

    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null);
    };
    const handleAuthStorageChange = (event) => {
      const authStorageKeys = ['access_token', 'refresh_token', 'user_info'];
      if (authStorageKeys.includes(event.key) && !localStorage.getItem('access_token')) {
        setUser(null);
      }
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    window.addEventListener('storage', handleAuthStorageChange);

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

    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
      window.removeEventListener('storage', handleAuthStorageChange);
    };
  }, []);

  const login = async (username, password, options = {}) => {
    const { adminTab } = options;

    try {
      const data = await authService.login(username, password);
      
      // Gọi API lấy thông tin user thực sự
      const userRes = await axios.get('/users/me/', {
        headers: { Authorization: `Bearer ${data.access}` }
      });
      
      persistAuthData({ ...data, user: userRes.data });
      
      toast.success('Đăng nhập thành công!');

      if (userRes.data.vai_tro === 'ADMIN') {
        if (adminTab && !adminTab.closed) {
          adminTab.location.href = `${window.location.origin}/admin`;
          adminTab.focus?.();
        } else {
          window.open('/admin', '_blank');
        }
      } else {
        closeExternalWindow(adminTab);
      }

      return true;
    } catch (error) {
      closeExternalWindow(adminTab);
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
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      loading,
      authModal,
      openLoginModal,
      openRegisterModal,
      closeAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
