# Báo cáo Kỹ thuật: Cập nhật Hệ thống CurriculumVault & HealthHub
**Thời gian cập nhật:** Tháng 6/2026

Dưới đây là chi tiết các tính năng mới được xây dựng, kèm theo kiến trúc và kỹ thuật lập trình đã sử dụng để bạn dễ dàng nắm bắt logic hệ thống.

---

## 1. Tái Cấu Trúc Cơ Sở Dữ Liệu (Prisma)
**Kỹ thuật sử dụng:** Relational Database Design (Prisma ORM)

- **Vấn đề cũ:** Bài tập (`Exercise`) và Câu hỏi (`ReviewQuiz`) trước đây được liên kết ở cấp độ `Subject` (Môn học), hoặc bị nhúng chuỗi JSON vào trường `codeIllustrations` của `TheorySection`. Điều này khiến việc query dữ liệu theo từng chương bị sai lệch và cực kỳ khó khăn.
- **Cách giải quyết:** 
  - Khai báo lại model `TheorySection` trong `schema.prisma`.
  - Thêm quan hệ `1-N` (One-to-Many): Một `TheorySection` có nhiều `Exercise` và nhiều `ReviewQuiz`. 
  - Thêm cột `rating` (kiểu Int) và `flashcards` (kiểu String) trực tiếp vào `TheorySection`.
  - Chạy lệnh `npx prisma db push` để apply Schema mới vào SQLite.

## 2. Refactor UI CurriculumVault.tsx
**Kỹ thuật sử dụng:** React State Management, Component Lifecycle, Conditional Rendering

- **Tách biệt Data theo Chương (Section):** 
  - Đã cập nhật logic render trong file `CurriculumVault.tsx` để đọc dữ liệu từ `selectedSection.exercises` và `selectedSection.quizzes` thay vì lấy mảng toàn cục từ `selectedSubject`.
  - Sửa lỗi Flexbox & Layout: Giữ nguyên thanh TOC (Mục lục chương) hiển thị ở mọi Tab (Lý thuyết, Bài tập, Quiz) bằng cách tái cấu trúc lại các thẻ `div` bọc ngoài, giúp UX liền mạch hơn khi chuyển Tab.
- **Chức năng đánh giá (Rating):**
  - Sử dụng mảng map `[1, 2, 3, 4, 5].map(...)` để render hệ thống sao đánh giá.
  - Gọi API `/api/theory/rate` bằng `fetch` (POST) để lưu trực tiếp rating vào database.

## 3. Nâng Cấp Hệ Thống AI Generator
**Kỹ thuật sử dụng:** Prompt Engineering, Next.js App Router API Routes, Zero-shot & Context-aware Generation

- **API Tái tạo Bài giảng (`forceGenerate`):**
  - Trong Route `/api/theory/generate`, đã thêm cơ chế tiếp nhận cờ `forceGenerate: true`. 
  - Khi nhận cờ này, API sẽ bỏ qua bước check cache trong Database và ép Gemini AI sinh lại toàn bộ nội dung mới dựa trên `Subject` và `Chapter Title`.
- **API Bài Tập & Quiz theo Ngữ cảnh:**
  - Thay vì sinh bài tập ngẫu nhiên cho toàn môn học, hệ thống giờ đây truyền thẳng `coreConcept` (Lý thuyết của chương đó) vào Prompt của AI. 
  - AI đọc lý thuyết đó và tự động sinh ra các câu hỏi trắc nghiệm/bài tập Code **bám sát 100% nội dung chương**.
- **API Flashcards Độc lập:**
  - Xây dựng một file route mới `api/flashcard/generate/route.ts` chuyên biệt để sinh cấu trúc mảng JSON `{ front: string, back: string }` cho Flashcards thay vì tự parse các cụm từ in đậm trong văn bản như trước.

## 4. Tích hợp Mobile Activity Tracker (Pedometer & GPS)
**Kỹ thuật sử dụng:** Web APIs (DeviceMotion & Geolocation), React Refs & Math Algorithms

Mặc dù `ActivityTracker.tsx` đã được tạo từ trước, đây là các kỹ thuật cốt lõi bên trong nó:
- **Thuật toán Pedometer (Đếm bước chân):**
  - Lắng nghe event `devicemotion` để lấy gia tốc của điện thoại (x, y, z).
  - Sử dụng thuật toán Peak Detection (Phát hiện đỉnh): Tính toán vector gia tốc tổng `Math.sqrt(x*x + y*y + z*z) / 9.81`. Nếu vượt quá ngưỡng `1.2 G-force` thì được tính là 1 bước chân.
  - Sử dụng `useRef` lưu `lastStepTime` để debounce, tránh đếm nhầm các bước quá sát nhau (dưới 300ms).
- **Thuật toán Geolocation (Đo khoảng cách GPS):**
  - Dùng `navigator.geolocation.watchPosition` để liên tục tracking tọa độ (Lat/Lng) của người dùng.
  - Sử dụng **Công thức Haversine (Haversine formula)** để tính khoảng cách đường chim bay giữa tọa độ cũ và tọa độ mới theo đơn vị Kilometers (có tính đến độ cong của Trái Đất).
  - Lọc nhiễu (Noise filtering): Chỉ cộng dồn khoảng cách nếu di chuyển lớn hơn `5m` và nhỏ hơn `1km` trong một lần update để tránh GPS bị "giật" làm sai lệch kết quả.
