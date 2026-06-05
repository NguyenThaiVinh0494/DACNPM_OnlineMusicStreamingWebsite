### File SRS

##### MỤC LỤC

###### I. Giới thiệu

1.1 Tóm tắt dự án.

1.2 Phạm vi của dự án.

1.3 Quy ước về tài liệu.

1.4 Bảng từ điển thuật ngữ (Glossary).

###### II. Mô tả tổng quan.

2.1. Quan điểm về sản phẩm.

2.2 Đặc trưng của sản phẩm.

2.3 Người dùng và đặc trưng.

2.4 Yêu cầu của người dùng.

2.5 Kiến trúc tổng quan của phần mềm.

2.6 Sơ đồ Usecase.

2.7 Luồng màn hình (Screen flow)

2.8 Các yêu cầu khác của hệ thống

---

## I. Giới thiệu

### 1.1 Tóm tắt dự án

Web nghe nhạc được xây dựng nhằm mục đích mang đến cho người dùng một nền tảng giải trí âm nhạc trực tuyến tiện lợi, nơi họ có thể khám phá và thưởng thức những bài hát yêu thích mọi lúc, mọi nơi.

Chúng tôi cam kết mang lại một trải nghiệm âm nhạc chất lượng cao, thân thiện và dễ sử dụng, nơi người dùng có thể:

* **Khám phá âm nhạc đa dạng:**

  Tìm kiếm và thưởng thức hàng triệu bài hát thuộc nhiều thể loại khác nhau, từ nhạc trẻ, pop, rock đến EDM và nhạc quốc tế.
* **Trải nghiệm nghe nhạc chất lượng:**

  Cung cấp âm thanh chất lượng cao, giao diện trực quan và khả năng phát nhạc mượt mà trên nhiều thiết bị.
* **Tạo playlist cá nhân:**

  Người dùng có thể tự tạo và quản lý danh sách phát theo sở thích.
* **Khám phá nội dung:**

  Người dùng có thể duyệt các nội dung công khai theo thể loại, album và lượt nghe.
* **Quản lý thư viện cá nhân:**

  Cho phép người dùng yêu thích bài hát, lưu lịch sử nghe và duy trì playlist riêng.

Với mục tiêu này, chúng tôi mong muốn trở thành nền tảng âm nhạc trực tuyến hàng đầu, giúp bạn tận hưởng và khám phá thế giới âm nhạc theo cách riêng của mình.

### 1.2 Phạm vi của dự án

#### Điều chỉnh phạm vi bàn giao cuối cùng

Do giới hạn thời gian thực hiện, phiên bản bàn giao hiện tại tập trung vào các chức năng cốt lõi đã triển khai và kiểm thử:

* Đăng ký, đăng nhập bằng tài khoản chuẩn (username/password), cập nhật hồ sơ và ảnh đại diện.
* Duyệt thư viện công khai, tìm kiếm, phát nhạc, yêu thích, lịch sử nghe và playlist cá nhân.
* Trang `For You` gợi ý nội dung công khai từ lịch sử nghe và bài hát yêu thích đã lưu.
* Quản trị viên quản lý tài khoản, bài hát, album, nghệ sĩ, thể loại, trạng thái công khai/chờ hiển thị và thống kê cơ bản.
* Bảo vệ nội dung chưa công khai, phân quyền admin và cấu hình triển khai an toàn.

Các chức năng sau **không thuộc phạm vi nghiệm thu phiên bản hiện tại** và được chuyển sang mục phát triển tương lai:

* Đăng nhập thông qua bên thứ ba (Google OAuth2).
* Xác thực OTP bằng Email và quy trình Quên mật khẩu/Khôi phục mật khẩu qua Email.
* User upload nhạc; quy trình duyệt/từ chối nội dung do user đóng góp.
* Chat hỗ trợ Admin - User.
* Báo cáo (Report) nội dung.
* Bình luận, theo dõi, chia sẻ mạng xã hội và tương tác cộng đồng nâng cao.
* Bước khảo sát/lựa chọn nghệ sĩ, thể loại yêu thích ban đầu và thuật toán gợi ý nâng cao cho `For You`.

Các sơ đồ hoặc mô tả chi tiết phía dưới có nhắc đến những chức năng này được giữ làm ý tưởng thiết kế mở rộng, không dùng làm tiêu chí đánh giá phiên bản bàn giao.

**Phạm vi về dịch vụ:**

**Quản lý người dùng**

* Quản lý tài khoản, phân quyền người dùng và admin
* Quản lý trạng thái và phân quyền tài khoản

**Quản lý nội dung (Music Management)**

* Quản lý bài hát, album, nghệ sĩ
* Upload, chỉnh sửa, xóa nội dung âm nhạc
* Kiểm duyệt nội dung trước khi hiển thị

---

**Xác thực (Auth)**

* Cho phép người dùng đăng ký, đăng nhập, quên mật khẩu và đăng xuất
* Sử dụng JSON Web Token (JWT) để xác thực
* Xác minh tài khoản qua email

---

**Nghe nhạc (Music Streaming)**

* Phát nhạc trực tuyến với chất lượng cao
* Hỗ trợ phát nhạc nền, tua, lặp, shuffle
* Tối ưu trải nghiệm nghe trên nhiều thiết bị

---

**Khám phá nội dung (Discovery)**

* Hiển thị nội dung công khai theo thể loại, lượt nghe và album
* Hiển thị “Trending” và “Top chart”
* Hiển thị `For You` dựa trên lịch sử nghe và bài hát yêu thích; không yêu cầu người dùng chọn sở thích ban đầu

---

**Playlist (Danh sách phát)**

* Cho phép người dùng tạo, chỉnh sửa và xóa playlist cá nhân
* Thêm/xóa bài hát vào playlist

---

**Tìm kiếm (Search)**

* Tìm kiếm bài hát, nghệ sĩ, album
* Bộ lọc theo thể loại, xu hướng, độ phổ biến

---

**Hồ sơ cá nhân (Profile)**

* Cập nhật thông tin cá nhân, ảnh đại diện
* Hiển thị playlist, bài hát yêu thích

---

**Tương tác (Interaction)**

* Like, yêu thích bài hát và lưu lịch sử nghe

---

**Phạm vi về khách hàng:**

* Người dùng cá nhân có nhu cầu nghe nhạc, giải trí
* Quản trị viên hệ thống (admin) quản lý nội dung và người dùng

**Phạm vi về nền tảng**

**Frontend:**

* Ngôn ngữ/Thư viện: ReactJS
* CSS Framework: Tailwind CSS
* HTTP Client: Axios

**Backend:**

* Ngôn ngữ: Python
* Framework: Django
* API: Django REST Framework (RESTful API)
* Xác thực: JWT (JSON Web Token)

**Cơ sở dữ liệu:**

* Hệ quản trị CSDL: MySQL
* ORM: Django ORM

