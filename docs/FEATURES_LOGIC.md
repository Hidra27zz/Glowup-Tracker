# GlowUp Tracker - Core Features & Logic Architecture

Tài liệu này lưu trữ luồng logic và cách triển khai các chức năng lớn của hệ thống. Bất kỳ tính năng mới nào được xây dựng đều phải được cập nhật vào đây để bảo trì và mở rộng sau này.

---

## 1. Phân hệ 1: Health & Nutrition (Sức khỏe & Dinh dưỡng)

### 1.1. GlowUp Blueprint (Hệ thống Lộ trình Tập luyện Tự động)
**Mục tiêu:** Cung cấp lộ trình (Dinh dưỡng, Tập luyện, Timeline) dựa trên Prompt tự do của user mà không cần gọi API AI bên ngoài (để tiết kiệm chi phí và chạy mượt mà cục bộ).

**Luồng Logic (Logic Flow):**
1. **Input:** User nhập chuỗi string tự do (VD: "Giảm đùi trong 4 tuần").
2. **Xử lý (Blueprint Engine - `src/lib/utils/blueprintEngine.ts`):**
   - Phân tích từ khóa giảm cân (`giảm`, `mỡ`, `ốm`) vs tăng cơ (`tăng`, `to`, `cơ`).
   - Phân tích vùng cơ thể (focusArea): `đùi`, `tay`, `bụng`...
   - Phân tích thời gian (regex tìm số + `tháng`/`tuần`).
3. **Output Generation:** 
   - Sinh ra `nutritionRules` (VD: Thâm hụt 300 calo).
   - Sinh ra `workoutPlan` (Cardio + Kháng lực vùng Đùi).
   - Sinh ra `youtubeQuery` (VD: "legs glutes thigh fat burning hiit").
4. **Fetch Videos:** Gọi Server Action `searchYoutubeWorkouts(youtubeQuery)` để lấy HTML từ YouTube, parse `ytInitialData` và trả về 4 video thực tế nhất.
5. **Hiển thị & Lưu trữ:** 
   - Render giao diện Glassmorphism tuyệt đẹp tại `FitnessBlueprint.tsx`.
   - Nếu User bấm "Áp Dụng", lưu toàn bộ chuỗi JSON của Blueprint vào trường `activeBlueprint` của bảng `UserSettings`. Khi Reload trang, tự động deserialize và render lại Blueprint cũ như một bảng nhắc nhở.

---

### 1.2. Nutrition Vault (Quản lý Dinh dưỡng & Tủ lạnh)
**Mục tiêu:** Quản lý Macro (Đa lượng), Calo, Ngân sách đi chợ và Tồn kho thực phẩm.

**Luồng Logic (Logic Flow):**
- **Macro Tracking (`NutritionVault.tsx`)**:
  - Form nhập liệu nhận `Calories, Budget, Protein, Carbs, Fat`.
  - Server Action `logNutrition` cộng dồn vào bản ghi `NutritionLog` của ngày hôm nay (`date: { gte: today }`).
  - Render Pie Chart cho Calo và Progress Bars cho các Macro.
- **Pantry Tracker (`PantryTracker.tsx`)**:
  - Giao diện nhập **Ngày Mua** + **Phân Loại (Category)** thông minh thay vì bắt nhập ngày hết hạn. Tự động suy luận số ngày hỏng (Meat: +3 days, Fresh: +5 days, Processed: +14 days, Dry: +30 days).
  - Đánh dấu viền Vàng (Sắp hỏng < 2 ngày) và Đỏ (Đã hết hạn).
  - Tính năng **Cập nhật số lượng (Edit Quantity)**: Bấm vào icon bút chì để sửa nhanh số lượng còn lại sau khi dùng (thay vì chỉ có xóa hoàn toàn), giúp user theo dõi chính xác đồ thừa.
  - Tích hợp trực tiếp vào `/nutrition/page.tsx`.

---

### 1.3. Intermittent Fasting (Nhịn ăn gián đoạn 16:8)
**Mục tiêu:** Theo dõi chu kỳ nhịn ăn.

**Luồng Logic (Logic Flow):**
1. Lưu `fastingStart` (DateTime) vào DB bảng `UserSettings`.
2. Khi User nhấn "Bắt đầu Fasting", lưu thời gian hiện tại vào `fastingStart`.
3. Client Component `FastingTimer.tsx` dùng `setInterval` đếm ngược so với `FASTING_GOAL_HOURS = 16`.
4. Vẽ Vòng cung đếm ngược (SVG Circle với `strokeDashoffset` thay đổi theo tỉ lệ thời gian đã trôi qua).

