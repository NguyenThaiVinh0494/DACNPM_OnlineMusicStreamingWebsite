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

### Cấu hình môi trường

Trước khi chạy lần đầu, tạo file cấu hình local từ các mẫu và điền thông tin thực tế:

```powershell
Copy-Item back-end\.env.example back-end\.env
Copy-Item front-end\.env.example front-end\.env
```

- Backend bắt buộc có `SECRET_KEY`; không commit giá trị thật lên Git.
- Local development dùng `DEBUG=True` và whitelist origin của Vite trong `CORS_ALLOWED_ORIGINS`.
- Production phải đặt `DEBUG=False`, `ALLOWED_HOSTS` theo domain API, `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` theo domain frontend và một `SECRET_KEY` dài, ngẫu nhiên.
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

### Dừng Server

Trong Terminal đang chạy server, nhấn tổ hợp phím:

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60"></div><div class="flex flex-row gap-2 justify-end"></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">Ctrl + C</span></div></div></div></div></div></div></pre>

Terminal sẽ hiện thông báo và trả về dấu nhắc lệnh `(venv) PS D:\...>`

---

### Khởi động lại Server

Sau khi đã dừng, gõ lệnh:

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">powershell</div><div class="flex flex-row gap-2 justify-end"></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">.\venv\Scripts\</span><span class="mtk16">python.exe</span><span class="mtk1"> manage.py runserver</span></div></div></div></div></div></div></pre>

---

### Mẹo hữu ích 💡

**Dùng phím mũi tên ↑ để gọi lại lệnh cũ:** Thay vì gõ lại toàn bộ lệnh, bạn chỉ cần nhấn phím **↑ (mũi tên lên)** trong Terminal, nó sẽ tự điền lại lệnh đã chạy trước đó.

**Chạy server ở port khác** (nếu port 8000 bị chiếm):

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">powershell</div><div class="flex flex-row gap-2 justify-end"></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">.\venv\Scripts\</span><span class="mtk16">python.exe</span><span class="mtk1"> manage.py runserver </span><span class="mtk7">8001</span></div></div></div></div></div></div></pre>

**Kích hoạt môi trường ảo trước khi chạy** (nếu mở Terminal mới):

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">powershell</div><div class="flex flex-row gap-2 justify-end"></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">.\venv\Scripts\activate</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1">python manage.py runserver</span></div></div></div></div></div></div></pre>

*(Sau khi activate, bạn có thể dùng `python` ngắn gọn thay vì phải gõ đường dẫn dài)*

Chúng ta của hiện tại:

https://res.cloudinary.com/dzpsypij2/image/upload/v1778727247/music_streaming/images/ne3yaikf5u8leewsgbkn.jpg

https://res.cloudinary.com/dzpsypij2/video/upload/v1778727956/music_streaming/audio/wojdmidlnerzetdshdgk.mp3

Chạy ngay đi

https://res.cloudinary.com/dzpsypij2/image/upload/v1778727376/music_streaming/images/b2xg1kid9zppe5zfqlxt.jpg

https://res.cloudinary.com/dzpsypij2/video/upload/v1778728002/music_streaming/audio/ljgetgewj1wgslczqkb4.mp3

python generate_lrc.py --audio https://res.cloudinary.com/dzpsypij2/video/upload/v1778727956/music_streaming/audio/wojdmidlnerzetdshdgk.mp3 --lyrics D:\DACNPM_OnlineMusicStreamingWebsite\tool\lrc_generator\song_components\ChungTaCuaHienTai.txt