**Lưu trữ:**

* Media Storage: Cloudinary(audio, image)

### 1.3 Quy ước về tài liệu

Tài liệu được soạn thảo theo định dạng:

* Phông chữ: Times New Roman, cỡ chữ 12pt.
* Tuân theo chuẩn **IEEE** SRS (Software Requirements Specification).
* Các tiêu đề được bôi đậm để dễ phân biệt giữa các phần nội dung.

### 1.4 BẢNG TỪ ĐIỂN THUẬT NGỮ (GLOSSARY)

| STT | Thuật Ngữ | Định Nghĩa | Ví Dụ/Ghi Chú |
| :-: | :---------- | :------------ | :-------------- |
|  1  | SRS | Tài liệu đặc tả yêu cầu phần mềm, mô tả phạm vi, chức năng, yêu cầu và ràng buộc của hệ thống. | Software Requirements Specification. |
|  2  | Người dùng | Tài khoản sử dụng website để nghe nhạc, tìm kiếm, yêu thích bài hát, quản lý playlist và lịch sử nghe. | Còn gọi là User. |
|  3  | Quản trị viên | Tài khoản có quyền truy cập khu vực quản trị để quản lý người dùng, kho nhạc, trạng thái nội dung và thống kê. | Còn gọi là Admin hoặc Administrator. |
|  4  | Hệ thống | Toàn bộ website nghe nhạc trực tuyến, bao gồm frontend, backend, cơ sở dữ liệu và dịch vụ lưu trữ media. | Website nghe nhạc trực tuyến. |
|  5  | Frontend | Phần giao diện chạy trên trình duyệt để người dùng tương tác với hệ thống. | ReactJS, Tailwind CSS. |
|  6  | Backend | Phần máy chủ xử lý nghiệp vụ, xác thực, truy vấn dữ liệu và cung cấp API cho frontend. | Django, Django REST Framework. |
|  7  | API | Giao diện lập trình cho phép frontend gửi yêu cầu và nhận dữ liệu từ backend. | Lấy danh sách bài hát qua API. |
|  8  | RESTful API | Kiểu thiết kế API sử dụng các phương thức HTTP để thao tác với tài nguyên của hệ thống. | GET, POST, PUT/PATCH, DELETE. |
|  9  | JWT | Chuỗi token dùng để xác thực phiên đăng nhập và phân quyền truy cập API. | JSON Web Token. |
| 10 | CSDL | Nơi lưu trữ dữ liệu của hệ thống như tài khoản, bài hát, album, playlist, lịch sử nghe và trạng thái nội dung. | Database/MySQL. |
| 11 | ORM | Cơ chế ánh xạ dữ liệu giữa mã nguồn và bảng trong cơ sở dữ liệu. | Django ORM ánh xạ model sang bảng MySQL. |
| 12 | CMS | Khu vực quản trị nội dung cho phép Admin quản lý kho nhạc, người dùng và trạng thái hiển thị. | Content Management System. |
| 13 | Dashboard | Màn hình tổng quan trong khu vực Admin, hiển thị nhanh các chỉ số về người dùng, nội dung và hoạt động hệ thống. | Dashboard Quản trị Tổng hợp. |
| 14 | Playlist | Tập hợp các bài hát được người dùng hoặc Admin tạo để phát theo một chủ đề hoặc sở thích nhất định. | Playlist cá nhân, playlist hệ thống. |
| 15 | Album | Tập hợp các bài hát thuộc cùng một sản phẩm âm nhạc, nghệ sĩ hoặc chủ đề phát hành. | Album của một nghệ sĩ. |
| 16 | Nghệ sĩ | Chủ thể biểu diễn hoặc sáng tác bài hát, được dùng để phân loại và tìm kiếm nội dung âm nhạc. | Artist. |
| 17 | Thể loại | Nhóm phân loại âm nhạc theo phong cách hoặc đặc điểm nội dung. | Pop, Rock, EDM, Rap, Acoustic. |
| 18 | Streaming | Cơ chế phát nhạc qua mạng mà người dùng không cần tải toàn bộ tệp âm thanh về thiết bị. | Phát trực tuyến bài hát. |
| 19 | Player | Thành phần giao diện cho phép phát, tạm dừng, tua, lặp lại, phát ngẫu nhiên và chuyển bài hát. | Audio Player. |
| 20 | Lyrics | Nội dung lời nhạc được hiển thị cùng màn hình phát nhạc, có thể đồng bộ theo thời gian nếu hệ thống hỗ trợ. | Lời bài hát trên màn hình phát nhạc. |
| 21 | Yêu thích | Hành động người dùng lưu bài hát vào danh sách yêu thích để dễ tìm lại và phục vụ gợi ý nội dung. | Like/Favorite. |
| 22 | Lịch sử nghe | Dữ liệu ghi nhận các bài hát người dùng đã phát, dùng cho cá nhân hóa và gợi ý nhạc. | Listening History. |
| 23 | Dành cho bạn | Màn hình gợi ý bài hát công khai dựa trên lịch sử nghe và danh sách yêu thích của người dùng. | For You. |
| 24 | Khám phá | Màn hình tổng hợp nội dung công khai như nhạc mới, bài hát nghe nhiều, album, playlist và thể loại. | Discover. |
| 25 | Nội dung công khai | Bài hát, album hoặc playlist đã được phép hiển thị cho người dùng bình thường. | Public Content. |
| 26 | Chờ hiển thị | Trạng thái nội dung chưa được công khai hoặc đang chờ Admin xử lý trước khi xuất hiện với người dùng. | Pending. |
| 27 | CRUD | Nhóm thao tác cơ bản để thêm, xem, sửa và xóa dữ liệu trong hệ thống. | Create, Read, Update, Delete. |
| 28 | UI | Giao diện người dùng, bao gồm màn hình, nút bấm, biểu mẫu, bảng dữ liệu và các thành phần tương tác. | User Interface. |
| 29 | UX | Trải nghiệm tổng thể của người dùng khi thao tác với website. | User Experience. |
| 30 | CI/CD | Quy trình tự động kiểm tra, tích hợp, build và triển khai mã nguồn khi có thay đổi. | Continuous Integration / Continuous Deployment. |
| 31 | Docker | Công cụ đóng gói ứng dụng thành container để triển khai nhất quán trên nhiều môi trường. | Dùng cho triển khai backend/frontend. |
| 32 | Pull Request | Yêu cầu hợp nhất mã nguồn từ nhánh phát triển vào nhánh chính sau khi được kiểm tra và nghiệm thu. | PR trên GitHub/GitLab. |

## II. Mô tả tổng quan

### 2.1 Quan điểm về sản phẩm

Website nghe nhạc là một sản phẩm phần mềm web được phát triển trong khuôn khổ học phần, nhằm xây dựng một nền tảng nghe nhạc trực tuyến cho phép người dùng tìm kiếm, thưởng thức và quản lý nội dung âm nhạc một cách thuận tiện.

