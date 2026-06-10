# DACNPM_OnlineMusicStreamingWebsite

Cách chạy và dừng (thoát) khỏi dự án:

### 1. Cách khởi động (Run)

Dự án bao gồm 2 phần là Back-end và Front-end, bạn cần mở **2 cửa sổ Terminal riêng biệt** để chạy cả hai cùng lúc.

**Cách chạy 1: dùng DB Aiven**

**👉 Chạy Back-end (Django):**

1. Mở Terminal 1 và đi tới thư mục back-end: `cd back-end`
2. Kích hoạt môi trường ảo (venv): `.\venv\Scripts\activate`
3. Chạy máy chủ (server): `python manage.py runserver`

**👉 Chạy Front-end (React/Vite):**

1. Mở Terminal 2 và đi tới thư mục front-end: `cd front-end`
2. Cài đặt thư viện (nếu đây là lần chạy đầu tiên hoặc mới kéo code về): `npm install`
3. Chạy giao diện người dùng: `npm run dev`
   *(Lưu ý: Nếu gặp lỗi chặn chạy script trên PowerShell, hãy chạy bằng Command Prompt (cmd) hoặc dùng lệnh `cmd /c npm run dev`)*

**Cách chạy 2:Chạy bằng Docker sử dụng DB Docker local**

Dự án đã có cấu hình container cho Backend, Frontend và MySQL. Backend chạy bằng Gunicorn, Frontend được build bằng Vite và serve qua Nginx. Từ thư mục gốc dự án, chạy:

```powershell
chạy lần đâu: 
	docker compose up --build
những lần chạy sau:
	docker compose up
```

Sau khi các container khởi động xong:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- MySQL trong container: service nội bộ `db:3306`, port host `3307`

Khi chạy bằng Docker, Backend dùng MySQL local trong container để phản hồi nhanh hơn. Nếu cần xem dữ liệu bằng DBeaver, kết nối tới DB Docker bằng:

- Host: `127.0.0.1`
- Port: `3307`
- Database: `music_streaming`
- Username: `music_user`
- Password: `music_password`

Lưu ý: DB Docker local này độc lập với DB trong `back-end/.env` khi chạy Django không Docker.

Một số lệnh kiểm tra khi chạy bằng Docker:

```powershell
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose build frontend
```

### 2. Cách dừng (Thoát)

#### Cách thoát khi không chạy bằng docker

Để dừng bất kỳ server nào đang chạy (cả Front-end và Back-end):

1. Bấm chuột vào bên trong cửa sổ Terminal đang chạy.
2. Nhấn tổ hợp phím **`Ctrl + C`**.
3. Nếu hệ thống hiển thị thông báo hỏi *Terminate batch job (Y/N)?*, hãy nhấn phím **`Y`** rồi nhấn **`Enter`**.
4. Dùng lệnh `deactivate` ở Terminal của Back-end để thoát khỏi môi trường ảo

#### Cách thoát khi chạy bằng Docker

Trong terminal đang chạy Docker Compose, nhấn:

`	Ctrl + C`

Sau đó chạy:

    `docker compose down`

---

### Cấu hình môi trường

Trước khi chạy lần đầu, tạo file cấu hình local từ các mẫu và điền thông tin thực tế:

```powershell
Copy-Item back-end\.env.example back-end\.env
Copy-Item front-end\.env.example front-end\.env
```

- Backend bắt buộc có `SECRET_KEY`; không commit giá trị thật lên Git.
- Local development dùng `DEBUG=True` và whitelist origin của Vite trong `CORS_ALLOWED_ORIGINS`.
- Production phải đặt `DEBUG=False`, `ALLOWED_HOSTS` theo domain API, `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` theo domain frontend và một `SECRET_KEY` dài, ngẫu nhiên.
- Nếu dùng MySQL nội bộ của Docker Compose, đặt `DB_HOST=db`, `DB_PORT=3306`, `DB_SSL_MODE=DISABLED`. Nếu dùng MySQL cloud yêu cầu SSL, dùng `DB_SSL_MODE=REQUIRED`.
- Frontend lấy địa chỉ API từ `VITE_API_URL`. Nếu frontend và API được phục vụ cùng domain, có thể dùng `/api/`; nếu khác domain, đặt URL HTTPS đầy đủ trước khi `npm run build`.

Kiểm tra frontend trước khi bàn giao:

```powershell
cd front-end
npm run lint
npm run test
npm run build
```

Kiểm tra backend và áp dụng migration trước khi bàn giao database:

```powershell
cd back-end
python manage.py migrate
python manage.py check --deploy
python manage.py test --keepdb
```

---

Tương tác của các tác nhân user, website, admin với nhau:

* user sử dụng website:
  - Người dùng có thể dừng/phát nhạc khi nghe, có thể chọn lặp lại 1 bài hát, có thể chọn phát ngẫu nhiên, có thể chọn phát bài hát tiếp theo/trước đó.
  - Người dùng có thể tìm kiếm theo tên bài hát, theo nghệ sĩ, theo album, theo playlist.
  - Người dùng có thể đăng ký, đăng nhập, đăng xuất.
  - Người dùng có thể yêu thích bài hát.
  - Người dùng có thể tạo, sửa tên playlist; thêm, sửa, xóa bài hát trong playlist và xóa playlist.
  - Người dùng có thể xem thông tin cá nhân, chỉnh sửa thông tin cá nhân.
  - Người dùng có thể xem lịch sử nghe nhạc.
  - Người dùng có thể xem thông tin nghệ sĩ, bài hát, album, playlist.
  - Người dùng có thể xem danh sách bài hát theo thể loại, quốc gia, năm phát hành.
  - Người dùng có thể xem danh sách bài hát theo nghệ sĩ, album, playlist.
* website tương tác với user:
  - website hiển thị danh sách bài hát, album, playlist.
  - website hiển thị thông tin bài hát, album, playlist.
  - website hiển thị thông tin nghệ sĩ, bài hát, album, playlist.
  - website hiển thị các danh sách khám phá theo thể loại và lượt nghe.
  - website hiển thị trang `For You` gợi ý bài hát dựa trên lịch sử nghe và bài hát yêu thích.
* admin tương tác với website:
  - Admin có thể thêm, sửa, xóa và đặt trạng thái hiển thị bài hát, album trong hệ thống.
  - Admin có thể quản lý thông tin người dùng (xem danh sách, khóa/mở khóa tài khoản, xóa tài khoản).
  - Admin có thể xem thống kê hệ thống (lượt nghe, bài hát trending, số lượng user).
  - Admin có thể quản lý phân quyền tài khoản.

Các chức năng dự kiến phát triển trong tương lai, không thuộc phạm vi bàn giao hiện tại:

- User upload nhạc và quy trình admin duyệt nội dung do user đóng góp.
- Chat hỗ trợ giữa Admin và User.
- Báo cáo vi phạm nội dung.
- Bình luận, theo dõi, chia sẻ mạng xã hội và các tương tác cộng đồng nâng cao.
- Bước khảo sát/lựa chọn nghệ sĩ, thể loại yêu thích ban đầu và thuật toán gợi ý nâng cao cho trang `For You`.
