---
title: "Biến, Kiểu Dữ Liệu và Vòng Lặp Cơ Bản"
description: "Học cách máy tính lưu trữ dữ liệu trên RAM và luồng điều khiển cơ bản"
order: 1
---

# Bài 1: Nền tảng lập trình C++

Lập trình không phải là học thuộc lòng các câu lệnh (Syntax). Lập trình là học cách giao tiếp với máy tính, đặc biệt là với **RAM** (Bộ nhớ tạm) và **CPU** (Bộ vi xử lý).

## 1. Bản chất của việc "Khai báo biến"

Rất nhiều sinh viên năm nhất thường viết code như một cái máy: `int a;` rồi không hiểu bản chất thực sự bên dưới là gì.

Khi bạn viết lệnh `int a;` trong C++, bạn đang gọi Hệ điều hành (OS) và yêu cầu:
> "Này hệ điều hành, cho tôi mượn một ô trống trong bộ nhớ RAM, kích thước đúng bằng 4 Bytes (chuẩn của kiểu int). Tôi muốn dán nhãn cái ô đó là 'a'."

**Tuy nhiên, C++ là một ngôn ngữ "lười biếng":**
Nó sẽ đi thuê một ô RAM cho bạn, nhưng nó KHÔNG dọn dẹp ô RAM đó! Nếu trước đó có một chương trình khác (như Google Chrome) dùng ô RAM đó và bỏ lại rác, biến `a` của bạn sẽ chứa giá trị rác đó.

### Lỗi điển hình (Anti-pattern)

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int score; // Khai báo nhưng không khởi tạo
    
    // Kết quả in ra có thể là một số ngẫu nhiên: -858993460
    cout << "Điểm của bạn là: " << score << endl;
    return 0;
}
\`\`\`

### Cách viết chuẩn mực (Best Practice)
Hãy tập thói quen: **Cứ khai báo là phải khởi tạo**.

\`\`\`cpp
int main() {
    int score = 0; // Khởi tạo an toàn
    cout << "Điểm của bạn là: " << score << endl; // Luôn luôn là 0
    return 0;
}
\`\`\`

---

## 2. Các Kiểu Dữ Liệu Cơ Bản và Kích Thước

C++ yêu cầu bạn phải rất sòng phẳng về kích thước bộ nhớ.

| Kiểu dữ liệu | Kích thước | Khoảng giá trị | Ứng dụng thực tế |
|---|---|---|---|
| `int` | 4 Bytes | -2 tỷ đến 2 tỷ | Đếm số lượng, đếm vòng lặp, ID cơ bản |
| `long long` | 8 Bytes | Rất lớn | Lưu trữ ID Database, tính toán tài chính |
| `float` | 4 Bytes | 7 chữ số thập phân | Tính điểm trung bình môn, tọa độ 3D Game |
| `double` | 8 Bytes | 15 chữ số thập phân | Các phép tính khoa học, tài chính |
| `char` | 1 Byte | Bảng mã ASCII (256 ký tự) | Lưu 1 ký tự duy nhất (Y/N) |
| `bool` | 1 Byte | true/false (1 hoặc 0) | Biến cờ (Flag) kiểm tra trạng thái |

### Mẹo phỏng vấn:
> Câu hỏi: Tại sao `bool` chỉ có 2 giá trị (0 và 1) tức là 1 Bit, nhưng C++ lại bắt nó chiếm nguyên 1 Byte (8 Bits) trong RAM?
> **Trả lời:** Bởi vì cấu trúc phần cứng của CPU được thiết kế để đọc bộ nhớ theo từng Byte. CPU không thể lấy riêng lẻ 1 Bit ra khỏi RAM được. Việc lấy 1 Byte nhanh hơn và tối ưu hơn rất nhiều.

---

## 3. Vòng Lặp (Control Flow) và Độ Phức Tạp

Vòng lặp giúp CPU lặp đi lặp lại một hành động.
Cấu trúc cơ bản của `for`:
\`\`\`cpp
for (Khởi_tạo ; Điều_kiện ; Bước_nhảy) {
    // Code thực thi
}
\`\`\`

### Cạm bẫy vòng lặp vô tận (Infinite Loop)
Lỗi này thường xảy ra nhất khi dùng `while` mà quên cập nhật biến điều kiện.

\`\`\`cpp
int i = 0;
while (i < 10) {
    cout << "Lặp vô tận do quên tăng i";
    // Thiếu i++; ở đây khiến i mãi mãi là 0
}
\`\`\`

### Bài toán thực tế: Tìm User trong mảng

Giả sử bạn làm backend cho Facebook. Mảng của bạn chứa 1 triệu người dùng. Làm sao tìm một người tên là "Alex"?

\`\`\`cpp
// Thuật toán tìm kiếm tuyến tính (Linear Search)
bool findUser(string users[], int size, string targetName) {
    for(int i = 0; i < size; i++) {
        if(users[i] == targetName) {
            return true; // Tìm thấy, thoát hàm ngay lập tức
        }
    }
    return false; // Chạy hết mảng mà không thấy
}
\`\`\`

*Phân tích:* Đây là thuật toán O(N). Tức là trong trường hợp xấu nhất (Alex nằm ở cuối mảng), CPU phải chạy đúng 1 triệu vòng lặp. Để giải quyết, người ta sẽ học đến cấu trúc **Hash Map** hoặc **Binary Search** ở các chương sau để giảm thời gian tìm xuống chỉ còn... 1 vòng lặp (O(1)).
