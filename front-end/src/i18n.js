import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  vi: {
    translation: {
      "search_placeholder": "Tìm kiếm bài hát, nghệ sĩ, lời bài hát...",
      "login": "Đăng nhập",
      "register": "Đăng ký",
      "settings": "Cài đặt",
      "upload": "Tải lên",
      "dark_mode": "Chế độ tối",
      "help_support": "Hướng dẫn và hỗ trợ",
      "feedback": "Góp ý",
      "language": "Ngôn ngữ",
      "forgot_password": "Quên mật khẩu?",
      "no_account": "Chưa có tài khoản?",
      "has_account": "Đã có tài khoản?",
      "enter_email_username": "Nhập email/username của bạn",
      "enter_email": "Nhập email của bạn",
      "enter_username": "Nhập username của bạn",
      "enter_password": "Nhập mật khẩu của bạn",
      "confirm_password": "Nhập lại mật khẩu của bạn",
      "or_login_with": "Hoặc đăng nhập bằng",
      "or_register_with": "Hoặc đăng ký bằng",
      "discover": "Khám Phá",
      "for_you": "Dành Cho Bạn",
      "my_library": "Của Tui",
      "liked_songs": "Bài hát Yêu thích",
      "recently_played": "Nghe gần đây",
      "login_to_discover": "Đăng nhập để khám phá nhạc hay",
      "topics": "Chủ Đề",
      "more": "Thêm",
      "good_afternoon": "Chào buổi chiều",
      "about_us": "Về chúng tôi",
      "terms": "Điều khoản dịch vụ",
      "privacy": "Chính sách bảo mật",
      "download_app": "Tải ứng dụng",
      "library": "THƯ VIỆN",
      "my_playlists": "PLAYLIST CỦA TÔI",
      "create_new_playlist": "Tạo playlist mới",
      "enter_playlist_name": "Nhập tên playlist",
      "public": "Công khai",
      "private": "Riêng tư",
      "cancel": "Hủy",
      "save": "Lưu",
      "add_to_playlists": "Thêm vào playlist",
      "no_playlists_yet": "Bạn chưa tạo playlist nào.",
      "create_from_sidebar": "Hãy tạo một playlist mới từ thanh bên trái nhé!",
      "songs": "bài hát",
      "add": "Thêm",
      "added": "Đã thêm"
    }
  },
  en: {
    translation: {
      "search_placeholder": "Search for songs, artists, lyrics...",
      "login": "Login",
      "register": "Register",
      "settings": "Settings",
      "upload": "Upload",
      "dark_mode": "Dark Mode",
      "help_support": "Help & Support",
      "feedback": "Feedback",
      "language": "Language",
      "forgot_password": "Forgot password?",
      "no_account": "Don't have an account?",
      "has_account": "Already have an account?",
      "enter_email_username": "Enter your email/username",
      "enter_email": "Enter your email",
      "enter_username": "Enter your username",
      "enter_password": "Enter your password",
      "confirm_password": "Confirm your password",
      "or_login_with": "Or login with",
      "or_register_with": "Or register with",
      "discover": "Discover",
      "for_you": "For You",
      "my_library": "My Library",
      "liked_songs": "Liked Songs",
      "recently_played": "Recently Played",
      "login_to_discover": "Login to discover great music",
      "topics": "Topics",
      "more": "More",
      "good_afternoon": "Good afternoon",
      "about_us": "About Us",
      "terms": "Terms of Service",
      "privacy": "Privacy Policy",
      "download_app": "Download App",
      "library": "LIBRARY",
      "my_playlists": "MY PLAYLISTS",
      "create_new_playlist": "Create new playlist",
      "enter_playlist_name": "Enter playlist name",
      "public": "Public",
      "private": "Private",
      "cancel": "Cancel",
      "save": "Save",
      "add_to_playlists": "Add to playlists",
      "no_playlists_yet": "You haven't created any playlists yet.",
      "create_from_sidebar": "Create one from the sidebar first!",
      "songs": "songs",
      "add": "Add",
      "added": "Added"
    }
  }
};

const savedLanguage = localStorage.getItem('appLanguage') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