Sản phẩm được xây dựng  **từ đầu về mặt kỹ thuật (from scratch)** , không kế thừa mã nguồn có sẵn, nhưng **tham khảo mô hình và chức năng** từ các nền tảng nghe nhạc phổ biến như **Nhaccuatui**, **Zing MP3** và **Spotify**.

Hệ thống hướng tới:

* **Cung cấp nền tảng nghe nhạc trực tuyến tiện lợi** , cho phép người dùng truy cập và thưởng thức âm nhạc mọi lúc, mọi nơi.
* **Cá nhân hóa trải nghiệm người dùng** , thông qua việc đề xuất bài hát, playlist dựa trên hành vi và sở thích.
* **Đảm bảo tính ổn định và bảo mật** , với cơ chế xác thực tài khoản, mã hóa dữ liệu và quản lý truy cập.
* **Xây dựng hệ thống dễ mở rộng** , phục vụ cho việc nâng cấp và tích hợp trong tương lai.

Hiện tại, hệ thống hoạt động độc lập. Tuy nhiên, kiến trúc RESTful API được thiết kế linh hoạt, cho phép tích hợp với:

* Ứng dụng mobile sử dụng chung backend
* Hệ thống lưu trữ và phân phối media (CDN, streaming server)
* Hệ thống thanh toán (cho tài khoản premium nếu mở rộng)

### 2.2 Đặc trưng của sản phẩm

Bảng: Các tính năng chính của Website nghe nhạc

| #  | Nhóm Tính Năng         | Mô Tả Ngắn                            | Tác Nhân | Ưu Tiên       | Phiên Bản |
| -- | ------------------------- | ---------------------------------------- | ---------- | --------------- | ----------- |
| 1  | Đăng ký/Đăng nhập   | Đăng ký trực tiếp, đăng nhập JWT | User       | Cao             | 1.0         |
| 2  | Hồ sơ cá nhân         | Cập nhật thông tin, avatar            | User       | Cao             | 1.0         |
| 3  | Nghe nhạc                | Phát nhạc, tua, shuffle, repeat        | User       | Cao             | 1.0         |
| 4  | Playlist                  | Tạo, sửa, xóa playlist                | User       | Cao             | 1.0         |
| 5  | Yêu thích               | Like/lưu bài hát                      | User       | Cao             | 1.0         |
| 6  | Bình luận               | Phát triển tương lai                 | User       | Ngoài phạm vi | Sau 1.0     |
| 7  | Tìm kiếm                | Tìm bài hát, nghệ sĩ, album         | User       | Cao             | 1.0         |
| 8  | Gợi ý nhạc `For You` | Dựa trên lịch sử nghe/yêu thích    | User       | Trung bình     | 1.0         |
| 9  | Quản lý nội dung       | CRUD bài hát, album                    | Admin      | Cao             | 1.0         |
| 10 | Upload nhạc              | Thêm nội dung mới                     | Admin      | Cao             | 1.0         |
| 11 | Quên mật khẩu          | Phát triển tương lai                 | User       | Ngoài phạm vi | Sau 1.0     |
| 12 | Thống kê                | Lượt nghe, người dùng               | Admin      | Trung bình     | 1.0         |
| 13 | Quản lý tài khoản     | Khoá/mở user                           | Admin      | Cao             | 1.0         |
| 14 | Thông báo               | Phát triển tương lai                 | User       | Ngoài phạm vi | Sau 1.0     |
| 15 | Báo cáo nội dung       | Phát triển tương lai                 | User       | Ngoài phạm vi | Sau 1.0     |

Ma trận tính năng theo người dùng

| Tính năng               | User             | Admin |
| ------------------------- | ---------------- | ----- |
| Đăng ký / Đăng nhập | ✓               | ✓    |
| Google login              | ✗ (Tương lai) | ✗    |
| Xác minh email           | ✗ (Tương lai) | ✗    |
| Quên mật khẩu          | ✗ (Tương lai) | ✗    |
| Hồ sơ cá nhân         | ✓               | ✗    |
| Nghe nhạc                | ✓               | ✗    |
| Playlist                  | ✓               | ✗    |
| Like bài hát            | ✓               | ✗    |
| Tìm kiếm                | ✓               | ✓    |
| Gợi ý `For You`       | ✓               | ✗    |
| Quản lý user            | ✗               | ✓    |
| Quản lý nhạc           | ✗               | ✓    |
| Upload nhạc              | ✗               | ✓    |
| Thống kê                | ✗               | ✓    |

### 2.3 Người dùng và đặc trưng

Hệ thống phục vụ hai nhóm chính:

**Người dùng (User)**

* Là người sử dụng hệ thống để nghe nhạc, tìm kiếm và quản lý nội dung cá nhân
* Mục tiêu: giải trí, khám phá âm nhạc
* Yêu cầu: giao diện đơn giản, dễ dùng, chạy mượt

**Quản trị viên (Admin)**

* Là người vận hành hệ thống
* Mục tiêu: quản lý nội dung, người dùng, đảm bảo hệ thống ổn định
* Yêu cầu: phân quyền rõ ràng, bảo mật cao

**Bảng đặc trưng người dùng**

| Vai trò        | Mô tả                   | Mục tiêu   | Yêu cầu | Tần suất        |
| --------------- | ------------------------- | ------------ | --------- | ----------------- |
| **User**  | Nghe nhạc, tạo playlist | Giải trí   | Dễ dùng | Cao               |
| **Admin** | Quản lý hệ thống      | Kiểm duyệt | Bảo mật | Trung bình - cao |

**Ma trận đặc trưng kỹ thuật**

| Tiêu chí                       | User              | Admin             |
| -------------------------------- | ----------------- | ----------------- |
| **Trình độ kỹ thuất** | Thấp             | Trung bình - cao |
| **Thiết bị**             | Mobile / Desktop  | Desktop           |
| **Băng thông**           | Không ổn định | Ổn định        |
| **Đào tạo**             | Không cần       | Cơ bản          |

### 2.4 Yêu cầu của người dùng

Trong phần này, các yêu cầu của người dùng đối với hệ thống được chia thành hai nhóm chính: Yêu cầu chức năng (Functional Requirements) và Yêu cầu phi chức năng (Non-Functional Requirements).

#### 2.4.1 Yêu cầu chức năng

Dựa trên đặc trưng tương tác, hệ thống cần đáp ứng các tính năng sau:

##### A. Sơ đồ phân rã chức năng (FDD)

