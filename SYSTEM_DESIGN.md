# GlowUp Tracker - System Design & Master Plan

Đây là tài liệu đặc tả hệ thống và kế hoạch kiến trúc tổng thể của siêu ứng dụng cá nhân GlowUp Tracker (LifeOS), được thiết kế để quản lý toàn diện 8 phân hệ cuộc sống: từ thể chất, sự nghiệp, tâm trí, đến các mối quan hệ xã hội.

---

## 1. Kiến Trúc & Công Nghệ Cốt Lõi (The Engine)

- **Frontend Framework:** `Next.js 16` (App Router, Server Actions, chạy bằng Webpack tối ưu cho macOS ARM64).
- **Giao diện (UI/UX):** Vanilla CSS với phong cách thiết kế **Glassmorphism**, nền **Dark Mode** 100%, phong cách phẳng, nghiêm túc, không sử dụng Emoji (ngoại trừ trong tài liệu đặc tả này để nhấn mạnh tính năng).
- **Cơ Sở Dữ Liệu (Database):** `Prisma ORM` kết nối `SQLite` lưu cục bộ (`dev.db`). Sẵn sàng cho việc scale lên Cloud/PostgreSQL khi cần thiết.
- **Luồng Dữ Hành (Data Flow):** Sử dụng Next.js Server Actions xử lý trực tiếp các truy vấn Database để tối giản hóa API layer.

---

## 2. Thiết Kế Màn Hình Chính: "Trung Tâm Điều Hành Cảm Hứng"

Màn hình Dashboard (Trang chủ) được thiết kế theo dạng Module/Widget, gồm 4 khu vực "tâm hồn" giúp nạp năng lượng ngay lập tức:

1. **Khu Vực "Vibe & Động Lực" (Góc Nhìn Đầu Tiên)**
   - **Motivation Widget:** Khung ảnh tự động đổi (ảnh mèo dễ thương, vóc dáng mục tiêu 48kg, châm ngôn mạnh mẽ).
   - **Media Player Nhúng:** Tích hợp iframe Spotify (Lofi chill buổi sáng, EDM/Rock buổi chiều tối).
   - **Video Hỗ Trợ Đa Nhiệm (Floating Video):** Khung iframe YouTube mini để xem hướng dẫn code, kỹ thuật boxing hoặc giải trí ăn trưa.
2. **Khu Vực "Trung Tâm Tác Chiến" (Quản Lý Hành Động)**
   - **Deadline Countdown:** Đếm ngược sinh tử đến các cột mốc lớn. Tự động chuyển màu Xanh -> Vàng -> Đỏ.
   - **Daily Draft:** Hiển thị đúng 3 task cốt lõi bắt buộc phải hoàn thành và 1 thói quen bị cấm (Anti-habit).
   - **Thanh Năng Lượng & Tâm Trạng:** Thanh trượt (slider) để chấm điểm mức năng lượng sáng nay (1-10) ngay khi vừa mở app.
3. **Khu Vực "Chỉ Số Sinh Tồn" (Theo Dõi Nhanh)**
   - **Vòng Tròn Macro & Calo (Donut Chart):** Biểu đồ vành khăn hiển thị số Calo nạp vào so với ngân sách.
   - **Quỹ Đi Chợ Tuần:** Thanh tiến độ (Progress bar). Nếu xài gần hết quỹ 400k, thanh chuyển cam cảnh báo.
   - **Water Drops:** Các biểu tượng giọt nước, click vào để sáng lên mỗi khi uống xong 1 ly.
4. **Khu Vực "Log Nhanh" (Tiện Ích Nhập Liệu)**
   - **Quick Input Box:** Ô text thần thánh gõ lệnh nhanh, hệ thống tự phân tích từ khóa xếp vào bảng dữ liệu.
   - **Microphone Button:** Nút bấm thu âm Voice-to-Text log nhanh mức độ mệt mỏi.
   - **Nút Bấm SOS:** Nút cấp cứu khi chán nản, tự động bật nhạc truyền động lực hoặc ném ra bức thư "Time Capsule".

---

## 3. Đặc Tả Chi Tiết 8 Phân Hệ (Modules Architecture)

