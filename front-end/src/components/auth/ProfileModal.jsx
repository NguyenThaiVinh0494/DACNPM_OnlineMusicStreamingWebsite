import { useState, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUser, FiTrash2, FiCamera, FiAlertTriangle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from '../../api/axios';

function getProfileErrorMessage(error) {
  const data = error.response?.data;
  if (!data) return 'Có lỗi xảy ra khi cập nhật thông tin.';
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  if (data.detail) return data.detail;

  const firstFieldError = Object.values(data).flat().find(Boolean);
  return firstFieldError || 'Có lỗi xảy ra khi cập nhật thông tin.';
}

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout, setUser } = useContext(AuthContext);
  // Khởi tạo state với giá trị mặc định của user
  const [firstName, setFirstName] = useState(() => user?.first_name || '');
  const [lastName, setLastName] = useState(() => user?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar || '');
  const [username, setUsername] = useState(() => user?.username || '');
  const [email, setEmail] = useState(() => user?.email || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      // Dùng async function để tránh cảnh báo gọi setState đồng bộ trong effect
      const syncData = async () => {
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setAvatarUrl(user.avatar || '');
        setUsername(user.username || '');
        setEmail(user.email || '');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setConfirmAction(null);
      };
      syncData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const wantsPasswordChange = Boolean(oldPassword || newPassword || confirmPassword);
    if (wantsPasswordChange && (!oldPassword || !newPassword || !confirmPassword)) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.');
      return;
    }

    if (wantsPasswordChange && newPassword !== confirmPassword) {
      toast.error('Nhập lại mật khẩu mới không khớp!');
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        anh_dai_dien: avatarUrl,
        username: username.trim(),
        email: email.trim(),
      };

      if (wantsPasswordChange) {
        payload.old_password = oldPassword;
        payload.new_password = newPassword;
      }

      const response = await axios.put('/users/me/', payload);
      
      const updatedUser = {
        ...user,
        first_name: response.data.user.first_name,
        last_name: response.data.user.last_name,
        avatar: response.data.user.anh_dai_dien,
        username: response.data.user.username,
        email: response.data.user.email,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      toast.success('Cập nhật thông tin thành công!');
      
      // Reset password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onClose();
    } catch (error) {
      toast.error(getProfileErrorMessage(error));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const loadingToast = toast.loading('Đang tải ảnh lên...');
    try {
      const response = await axios.post('/upload/image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarUrl(response.data.url);
      toast.success('Tải ảnh lên thành công!', { id: loadingToast });
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên.', { id: loadingToast });
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/users/me/');
      toast.success('Tài khoản đã được xóa thành công.');
      logout();
      onClose();
    } catch (error) {
      toast.error('Không thể xóa tài khoản. Thử lại sau.');
      console.error(error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-[#2d2f32] border border-gray-200 dark:border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chỉnh sửa thông tin</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {confirmAction ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {confirmAction === 'logout' ? 'Xác nhận Đăng xuất' : 'Xác nhận Xóa Tài khoản'}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[80%]">
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu playlist và lịch sử của bạn sẽ bị xóa vĩnh viễn.
            </p>
            
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 pb-2">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#2d2f32] shadow-lg overflow-hidden bg-gray-100 dark:bg-white/5">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nhấn để thay đổi ảnh đại diện</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Form Info */}
            <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên đăng nhập</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-nct-primary dark:focus:border-cyan-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-nct-primary dark:focus:border-cyan-400 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Đổi Mật Khẩu</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu cũ</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-nct-primary dark:focus:border-cyan-400 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mật khẩu mới"
                        className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-nct-primary dark:focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-nct-primary dark:focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 mt-4 bg-nct-primary hover:bg-[#2591c4] dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black font-bold rounded-xl shadow-[0_0_15px_rgba(45,170,237,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-colors disabled:opacity-70"
              >
                {isUpdating ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
              </button>
            </form>

            <hr className="border-gray-200 dark:border-white/10 mb-6" />

            {/* Danger Actions */}
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => setConfirmAction('delete')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors"
              >
                <FiTrash2 className="w-5 h-5" />
                Xóa Tài Khoản
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