```mermaid
graph TD
    Sys["Hệ thống Nghe Nhạc"] --> U["Chức năng Người Dùng"]
    Sys --> A["Chức năng Quản Trị Viên"]
    Sys --> SysProc["Tiến trình Hệ Thống (Tự động)"]

    U --> U1["Quản lý tài khoản"]
    U --> U2["Trải nghiệm nghe nhạc"]
    U --> U3["Tìm kiếm & Khám phá"]
    U --> U4["Tương tác âm nhạc"]
    U --> U5["Quản lý Playlist"]

    A --> A1["Quản lý nội dung chung"]
    A --> A2["Quản lý trạng thái nội dung"]
    A --> A3["Quản lý danh sách người dùng"]
    A --> A4["Thống kê"]
    A --> A5["Cấu hình hệ thống"]

    SysProc --> W1["Xử lý giao diện & Hiển thị"]
```

##### B. Mô tả chi tiết hệ thống

**1. Đối với Người dùng (User):**

- **Quản lý tài khoản:**
  - Có khả năng đăng ký, đăng nhập, đăng xuất.
  - Xem và chỉnh sửa thông tin cá nhân.
- **Trải nghiệm nghe nhạc:**
  - Chọn phát / dừng nhạc.
  - Chọn lặp lại một bài hát, phát ngẫu nhiên, chuyển tiếp hoặc lùi bài hát.
- **Tìm kiếm & Khám phá:**
  - Tìm kiếm âm nhạc theo tên bài hát, nghệ sĩ, album hoặc playlist.
  - Xem danh sách và thông tin chi tiết bài hát, nghệ sĩ, album, playlist.
- **Tương tác âm nhạc:**
  - Có thể thích (like) bài hát.
  - Xem lại lịch sử nghe nhạc.
- **Quản lý Playlist (Danh sách phát):**
  - Tạo mới, chỉnh sửa tên, xóa playlist.
  - Thêm hoặc xóa bài hát khỏi playlist.

**2. Đối với Quản trị viên (Admin):**

- **Quản lý nội dung:**
  - Thiết lập trạng thái công khai hoặc chờ hiển thị của bài hát và album.
  - Có thể thêm, sửa, xóa các bài hát, album, playlist vào hệ thống chung.
- **Quản lý Người dùng:**
  - Xem danh sách người dùng
  - Khóa / mở khóa hoặc xóa tài khoản khi cần thiết.
- **Thống kê:**
  - Xem thống kê hệ thống bao gồm lượt nghe, các bài hát thịnh hành, tổng số lượng người dùng.
- **Cấu hình hệ thống:**
  - Quản lý phân quyền, thực hiện các cài đặt chung cho hệ thống.

**3. Các tiến trình tự động của hệ thống (System Processes):**

- **Xử lý và hiển thị thông tin:** Phản hồi truy vấn, phân phát dữ liệu bài hát, album, playlist, nghệ sĩ và hiển thị trực quan đến giao diện người dùng.

##### C. Bảng mô tả yêu cầu chức năng

| Mã YC | Tên chức năng / Yêu cầu        | Tác nhân       | Mô tả chi tiết chức năng                                                                                                         |
| :----- | :---------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| FR01   | Quản lý tài khoản               | Người dùng    | Đăng ký, đăng nhập, đăng xuất, xem và chỉnh sửa thông tin cá nhân.                                                     |
| FR02   | Điều khiển phát nhạc           | Người dùng    | Phát, dừng nhạc, lặp lại, phát ngẫu nhiên, chuyển tiếp, lùi bài.                                                          |
| FR03   | Tìm kiếm và khám phá bài hát | Người dùng    | Tìm kiếm bài hát theo chủ đề, nghệ sĩ, album, playlist.                                                                      |
| FR04   | Tương tác bài hát              | Người dùng    | Thích bài hát và xem lại lịch sử nghe nhạc.                                                                                   |
| FR05   | Quản lý Playlist                  | Người dùng    | Tạo, sửa tên, xóa playlist. Thêm, sửa, xóa bài hát khỏi playlist.                                                           |
| FR06   | Upload âm nhạc của user          | Người dùng    | Phát triển tương lai, không thuộc phạm vi bàn giao hiện tại.                                                                |
| FR07   | Xem thông tin và điều hướng   | Người dùng    | Cập nhật và xem thông tin bài hát, danh sách, nghệ sĩ đầy đủ, dễ chịu.                                                |
| FR08   | Nhận gợi ý nhạc `For You`     | Người dùng    | Hiển thị bài hát công khai dựa trên lịch sử nghe/yêu thích; không có bước chọn nghệ sĩ hoặc thể loại đầu vào. |
| FR09   | Chat và nhận hỗ trợ             | Người dùng    | Phát triển tương lai, không thuộc phạm vi bàn giao hiện tại.                                                                |
| FR10   | Quản lý nội dung chung           | Quản trị viên | Thêm, sửa, xóa bài gốc, album, playlist vào dữ liệu của hệ thống.                                                          |
| FR11   | Trạng thái hiển thị nội dung   | Quản trị viên | Quản lý bài hát/album công khai hoặc đang chờ hiển thị trong kho admin.                                                     |
| FR12   | Quản lý người dùng             | Quản trị viên | Xem danh sách tổng quan, khóa hoặc mở khóa tài khoản vi phạm.                                                                |
| FR13   | Thống kê số liệu                | Quản trị viên | Xem top bài hát, lượt stream, và số lượng User mới đăng ký.                                                               |
| FR14   | Cấu hình hệ thống               | Quản trị viên | Phân quyền tính năng, giới hạn nội dung, cài đặt server gốc.                                                               |
| FR15   | Hỗ trợ và xử lý report         | Quản trị viên | Phát triển tương lai, không thuộc phạm vi bàn giao hiện tại.                                                                |

#### 2.4.2 Yêu cầu phi chức năng

Bên cạnh các yếu tố chức năng, hệ thống cần đảm bảo những tiêu chí về chất lượng dịch vụ sau đây:

- **Tính khả dụng (Usability):**
  - Giao diện của trang web cần thân thiện, hiện đại, dễ thao tác sử dụng, phù hợp hiển thị trên Desktop.
- **Tính hiệu năng (Performance):**
  - Hệ thống tải trang và tải dữ liệu (đặc biệt là streaming nhạc) nhanh chóng, mượt mà, độ trễ thấp để đem lại trải nghiệm nghe nhạc không bị giật lag (buffer).
  - Khả năng xử lý đồng thời số lượng truy cập lớn mà vẫn duy trì ổn định.
- **Tính bảo mật (Security):**
  - Mã hóa mật khẩu và các thông tin dữ liệu nhạy cảm của người dùng.
  - Xác thực và phân quyền đúng đối tượng (chỉ admin mới có quyền truy cập trang quản trị và thao tác dữ liệu dùng chung).
  - Phòng chống các cuộc tấn công phổ biến trên web như SQL Injection, XSS, DDoS.
- **Tính độ tin cậy (Reliability & Availability):**
  - Hệ thống phải hoạt động ổn định 24/7, tỷ lệ sẵn sàng cao,
  - Sao lưu dữ liệu thường xuyên để hạn chế rủi ro mất mát dữ liệu,
  - Thiết kế hạn chế thời gian downtime ở mức tối thiểu.