### Phân Hệ 1: Thể Chất, Vóc Dáng & Công Thái Học (`/health` & `/nutrition`)
Không chỉ giảm mỡ, mà còn bảo vệ cơ thể trước những giờ ngồi code kéo dài.
- **Weight & Body Recomposition:** Biểu đồ kết hợp theo dõi xu hướng giảm từ 60kg xuống 48kg, kết hợp số đo 3 vòng. Phân tích tốc độ giảm mỡ để cảnh báo mất cơ do thâm hụt calo quá gắt.
- **Combat & Workout Logger:** Ghi log Boxing (bao cát/đánh lướt), LISS cardio và giãn cơ. Tích hợp RPE (kiệt sức 1-10).
- **Nutrition & Grocery Vault:** Quản lý Calo/Macro nạp vào, liên kết trừ lùi ngân sách 300k - 400k/tuần.
- **Hydration Tracker:** Tự động điều chỉnh mục tiêu nước uống dựa trên cường độ tập.
- **Sleep Architecture:** Ghi nhận giờ ngủ, thức và chất lượng giấc ngủ.
- **Women's Bio-Cycle:** Bản đồ chu kỳ sinh học dự đoán ngày tụt năng lượng, tích nước.
- 🔥 **Ergonomics & Posture Guard:** Bộ đếm thời gian cảnh báo dáng ngồi. Ngồi 90 phút sẽ có pop-up nhắc vặn mình bảo vệ vai gáy.

### Phân Hệ 2: Sự Nghiệp, Tri Thức & Kỹ Thuật (`/career`)
Quản lý sự nghiệp như cách thiết kế hệ thống phần mềm.
- **Tech Skill Tree:** Đánh giá tiến độ tích lũy Data Engineering, Cloud (Azure), Python. Cộng EXP khi hoàn thành.
- **Deep Work & Flow State:** Bộ đếm Pomodoro chặn xao nhãng, ghi nhận phút "chìm" vào luồng công việc.
- **Internship Pipeline:** Bảng Kanban luồng ứng tuyển thực tập: Nộp CV -> HR Call -> Phỏng vấn -> Offer.
- **Spaced Repetition Flashcards:** Hệ thống ôn tập ngắt quãng thuật toán.
- 🔥 **Portfolio & Project Vault:** Trình quản lý dự án cá nhân. Chốt Feature Scope tránh "bôi việc".
- 🔥 **Code Snippet / Algorithm Library:** Kho lưu code tối ưu (Mapper/Reducer) tự đúc kết.

### Phân Hệ 3: Tâm Trí, Cảm Xúc & Tập Trung (`/mental`)
Bảo vệ bộ não khỏi quá tải thông tin.
- **Energy - Mood Matrix:** Đánh giá chéo mức năng lượng và trạng thái (Tiêu cực/Tích cực).
- **Burnout Radar:** Thuật toán phát hiện chuỗi ngày năng lượng thấp, phát cảnh báo "Nguy cơ kiệt sức".
- **Micro-Journaling:** Nơi "xả rác" tâm trí hoặc ghi 3 điều biết ơn.
- **Social Battery Monitor:** Đánh giá hao hụt năng lượng sau sự kiện đông người.
- 🔥 **Information Diet:** Ghi log tỷ lệ thời gian tiêu thụ nội dung rác (MXH) vs nội dung giá trị (tài liệu), giúp "ăn kiêng" thông tin.
- 🔥 **Dopamine Detox Mode:** Nút chuyển toàn hệ thống sang đen trắng, khóa tính năng thừa trong tuần thi cử.

### Phân Hệ 4: Tiện Ích Đời Sống & Tài Chính Vi Mô (`/finance`)
Tối giản hóa không gian sống và tối ưu hóa chi tiêu.
- **Cost-Per-Use:** Chia nhỏ giá trị đồ dưỡng da, quần áo theo số lần sử dụng.
- **Skincare & Inventory Lifecycle:** Theo dõi hạn mở nắp (PAO) mỹ phẩm.
- **Subscription Manager:** Theo dõi hạn dịch vụ đám mây, tên miền, Netflix.
- **Wardrobe Minimalism Tracker:** Lọc đồ 6 tháng chưa mặc để thanh lý.
- 🔥 **ROI of Learning:** Tỉ suất đầu tư học tập so với tính thực tiễn khi phỏng vấn/làm đồ án.
- 🔥 **Digital Clutter Sweeper:** Lịch nhắc dọn file tải xuống, xóa email rác, dọn Cloud hàng tháng.

