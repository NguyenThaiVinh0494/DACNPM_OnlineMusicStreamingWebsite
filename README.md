# DACNPM_OnlineMusicStreamingWebsite

Cách chạy và dừng (thoát) khỏi dự án:

### 1. Cách khởi động (Run)

Dự án bao gồm 2 phần là Back-end và Front-end, bạn cần mở **2 cửa sổ Terminal riêng biệt** để chạy cả hai cùng lúc.

**👉 Chạy Back-end (Django):**

1. Mở Terminal 1 và đi tới thư mục back-end: `cd back-end`
2. Kích hoạt môi trường ảo (venv): `.\venv\Scripts\activate`
3. Chạy máy chủ (server): `python manage.py runserver`

**👉 Chạy Front-end (React/Vite):**

1. Mở Terminal 2 và đi tới thư mục front-end: `cd front-end`
2. Cài đặt thư viện (nếu đây là lần chạy đầu tiên hoặc mới kéo code về): `npm install`
3. Chạy giao diện người dùng: `npm run dev`
   *(Lưu ý: Nếu gặp lỗi chặn chạy script trên PowerShell, hãy chạy bằng Command Prompt (cmd) hoặc dùng lệnh `cmd /c npm run dev`)*

### 2. Cách dừng (Thoát)

Để dừng bất kỳ server nào đang chạy (cả Front-end và Back-end):

1. Bấm chuột vào bên trong cửa sổ Terminal đang chạy.
2. Nhấn tổ hợp phím **`Ctrl + C`**.
3. Nếu hệ thống hiển thị thông báo hỏi *Terminate batch job (Y/N)?*, hãy nhấn phím **`Y`** rồi nhấn **`Enter`**.
4. Dùng lệnh `deactivate` ở Terminal của Back-end để thoát khỏi môi trường ảo

---

Tương tác của các tác nhân user, website, admin với nhau:

* user sử dụng website:
  - Người dùng có thể dừng/phát nhạc khi nghe, có thể chọn lặp lại 1 bài hát, có thể chọn phát ngẫu nhiên, có thể chọn phát bài hát tiếp theo/trước đó.
  - Người dùng có thể tìm kiếm theo tên bài hát, theo nghệ sĩ, theo album, theo playlist.
  - Người dùng có thể đăng ký, đăng nhập, đăng xuất.
  - Người dùng có thể like, báo cáo bài hát.
  - Người dùng có thể tạo, sửa tên playlist; thêm, sửa, xóa bài hát trong playlist và xóa playlist.
  - Người dùng có thể xem thông tin cá nhân, chỉnh sửa thông tin cá nhân.
  - Người dùng có thể xem lịch sử nghe nhạc.
  - Người dùng có thể upload, chỉnh sửa, xóa thông tin bài hát, album, playlist của mình.
  - Người dùng có thể xem thông tin nghệ sĩ, bài hát, album, playlist.
  - Người dùng có thể xem danh sách bài hát theo thể loại, quốc gia, năm phát hành.
  - Người dùng có thể xem danh sách bài hát theo nghệ sĩ, album, playlist.
* website tương tác với user:
  - website hiển thị danh sách bài hát, album, playlist.
  - website hiển thị thông tin bài hát, album, playlist.
  - website hiển thị thông tin nghệ sĩ, bài hát, album, playlist.
  - website gợi ý bài hát theo chủ đề, ca sĩ, xu hướng, lượt nghe cho user.
* admin tương tác với website:
  - Admin có thể duyệt / từ chối bài hát, album, playlist do user upload lên.
  - Admin có thể thêm, sửa, xóa bài hát, album, playlist trong hệ thống.
  - Admin có thể quản lý thông tin người dùng (xem danh sách, khóa/mở khóa tài khoản, xóa tài khoản).
  - Admin có thể xem thống kê hệ thống (lượt nghe, bài hát trending, số lượng user).
  - Admin có thể cấu hình hệ thống (phân quyền, cài đặt chung).
* admin và user tương tác với nhau qua website:
  - admin duyệt/từ chối bài hát, album, playlist do user upload lên.
  - admin hướng dẫn, hỗ trợ user qua tính năng chat.