- **Tính mở rộng (Scalability):**
  - Mã nguồn hệ thống và cơ sở dữ liệu phải được thiết kế tốt (clean architecture)
  - Dễ dàng mở rộng tính năng và nâng cấp server khi hệ thống tăng trưởng về lượng bài hát lẫn lượng CCU lớn trong tương lai.

---

### 2.5 Kiến trúc tổng quan của phần mềm

Hệ thống Website Nghe Nhạc Trực Tuyến được thiết kế dựa trên mô hình kiến trúc **Client - Server (Khách - Chủ)** kết hợp kết cấu phân tầng (3-Tier Architecture), nhằm đảm bảo tính độc lập, dễ bảo trì và khả năng mở rộng linh hoạt. Việc lựa chọn kiến trúc này cho phép nhóm phát triển độc lập và chuyên sâu vào từng phần của hệ thống.

#### 2.5.1 Sơ đồ Kiến trúc Tổng quan

```mermaid
graph TD
    subgraph Presentation_Tier_Client
        UI["Trình duyệt Web (ReactJS + TailwindCSS)"]
        Player["Trình phát nhạc - Audio Player"]
    end

    subgraph API_Gateway
        HTTP["HTTP RESTful API (Axios/Fetch)"]
    end

    subgraph Application_Tier_Server
        Django["Django REST Framework (Python)"]
        Auth["Dịch vụ Xác thực - JWT"]
        StreamSrc["Dịch vụ Streaming Media"]
        Bussiness["Logic Nghiệp vụ (Core Services)"]
    end

    subgraph Data_Tier
        DB["Cơ sở dữ liệu quan hệ (MySQL)"]
        Storage["Lưu trữ Media (Cloudinary)"]
    end

    Django --- Auth
    Django --- StreamSrc
    Django --- Bussiness

    UI --> API_Gateway
    Player --> API_Gateway

    API_Gateway --> Django

    Django --> DB
    StreamSrc --> Storage
```

#### 2.5.2 Mô tả chi tiết các tầng kiến trúc

**a. Tầng Giao diện (Presentation Tier / Client):**
Tầng này chịu trách nhiệm hiển thị và tương tác trực tiếp với người dùng cuối, được xây dựng bằng thư viện **ReactJS** kết hợp framework styling **TailwindCSS**.

- **Đặc điểm kiến trúc:** Xây dựng dưới dạng Single Page Application (SPA).
- **Chức năng chính:**
  - Đóng vai trò là điểm tiếp xúc trực tiếp với người dùng và quản trị viên trên trình duyệt web (Desktop/Mobile).
  - Sử dụng **React Components** kết hợp tiện ích của **TailwindCSS** để xây dựng giao diện đồ họa đẹp mắt, chuẩn UI/UX và hoàn toàn linh hoạt (Responsive) cho cả Web Player và Admin Dashboard.
  - Quản lý trạng thái ứng dụng (State Management): Đảm bảo trình phát nhạc (Audio Player) hoạt động liên tục (Persistent Player), không bị ngắt quãng khi người dùng chuyển đổi giữa các trang chức năng.
  - Giao tiếp với Server thông qua các yêu cầu HTTP (API Requests) bằng Axios hoặc Fetch API, tiếp nhận luồng stream dữ liệu tốc độ cao.

**b. Tầng Ứng dụng & Xử lý (Application Tier / Server):**
Đóng vai trò là trung tâm xử lý nghiệp vụ, nhận và phân giải các yêu cầu, được xây dựng dựa trên framework **Django (Python)**.

- **Đặc điểm kiến trúc:** Sử dụng **Django REST Framework (DRF)** để cung cấp các API RESTful cho ứng dụng React.
- **Chức năng chính:**
  - **Xử lý nghiệp vụ (Business Logic):** Thực hiện thuật toán tìm kiếm, phân tích xu hướng nghe nhạc, quản trị nội dung và xử lý tương tác (Like, tạo Playlist, duyệt bài hát).
  - **Xác thực và Bảo mật:** Kiểm tra và quản lý định danh người dùng qua cơ chế **JWT (JSON Web Token)**, đảm bảo phân quyền chặt chẽ giữa User thông thường và Admin.
  - **Tích hợp Media:** Điều phối tải lên/tải về và truyền tải file âm thanh (Streaming) xuống trực tiếp cho Client sử dụng thay vì buộc thiết bị tải cục bộ.
  - **Quản trị hệ thống:** Xây dựng giao diện quản trị nhanh chóng để kiểm soát dữ liệu dựa trên tính năng **Django Admin**.

**c. Tầng Cơ sở dữ liệu & Lưu trữ (Data Tier):**
Chịu trách nhiệm lưu trữ an toàn, tin cậy dữ liệu của hệ thống, chia làm 2 kho dữ liệu chuyên biệt để tối ưu dữ liệu và băng thông:

- **Hệ quản trị CSDL quan hệ (MySQL):**
  - Ghi nhận và lưu trữ cấu trúc metadata văn bản: thông tin tài khoản người dùng, chi tiết bài hát (tên, ca sĩ, album, thể loại), lời bài, quan hệ giữa playlist và bài hát.
  - Sử dụng **Django ORM** để quản lý, truy xuất dữ liệu an toàn, phòng ngừa lỗi SQL Injection.
- **Dịch vụ lưu trữ Media chuyên dụng (Cloudinary):**
  - Kho lưu trữ vật lý đám mây (Object Storage) chứa các tệp tin phi cấu trúc có dung lượng lớn như file âm thanh (.mp3, .m4a) và hình ảnh (avatar, ảnh bìa nghệ sĩ, album).
  - Giải phóng áp lực băng thông máy chủ chính, cung cấp URL bảo mật cho ReactJS truy xuất nạp thẳng vào Audio Player.

#### 2.5.3 Luồng tương tác tiêu biểu của hệ thống (System Interaction Flow)

1. **Gửi yêu cầu:** Người dùng nhấn nút "Phát nhạc" trên giao diện **ReactJS**. Client gửi HTTP Request API chứa mã bài hát (Song ID) và Token người dùng (nếu có) tới **Django Server**.
2. **Xác thực & Xử lý:** Django tiếp nhận, xác minh quyền truy cập thông qua **JWT**. Nếu hợp lệ, chuyển qua xử lý logic truy vấn bài hát trong **MySQL** bằng ORM.
3. **Truy xuất dữ liệu:** Server lấy URL nguồn của file audio được lưu trữ bên phía **Cloudinary**, kết hợp các metadata (tên bài, tác giả, ảnh bìa) từ cơ sở dữ liệu.
4. **Phản hồi:** Server đóng gói dữ liệu thành chuẩn JSON và trả tín hiệu (Response) về cho API Gateway phía Client.
5. **Thực thi hiển thị:** ReactJS nhận thông tin từ JSON, vẽ ảnh bìa lên giao diện, nạp URL nhạc vào thẻ đối tượng Audio Player và thực thi phát âm thanh cho người dùng.