### Phân Hệ 5: Mạng Lưới Quan Hệ (Personal CRM) (`/crm`)
Quản trị kết nối xã hội tinh tế.
- **Professional Network Log:** Lưu thông tin mentor, HR. Ghi chú lần tương tác cuối.
- **Catch-up Reminder:** Nhắc nhở định kỳ nhắn tin hỏi thăm người thân.
- **Gift & Preference Vault:** Ghi nhớ sở thích, kích cỡ quần áo, dị ứng thức ăn.
- 🔥 **Value Exchange Log:** Theo dõi sự cân bằng quan hệ. Nhận diện sớm quan hệ một chiều (toxic).

### Phân Hệ 6: Lõi Hệ Thống, Phân Tích & Tự Động Hóa (The Engine)
Trái tim ứng dụng, biến dữ liệu thô thành quyết định chiến lược.
- **Cross-Correlation Engine:** Tìm quy luật ngầm (VD: Cắt tinh bột -> code kém buổi chiều).
- **Daily Readiness Score:** Tổng hợp Sleep, RPE, Mood để chấm điểm sinh lực (0-100), đề xuất lịch trình.
- 🔥 **Personal Data Pipeline (ETL):** Luồng xử lý ngầm trích xuất, biến đổi và tải dữ liệu siêu tốc.
- 🔥 **Notification Lifecycle Architecture:** Nhắc nhở xoay quanh sự kiện vòng đời thay vì thời gian thực (real-time) để tiết kiệm tài nguyên máy tính tuyệt đối.
- 🔥 **"What-If" Simulator:** Bộ mô phỏng giả định: "Nếu ép quỹ đi chợ xuống 250k và tăng Cardio 20%, cân nặng đổi ra sao?".

### Phân Hệ 7: Quản Trị Mục Tiêu & Chống Trễ Hạn (`/tasks`)
Hoạt động như một Project Manager khó tính.
- **Agile Personal Sprints:** Chia nhỏ dự án thành Sprint 1-2 tuần. Có bảng "Retrospective" cuối tuần.
- **Dependency Blockers:** Đồ thị (Graph) khóa chéo task. Khóa task B nếu task A nút thắt chưa xong.
- **Energy-Aware Task Allocation:** Gợi ý xếp task khó vào khung giờ năng lượng đỉnh, task dễ vào lúc năng lượng đáy.
- **Anti-Procrastination Buffer:** Deadline giả mạo màu báo động đỏ hiển thị trước deadline thật 2 ngày.
- **Deadline Triage Matrix:** Phân loại cấp cứu khi quá tải, ép "Drop" hoặc "Delay" task ưu tiên thấp.
- **Task Lifecycle Notifications:** Thông báo nhẹ nhàng theo vòng đời: Created -> Approaching -> Critical -> Resolved.

### Phân Hệ 8: Nhật Ký & Kho Kỷ Niệm (Digital Memory Vault) (`/memory`)
Lưu giữ "phần hồn" và hành trình "glow up".
- **Time Capsule (Kén Thời Gian):** Gửi thư cho chính mình (đính kèm ảnh 60kg). Hệ thống khóa lại và tự động gửi thông báo "Mở kén" vào 1 năm sau khi đã đạt 48kg.
- **Multimedia Object Storage:** Lưu trữ ảnh/âm thanh trên Azure Blob Storage/S3, chỉ lưu URL trong DB để ứng dụng luôn nhẹ nhàng.
- **"On This Day" Engine:** Kéo kỷ niệm ngày này năm xưa lên Dashboard mỗi sáng.
- **Emotion & Keyword Indexing:** MapReduce để bóc tách từ khóa. Gõ "Đà Lạt" là ra ngay nhật ký cũ cực nhanh.
- **Voice & Audio Logs:** Nhật ký âm thanh khi mỏi tay không muốn gõ phím sau khi tập Boxing.
- **Glow-up Timelapse:** Tự động ghép ảnh selfie/vóc dáng hàng tuần thành video/GIF lột xác.
- **Brain Dump:** Cửa sổ vứt rác tâm trí siêu tốc khi đang cần Deep Work. Dữ liệu tự xóa sau 30 ngày.
