---
title: "Con Trỏ, Tham Chiếu và Cấp Phát Động"
description: "Vũ khí mạnh nhất và cũng nguy hiểm nhất của C++"
order: 2
---

# Bài 2: Con Trỏ (Pointers)

Nếu bạn không hiểu Pointers, bạn chưa biết C++. Hầu hết sinh viên sợ con trỏ vì không hình dung được bản chất vật lý của nó trong máy tính.

## 1. Mọi thứ đều có "Địa chỉ nhà"
RAM máy tính của bạn là một con đường dài với hàng tỷ căn nhà. Mỗi căn nhà chứa được 1 Byte dữ liệu.
Mỗi căn nhà đều có "Địa chỉ" (Ví dụ: `0x7ffe`).

Khi bạn viết lệnh: `int age = 20;`
Máy tính xây một căn nhà, đặt tên là `age`, nhét số `20` vào. Để biết địa chỉ căn nhà này, bạn thêm dấu `&` phía trước tên biến.

\`\`\`cpp
int age = 20;
cout << &age; // Sẽ in ra một chuỗi lạ hoắc như: 0x7ffeeb5a
\`\`\`

---

## 2. Vậy Con Trỏ (Pointer) là cái gì?

**Con trỏ thực chất cũng chỉ là MỘT BIẾN BÌNH THƯỜNG.**
Nhưng thay vì chứa các con số như 10, 20... nó dùng để chứa **ĐỊA CHỈ NHÀ** của một biến khác.

\`\`\`cpp
int age = 20;

// Khai báo một con trỏ kiểu int (thêm dấu * sau kiểu dữ liệu)
int* p;

// Cất ĐỊA CHỈ của biến age vào trong con trỏ p
p = &age; 
\`\`\`

### Dấu * thứ 2: Dereference (Lấy đồ trong nhà)
Khi bạn đã nắm địa chỉ nhà (`p`), làm sao để lấy giá trị `20` nằm trong căn nhà đó ra? Bạn dùng dấu `*` ở đằng trước con trỏ.

\`\`\`cpp
// p đang trỏ tới age.
cout << *p; // Sẽ in ra: 20
\`\`\`

---

## 3. Tại sao Game và App lớn BẮT BUỘC dùng Con Trỏ?

### Bài toán: Truyền Tham Trị (Pass by Value)
Khi bạn truyền một biến vào hàm, C++ tạo ra một **BẢN SAO** (Copy). Hàm chỉ làm việc trên bản sao.

\`\`\`cpp
void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 1, y = 2;
    swap(x, y); 
    // Thất bại! x vẫn là 1, y vẫn là 2.
}
\`\`\`

### Giải pháp: Pass by Pointer (Đưa địa chỉ nhà)
Nếu một nhân vật Game có kích thước 2GB RAM. Bạn truyền nó vào hàm `updateGame(Character c)`, CPU sẽ phải COPY 2GB RAM này ra một chỗ mới -> Sập RAM.

Nhưng nếu bạn đưa địa chỉ của nhân vật đó: `updateGame(Character* c)`, hàm chỉ nhận được 8 Bytes địa chỉ. Sau đó nó tự đến tận nơi để chỉnh sửa. Vô cùng tối ưu.

\`\`\`cpp
void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;     // Đi tới tận địa chỉ của a, ghi đè bằng giá trị của b
    *b = temp;
}

int main() {
    int x = 1, y = 2;
    swap(&x, &y); // Đưa ĐỊA CHỈ vào hàm
    // Thành công! x=2, y=1
}
\`\`\`

---

## 4. Tham Chiếu (Reference) - Cách dễ thở hơn
C++ thấy con trỏ quá rườm rà (phải dùng dấu `&` và `*` liên tục) nên tạo ra **Tham chiếu**. Nó chỉ là một "Bí danh" (Alias) cho biến gốc. Không tạo ra bản sao, không cần dùng dấu `*`.

\`\`\`cpp
// Khai báo tham chiếu bằng dấu & ở tham số
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 1, y = 2;
    swap(x, y); // Truyền vào như bình thường, C++ tự ngầm trỏ tới địa chỉ gốc
}
\`\`\`
*Lời khuyên: Trong C++, nếu không bắt buộc phải quản lý vùng nhớ thủ công bằng `new/delete`, hãy luôn ưu tiên dùng Tham Chiếu thay cho Con Trỏ.*