---

### 2.6 Sơ đồ Usecase và Đặc tả Usecase

#### 2.6.1 Sơ đồ Usecase

**a. Tác nhân**

| Bậc | Tên tác nhân          | Mô tả vai trò                                                                                                                             |
| :--- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Người dùng (User)     | Người sử dụng nền tảng để tìm kiếm, nghe nhạc, tạo playlist, yêu thích bài hát và xem lịch sử nghe khi đã đăng nhập. |
| 2    | Quản trị viên (Admin) | Người điều hành hệ thống, quản lý nội dung hệ thống, trạng thái hiển thị, người dùng và thống kê.                      |

**b. Danh sách Usecase**

| Mã UC | Tên Usecase                                                   | Tác nhân chính |
| :----- | :------------------------------------------------------------- | :---------------- |
| UC1    | Xác thực Tài khoản                                         | User, Admin       |
| UC2    | Khám phá & Trải nghiệm nhạc                               | User              |
| UC3    | Quản lý & Tương tác Cá nhân                             | User              |
| UC4    | Đóng góp Nội dung Audio - phát triển tương lai         | User              |
| UC5    | Quản trị Tổng hợp Hệ thống                               | Admin             |
| UC6    | Kiểm duyệt nội dung do user gửi - phát triển tương lai | Admin             |
| UC7    | Giao tiếp Chat hỗ trợ - phát triển tương lai            | User, Admin       |
| UC8    | Gợi ý nhạc `For You` theo lịch sử/yêu thích           | User              |

**c. Sơ đồ Usecase**

```mermaid
graph LR
    %% Định nghĩa các Actor
    User((Người Dùng))
    Admin((Quản Trị Viên))

    %% Người Dùng
    User --> UC1([Xác thực Tài khoản])
    User --> UC2([Khám phá & Trải nghiệm nhạc])
    User --> UC3([Quản lý & Tương tác Cá nhân])
    User --> UC8([Gợi ý nhạc For You])
    %% Quản Trị Viên
    Admin --> UC1
    Admin --> UC5([Quản trị Tổng hợp Hệ thống])
```

#### 2.6.2 Đặc tả Usecase

*Dưới đây là đặc tả chi tiết cho các Use case cốt lõi của hệ thống nghe nhạc trực tuyến.*

**1. UC1: Xác thực Tài khoản (Đăng ký / Đăng nhập)**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Chức năng cho phép người dùng đăng ký, đăng nhập và đăng xuất khỏi hệ thống để sử dụng các tiện ích mang tính cá nhân hóa. Quản trị viên sử dụng để truy cập bảng điều khiển.
  * **Mức độ ưu tiên:** Cao (High)
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (User/Admin)                           | Phản hồi (Hệ thống)                                       |
  | :-------------------------------------------------- | :------------------------------------------------------------ |
  | Chọn chức năng "Đăng ký" hoặc "Đăng nhập" | Hiện Form yêu cầu thông tin đăng nhập/đăng ký       |
  | Điền tên tài khoản, mật khẩu và Submit      | Kiểm tra thông tin trong Cơ sở dữ liệu                  |
  | *(Trường hợp tài khoản hợp lệ)*            | Cấp thẻ JWT và định tuyến sang trang User/Admin         |
  | *(Trường hợp sai thông tin)*                  | Hiển thị thông báo rủi ro xác thực không thành công |
* **c. Yêu cầu chức năng:**
  * Hệ thống phải có khả năng băm (hash) mật khẩu để bảo vệ an toàn dữ liệu.
  * Tính năng cấp lại mật khẩu qua email nếu người dùng quên mật khẩu.

**2. UC2: Khám phá & Trải nghiệm nhạc (Search & Stream)**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Chức năng trọng tâm của website, cho phép tra cứu bài hát, ca sĩ và sử dụng Audio Player để phát âm thanh mà không cần tải file về.
  * **Mức độ ưu tiên:** Rất Cao (Critical)
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (User)                  | Phản hồi (Hệ thống)                                                |
  | :----------------------------------- | :--------------------------------------------------------------------- |
  | Gõ từ khóa vào thanh Tìm kiếm  | Truy vấn CSDL và hiển thị danh sách kết quả bài hát/ca sĩ    |
  | Nhấp Play một bản nhạc           | Trả về Audio URL để bắt đầu trình chiếu bản nhạc (Stream)   |
  | Nhấn dừng (Pause) hoặc tua (Seek) | Ngừng hoặc điều chỉnh bộ đếm thời gian âm thanh tương ứng |
* **c. Yêu cầu chức năng:**
  * Thuật toán tìm kiếm hỗ trợ tìm kiếm linh hoạt tên bài hát, nghệ sĩ.
  * Phản hồi luồng Stream âm nhạc với độ trễ thấp đảm bảo nghe mượt, không gián đoạn.

**3. UC3: Quản lý & Tương tác Cá nhân (Playlist, Like)**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Nhóm chức năng xử lý tương tác của người dùng với các bài nhạc (Like, tạo Playlist cá nhân) và thiết lập tài khoản.
  * **Mức độ ưu tiên:** Trung bình (Medium)
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (User)                          | Phản hồi (Hệ thống)                                                      |
  | :------------------------------------------- | :--------------------------------------------------------------------------- |
  | Bấm biểu tượng Yêu thích (Trái tim)   | Lưu Record vào database và bôi đỏ nút tim                             |
  | Bấm "Tạo Playlist mới"                    | Trả về khung nhập tên Playlist và tạo Playlist trống                  |
  | Bấm "Thêm vào Playlist" trên 1 bài hát | Ánh xạ ID bản nhạc vào Playlist đó và hiện thông báo thành công |
* **c. Yêu cầu chức năng:**
  * Dữ liệu thư viện cá nhân của tài khoản này độc lập, không bị tài khoản khác thao tác thay đổi.
  * Có giao diện Thư viện giúp theo dõi tất cả Playlist đã lưu.

**4. UC5: Quản trị Tổng hợp Hệ thống**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Chức năng dành cho Quản trị viên truy cập Dashboard/CMS để theo dõi tổng quan hệ thống, quản lý người dùng, quản lý kho nhạc, kiểm soát trạng thái hiển thị nội dung và xem các chỉ số thống kê vận hành cơ bản.
  * **Mức độ ưu tiên:** Cao (High)
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (Admin)                         | Phản hồi (Hệ thống)                                                      |
  | :------------------------------------------- | :--------------------------------------------------------------------------- |
  | Đăng nhập bằng tài khoản Admin hợp lệ  | Điều hướng vào Dashboard quản trị và hiển thị các chỉ số tổng quan |
  | Chọn mục "Quản lý Người dùng"          | Tải danh sách tài khoản, trạng thái hoạt động và công cụ khóa/mở khóa |
  | Chọn mục "Quản lý Kho Nhạc"            | Hiển thị danh sách bài hát, album, nghệ sĩ, thể loại và trạng thái công khai/chờ hiển thị |
  | Thực hiện thêm, sửa, xóa hoặc đổi trạng thái nội dung | Cập nhật dữ liệu trong hệ thống và phản hồi kết quả thao tác |
  | Mở mục "Thống kê" hoặc Dashboard       | Tổng hợp lượt nghe, số lượng người dùng, bài hát thịnh hành và các chỉ số vận hành cơ bản |