---

## 2. Phân hệ 2: Career & Deep Work (Sự nghiệp & Làm việc sâu)

### 2.1. Deep Work Protocol (Đồng hồ đếm ngược Pomodoro)
**Mục tiêu:** Giúp người dùng tập trung làm việc, đếm ngược thời gian và tự động lưu lại phiên làm việc.

**Luồng Logic:**
- Component `DeepWorkTimer.tsx` cung cấp 3 chế độ: Pomodoro (25p), Deep Work (60p), Hyperfocus (90p).
- Dùng `setInterval` đếm ngược `timeLeft`, vẽ viền `svg circle` tương ứng.
- Khi thời gian chạy hết (`timeLeft === 0`), đồng hồ chuyển sang chế độ "Hoàn thành".
- Hiển thị Form để nhập Tên công việc (Task) và Trạng thái tập trung (Flow State 1-5).
- Gọi Server Action `logDeepWork` lưu thẳng vào Database bảng `DeepWorkSession`.

### 2.2. Tech Skill Tree (Cây kỹ năng)
**Mục tiêu:** Biến việc học kỹ năng khô khan thành hệ thống RPG có Level và Kinh nghiệm (EXP).

**Luồng Logic:**
- Lấy toàn bộ kỹ năng từ bảng `Skill` qua Prisma.
- Logic thăng cấp ở Backend `addExp`: Khi EXP >= 100, `Level += Math.floor(EXP / 100)` và `EXP = EXP % 100`.
- Hiển thị thanh Progress Bar bằng `width: ${skill.exp}%` với CSS Transitions mượt mà.

### 2.3. Career Blueprint (Tư vấn lộ trình)
**Mục tiêu:** Nhập từ khóa (VD: "Data Analyst", "OOP"), hệ thống sẽ vạch ra lộ trình học tập, tìm video hướng dẫn và bài test năng lực.

**Luồng Logic:**
- Module `careerEngine.ts` sử dụng regex / string matching để phân tích Prompt của người dùng và trả về đối tượng `CareerBlueprint`.
- **YouTube Fetcher:** Tích hợp `searchYoutubeTutorials` (không nhầm với bài tập thể dục) để scrape trực tiếp kết quả khóa học từ YouTube (không cần API key, sử dụng regex bóc tách ytInitialData).
- **Interactive Quiz Engine (Phòng Test Năng Lực):** 
  - Thay vì danh sách câu hỏi tĩnh, hệ thống render cấu trúc `QuizQuestion[]`.
  - Hỗ trợ **Trắc nghiệm (Multiple Choice)** và **Tự luận (Text Input)**.
  - Tự luận được chấm điểm bằng **Keyword Matching** (Người dùng phải gõ đúng ít nhất 1 từ khóa quy định).
  - Trả về Xanh (đúng), Đỏ (sai) kèm theo Giải thích chi tiết. Tính tổng điểm khi hoàn thành.

### 2.4. Flashcard Vault (Hệ thống thẻ ghi nhớ)
**Mục tiêu:** Quản lý và ôn tập kiến thức theo mô hình lặp lại.

**Luồng Logic:**
- Bảng `FlashcardDeck` (nhóm theo `category`) và `Flashcard` (chứa `nextReview` và `interval`).
- Tính năng **Bulk Import**: Parser chuỗi Text (copy từ Excel/Google Sheets). Tách bằng dấu `\n` (xuống dòng) và `\t` (Tab) hoặc `|` để tự động tạo `front` và `back`. 
- **Spaced Repetition Algorithm**: 
  - Chưa thuộc (mastery 0): Học lại vào ngày mai (`interval = 1`).
  - Tạm ổn (mastery 1): Lặp lại sau 3 ngày (`interval = 3`).
  - Đã thuộc (mastery 2): Lặp lại sau 7 ngày (`interval = 7`).
- Giao diện có hiển thị thẻ nhắc nhở (Badge Đỏ): Đếm số lượng thẻ có `nextReview <= Now()`.
- Hiệu ứng CSS 3D (`transform-style: preserve-3d` và `rotateX(180deg)`) xử lý việc lật thẻ trực tiếp trên client.

---
*Tài liệu này sẽ tiếp tục được mở rộng khi phát triển các Phân hệ tiếp theo: Finance, Mental, Memory...*