* **c. Yêu cầu chức năng:**
  * Chỉ tài khoản có quyền Quản trị viên mới được truy cập các màn hình và API quản trị.
  * Các thao tác thay đổi dữ liệu dùng chung như tài khoản, bài hát, album, nghệ sĩ và thể loại phải được kiểm tra quyền trước khi thực thi.
  * Hệ thống cần hiển thị thông báo thành công hoặc thất bại rõ ràng sau mỗi thao tác quản trị.
  * Các số liệu tổng quan phải được tổng hợp từ dữ liệu hiện có trong hệ thống và chỉ hiển thị nội dung phù hợp với quyền của Admin.

**5. UC4: Đóng góp Nội dung Audio (Phát triển tương lai, không thuộc bản bàn giao)**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Người dùng chủ động chia sẻ nội dung sản phẩm nghệ thuật (Cover, Remix, Sáng tác mới) với cộng đồng qua form tải tệp âm thanh.
  * **Mức độ ưu tiên:** Sau phiên bản bàn giao
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (User)                  | Phản hồi (Hệ thống)                                           |
  | :----------------------------------- | :---------------------------------------------------------------- |
  | Chọn mục Upload bài hát          | Cung cấp UI Form cần điền Metada và nút tải file MP3       |
  | Tải file xong và bấm "Xác nhận" | Đẩy Audio lên lưu trữ Đám mây (Cloud Storage)             |
  | *(Quá trình chờ xử lý)*       | Ghi nhận bài hát ở trạng thái "Đang chờ duyệt" (Pending) |
* **c. Yêu cầu chức năng:**
  * Giới hạn về dung lượng và định dạng tải lên cho phép (Max 15MB, chấp nhận định dạng âm thanh chuẩn).
  * Không đưa bài hát mới vào kết quả tìm kiếm cộng đồng khi Admin chưa có quyết định công khai (Approved).

**6. UC6: Kiểm duyệt Nội dung do User gửi (Phát triển tương lai, không thuộc bản bàn giao)**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Công đoạn hậu kiểm của Admin nhằm đảm bảo kho nhạc cộng đồng tuân thủ bản quyền âm nhạc.
  * **Mức độ ưu tiên:** Sau phiên bản bàn giao
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (Admin)                        | Phản hồi (Hệ thống)                                                      |
  | :------------------------------------------ | :--------------------------------------------------------------------------- |
  | Vào mục "Danh sách Chờ kiểm duyệt"    | Truy xuất và tải bảng dữ liệu những bài Upload Pending               |
  | Nhấn chức năng "Nghe thử"               | Khởi động Player nội tuyến để phát thử file gốc                    |
  | Bấm nút "Phê duyệt" (Approve)           | Chuyển bài hát thành trạng thái Công khai (Public) và báo tác giả |
  | Bấm nút "Từ chối" (Reject) + ghi lý do | Trả vể trạng thái Không hợp lệ và gửi lý do cho tác giả          |
* **c. Yêu cầu chức năng:**
  * Chặn hoàn toàn User bình thường can thiệp vào trang kiểm duyệt này.
  * Lưu trữ được lịch sử nhật ký (Logs) để tra soát Admin nào đã duyệt bài hát nào.

---

**7. UC8: Nhận Gợi ý Nhạc `For You`**

* **a. Mô tả và mức độ ưu tiên:**
  * **Mô tả:** Hệ thống hiển thị các bài hát công khai phù hợp với lịch sử nghe và bài hát yêu thích của người dùng ở tab "Dành cho bạn"; nếu chưa có dữ liệu thì dùng danh sách phổ biến.
  * **Mức độ ưu tiên:** Trung bình (Medium)
* **b. Chuỗi kích thích/phản hồi:**| Kích thích (User)                        | Phản hồi (Hệ thống)                                                      |
  | :------------------------------------------ | :--------------------------------------------------------------------------- |
  | Nhấn vào "Dành cho bạn" khi chưa có lịch sử/yêu thích | Hiển thị bài hát công khai phổ biến |
  | Nhấn vào "Dành cho bạn" sau khi đã nghe/thích bài hát | Trích xuất các bài hát phù hợp với lịch sử nghe/yêu thích và hiển thị thành danh sách |
* **c. Yêu cầu chức năng:**
  * Không hiển thị bước khảo sát chọn nghệ sĩ hoặc thể loại yêu thích ban đầu.
  * Chỉ lấy bài hát có trạng thái công khai.

### 2.7 Luồng màn hình (Screen flow)

#### 2.7.1 Sơ đồ luồng màn hình

**a. Sơ đồ luồng màn hình dành cho Người dùng (User)**

```mermaid
graph TD
    Start((Trang chủ))
    Login[Màn hình Đăng nhập / Đăng ký]
    Search[Màn hình Tìm kiếm]
    Discover[Màn hình Khám phá]
    ForYou[Màn hình Dành cho bạn]
    Player[Màn hình Phát nhạc & Lyrics]
    Library[Màn hình Tủ nhạc Của Tui]

    Start --> |Khám phá| Discover
    Start --> |Gợi ý| ForYou
    Start --> |Hành động| Search
    Start --> |Click Đăng nhập| Login
    Discover --> |Chọn bài/playlist| Player
    ForYou --> |Chọn bài gợi ý| Player
    Search --> |Chọn KQ bài hát| Player
    Start --> |Truy cập cá nhân| Library
```

**b. Sơ đồ luồng màn hình dành cho Quản trị viên (Admin)**

```mermaid
graph TD
    Login[Màn hình Đăng nhập Admin]
    Dash((Dashboard Quản trị Tổng hợp))
    ManageUsers[Màn hình Quản lý Người dùng]
    ManageMusic[Màn hình Quản lý Kho Nhạc]
    Stats[Màn hình Thống kê]

    Login --> |Xác thực Admin| Dash
    Dash --> |Quản lý tài khoản| ManageUsers
    Dash --> |Quản lý nội dung| ManageMusic
    Dash --> |Xem báo cáo| Stats
    ManageUsers --> |Lưu thay đổi trạng thái| Dash
    ManageMusic --> |Cập nhật kho nhạc| Dash
    Stats --> |Quay lại tổng quan| Dash
```

#### 2.7.2 Mô tả màn hình

| STT | Màn hình                            | Mô tả                                                                                                                                                      |
| :-: | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Trang chủ                            | Lấy cảm hứng từ NhacCuaTui, trang sở hữu banner động, danh mục "Hôm nay nghe gì", "Nhạc mới", kèm trình phát mini-player ở viền.           |
|  2  | Đăng nhập / Đăng ký             | Quản lý form thu thập thông tin định danh của người dùng để cấp quyền truy cập các tính năng cá nhân hóa.                               |
|  3  | Tìm kiếm                            | Ô tìm kiếm hỗ trợ tra cứu trực tiếp theo thời gian thực (Live-search), kết quả phân loại thành: Ca sĩ, Bài hát, Playlist.                  |
|  4  | Khám phá                            | Màn hình tổng hợp nội dung công khai như nhạc mới, bài hát nghe nhiều, album, playlist và thể loại để người dùng duyệt từ một điểm tập trung. |
|  5  | Phát nhạc & Lyrics                  | Màn hình trung tâm để nghe nhạc. Bao gồm đĩa nhạc xoay tròn, thanh chức năng Timeline và chạy lời nhạc Karaoke đồng bộ.                  |
|  6  | Tủ nhạc Của Tui                    | Nơi cá nhân hóa lưu lại tự động: Bài hát thường nghe, Playlist tự tạo nội bộ để dễ dàng tìm kiếm lại những bản nhạc yêu thích.  |
|  7  | Upload Nhạc của User (tương lai)  | Không thuộc màn hình bàn giao hiện tại; dự kiến cho phép user gửi audio trong phiên bản sau.                                                    |
|  8  | Đăng nhập Admin                    | Giao diện đăng nhập bảo mật tách biệt hoàn toàn dành riêng cho đội ngũ Quản trị viên vận hành hệ thống.                                |
|  9  | Dashboard Quản trị Tổng hợp       | Màn hình tổng quan CMS tập trung trình bày nhanh các thông số chỉ báo tài nguyên, nội dung, người dùng và truy cập trên hệ thống.               |
| 10 | Quản lý Người dùng               | Màn hình dạng bảng lưới giúp Admin tra soát, khóa quyền truy cập của các tài khoản thành viên vi phạm quy tắc nền tảng.                 |
| 11 | Quản lý Kho Nhạc                   | CMS để Admin thêm, sửa, xóa và đặt trạng thái hiển thị nội dung thuộc kho nhạc hệ thống.                                                    |
| 12 | Duyệt Upload của User (tương lai) | Không thuộc màn hình bàn giao hiện tại; dành cho quy trình nội dung do user gửi sau này.                                                         |
| 13 | Dành cho bạn (For You)              | Hiển thị bài hát công khai gợi ý theo lịch sử nghe/yêu thích; không có popup chọn nghệ sĩ hoặc thể loại.                                  |
| 14 | Thống kê                            | Màn hình báo cáo trực quan với biểu đồ (Pie/Bar Chart) theo dõi xu hướng thể loại nhạc thịnh hành nhất của tháng/năm.                   |

#### 2.7.3 Các chức năng không liên quan đến màn hình

| STT | Chức năng hệ thống      | Mô tả (Cấu hình chạy ngầm / Tiện ích)                                                                                                                           |
| :-: | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Phát nhạc nền liên tục | Khi chuyển đổi giữa trang chủ sang trang tìm kiếm hay cá nhân, luồng Audio vẫn liên tục phát ẩn bên dưới để âm thanh không bị gián đoạn.      |
|  2  | Cron Job cập nhật Ranking | Chức năng chạy ngầm (ví dụ: mỗi đêm) tiến hành tổng hợp cơ dữ liệu để tự động xếp hạng Trending Song dựa trên số lượt Listen + Like.        |
|  3  | Sinh JWT Token              | Máy chủ tự động tạo token (JSON Web Token) để giữ phiên xác thực giữa các API Client-Server mà không cần phải hiện ra Frontend.                      |
|  4  | Stream Chunking             | Thuật toán xử lý băm nhỏ bộ nhớ byte của âm thanh từ Server truyền qua lại cho Client nhằm tối ưu băng thông lúc tải thay vì tải 1 file cục bộ. |

#### 2.7.4 Hệ thống cấp quyền

| STT | Vai trò (Role)                  | Chức năng hoạt động / Quyền hạn                                                                                           |
| :-: | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Người dùng (User)             | Khám phá thư viện công khai và nghe nhạc; đăng nhập để yêu thích bài hát, quản lý playlist và lịch sử nghe. |
|  2  | Quản trị viên (Administrator) | Truy cập CMS Dashboard để quản lý tài khoản và kho nhạc hệ thống, bao gồm trạng thái hiển thị nội dung.         |

---

### 2.8 Các yêu cầu khác của hệ thống (Other Requirements)

Để đảm bảo dự án vận hành trơn tru trong môi trường thực tế, ngoài các yêu cầu về chức năng và giao diện người dùng, dự án đòi hỏi những nguyên tắc hiện đại bắt buộc về Tích hợp/Triển khai liên tục và hạ tầng DevOps.

#### 2.8.1 Yêu cầu DevOps & Triển khai (Deployment)

* **Khả năng Containerization:** Backend (Django REST) và Frontend (React) phải được đóng gói thành các image bằng **Docker**, có sẵn file `docker-compose.yml` để dễ dàng khởi tạo chỉ với một câu lệnh trên các môi trường khác nhau.
* **Môi trường Server:** Mã nguồn yêu cầu khả năng tương thích vận hành trên nền tảng máy chủ hệ điều hành Linux (như Ubuntu/CentOS) do đây là chuẩn chung của các nền tảng VPS/Cloud.
* **Quản lý Secret Key:** Các chuỗi nhạy cảm và thông tin Database mật cần được cô lập toàn bộ vô file `.env` theo nguyên tắc bảo mật. Cấm việc hardcode vào bảng mã nguồn trực tiếp.

#### 2.8.2 Yêu cầu CI/CD (Continuous Integration / Continuous Deployment)

* **Repo & Branching:** Quản lý source code thống nhất trên kho lưu trữ đám mây (GitHub/GitLab). Mỗi tác vụ nâng cấp tính năng đều phải đẩy vào nhánh phụ (`feature/`) và tạo Pull Request (PR) về nhánh chính thay vì commit đè trực tiếp.
* **Tích hợp liên tục (CI Workflow):** Hệ thống ưu tiên thiết lập Pipeline tự động chạy các bài test, hoặc các tool kiểm tra lỗi mã nguồn tĩnh ngay khi ghi nhận một tín hiệu mở PR mới.
* **Triển khai liên tục (CD Pipeline):** Khi Pull Request được nghiệm thu thành công hoặc có code merge mới vào `main`, một luồng công việc sẽ tự động pull code về môi trường Procuction, khởi động quá trình build bundle và cập nhật container không cần sự thao tác tĩnh bằng tay từ con người.
