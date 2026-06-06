export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
}

export interface ExerciseTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hint?: string;
  realWorldScenario?: string;
  edgeCases?: string[];
  starterCode: Record<string, string>;
  testCases: ExerciseTestCase[];
}

export interface TheorySection {
  title: string;
  content: string; // HTML string
  quiz?: QuizQuestion[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  icon: string;
  color: string;
  theory: TheorySection[];
  exercises: Exercise[];
}

export interface SubjectGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  subjects: Subject[];
}

// ═══════════════════════════════════════════════════════
// NHÓM 1: LẬP TRÌNH & THUẬT TOÁN
// ═══════════════════════════════════════════════════════

const it001: Subject = {
  id: "it001",
  code: "IT001",
  name: "Nhập môn Lập trình (C++)",
  credits: 4,
  icon: "C",
  color: "#60a5fa",
  theory: [
    {
      title: "Chương 1: Khái niệm cơ bản & Thuật toán",
      quiz: [
        { question: "Thuật toán (Algorithm) là gì?", options: ["Ngôn ngữ lập trình", "Tập hợp các bước hữu hạn giải quyết bài toán", "Phần cứng máy tính", "Trình biên dịch"], correct: 1, explanation: "Thuật toán là tập hợp các bước hữu hạn, xác định và hiệu quả để giải quyết một bài toán." },
        { question: "Cấu trúc nào KHÔNG có trong Flowchart?", options: ["Hình thoi (điều kiện)", "Hình chữ nhật (xử lý)", "Hình tròn (lặp vô hạn)", "Hình oval (bắt đầu/kết thúc)"], correct: 2, explanation: "Flowchart không có hình tròn biểu diễn lặp vô hạn. Các hình thông thường là: oval, hình chữ nhật, hình thoi, mũi tên." },
        { question: "Tính chất nào SAI của thuật toán?", options: ["Hữu hạn (Finiteness)", "Xác định (Definiteness)", "Vô hạn (Infiniteness)", "Hiệu quả (Effectiveness)"], correct: 2, explanation: "Thuật toán PHẢI hữu hạn - phải dừng sau một số hữu hạn bước. Tính 'vô hạn' là sai." }
      ],
      content: `
<h3>1.1 Máy tính là gì?</h3>
<p>Máy tính là thiết bị xử lý thông tin tự động theo chương trình. Cấu trúc Von Neumann gồm: <strong>CPU</strong> (xử lý), <strong>RAM</strong> (bộ nhớ tạm), <strong>Thiết bị I/O</strong> và <strong>Bộ nhớ lưu trữ</strong>.</p>
<ul>
  <li><strong>CPU (Central Processing Unit):</strong> Bộ não của máy tính, thực thi lệnh. Gồm ALU (tính toán số học/logic) và CU (điều khiển).</li>
  <li><strong>RAM:</strong> Lưu dữ liệu và chương trình đang chạy. Mất dữ liệu khi tắt máy (volatile).</li>
  <li><strong>HDD/SSD:</strong> Lưu trữ lâu dài (non-volatile).</li>
</ul>

<h3>1.2 Thuật toán (Algorithm)</h3>
<p>Thuật toán là <strong>tập hợp các bước hữu hạn, xác định, hiệu quả</strong> để giải quyết một bài toán.</p>
<p>5 tính chất quan trọng:</p>
<ul>
  <li><strong>Input:</strong> Có 0 hoặc nhiều dữ liệu đầu vào.</li>
  <li><strong>Output:</strong> Sinh ra ít nhất 1 kết quả.</li>
  <li><strong>Definiteness (Xác định):</strong> Mỗi bước phải rõ ràng, không mơ hồ.</li>
  <li><strong>Finiteness (Hữu hạn):</strong> Phải kết thúc sau hữu hạn bước.</li>
  <li><strong>Effectiveness (Hiệu quả):</strong> Có thể thực hiện được bằng tính toán cơ bản.</li>
</ul>

<h3>1.3 Biểu diễn thuật toán bằng Flowchart</h3>
<p>Flowchart dùng các ký hiệu hình học chuẩn:</p>
<table>
  <tr><th>Hình</th><th>Ý nghĩa</th></tr>
  <tr><td>Hình oval (ellipse)</td><td>Bắt đầu / Kết thúc (Start/End)</td></tr>
  <tr><td>Hình chữ nhật</td><td>Xử lý / Tính toán (Process)</td></tr>
  <tr><td>Hình thoi</td><td>Điều kiện / Quyết định (Decision)</td></tr>
  <tr><td>Hình bình hành</td><td>Nhập/Xuất dữ liệu (I/O)</td></tr>
  <tr><td>Mũi tên</td><td>Hướng luồng thực thi</td></tr>
</table>

<h3>1.4 Ví dụ thực tế: Tìm số lớn nhất trong 3 số</h3>
<pre><code>// Pseudocode:
// Input: a, b, c
// Output: max

Bắt đầu
  Nhập a, b, c
  max = a
  Nếu b > max thì max = b
  Nếu c > max thì max = c
  In ra max
Kết thúc</code></pre>

<h3>1.5 Ngôn ngữ lập trình</h3>
<p>Từ ý tưởng thuật toán, ta dùng ngôn ngữ lập trình để "dịch" thành code máy hiểu:</p>
<ul>
  <li><strong>Ngôn ngữ máy (Machine code):</strong> 0101010... khó đọc với người.</li>
  <li><strong>Assembly:</strong> Dùng mnemonic (MOV, ADD...) - vẫn phụ thuộc CPU.</li>
  <li><strong>High-level languages (C++, Python, Java...):</strong> Gần với ngôn ngữ con người.</li>
</ul>
<p><strong>Quá trình biên dịch (Compilation):</strong> Source code → Compiler → Object code → Linker → Executable (.exe)</p>
      `
    },
    {
      title: "Chương 2: Kiểu dữ liệu & Rẽ nhánh",
      quiz: [
        { question: "Kiểu dữ liệu nào lưu số thực với độ chính xác cao hơn?", options: ["int", "float", "double", "char"], correct: 2, explanation: "double dùng 8 bytes (64-bit), float dùng 4 bytes (32-bit). double có độ chính xác cao hơn (~15 chữ số thập phân so với ~7 của float)." },
        { question: "Kết quả của 7 / 2 trong C++ (kiểu int)?", options: ["3.5", "3", "4", "Lỗi compile"], correct: 1, explanation: "Khi hai operand đều là int, C++ thực hiện phép chia nguyên. 7/2 = 3 (phần dư bỏ đi)." },
        { question: "Switch/case trong C++ KHÔNG hỗ trợ kiểu nào?", options: ["int", "char", "double", "enum"], correct: 2, explanation: "Switch/case chỉ hoạt động với kiểu nguyên (int, char, enum). Không hỗ trợ float/double vì vấn đề so sánh số thực." }
      ],
      content: `
<h3>2.1 Các kiểu dữ liệu cơ bản trong C++</h3>
<table>
  <tr><th>Kiểu</th><th>Kích thước</th><th>Phạm vi</th><th>Ví dụ</th></tr>
  <tr><td><code>int</code></td><td>4 bytes</td><td>-2,147,483,648 đến 2,147,483,647</td><td>int age = 20;</td></tr>
  <tr><td><code>long long</code></td><td>8 bytes</td><td>±9.2 × 10¹⁸</td><td>long long big = 1e18;</td></tr>
  <tr><td><code>float</code></td><td>4 bytes</td><td>~7 chữ số thập phân</td><td>float pi = 3.14f;</td></tr>
  <tr><td><code>double</code></td><td>8 bytes</td><td>~15 chữ số thập phân</td><td>double e = 2.71828;</td></tr>
  <tr><td><code>char</code></td><td>1 byte</td><td>-128 đến 127 (ASCII)</td><td>char c = 'A';</td></tr>
  <tr><td><code>bool</code></td><td>1 byte</td><td>true / false</td><td>bool ok = true;</td></tr>
  <tr><td><code>string</code></td><td>Biến đổi</td><td>Chuỗi ký tự</td><td>string s = "Hello";</td></tr>
</table>

<h3>2.2 Cấu trúc rẽ nhánh if/else</h3>
<pre><code>// Cú pháp cơ bản
if (điều_kiện) {
    // Thực thi nếu điều_kiện là true
} else if (điều_kiện_2) {
    // Thực thi nếu điều_kiện_2 là true
} else {
    // Thực thi nếu tất cả điều kiện là false
}

// Ví dụ thực tế: Xếp loại điểm
int score = 75;
if (score >= 90) {
    cout << "Xuất sắc";
} else if (score >= 80) {
    cout << "Giỏi";
} else if (score >= 65) {
    cout << "Khá";
} else if (score >= 50) {
    cout << "Trung bình";
} else {
    cout << "Yếu";
}</code></pre>

<h3>2.3 Switch / Case</h3>
<p>Switch phù hợp khi so sánh một biến với nhiều giá trị cố định. <strong>Lưu ý:</strong> Phải có <code>break</code> sau mỗi case, nếu không sẽ "fall-through" (chạy tiếp case dưới).</p>
<pre><code>int day = 3;
switch (day) {
    case 1: cout << "Thứ Hai"; break;
    case 2: cout << "Thứ Ba"; break;
    case 3: cout << "Thứ Tư"; break;
    // ...
    case 7: cout << "Chủ Nhật"; break;
    default: cout << "Không hợp lệ";
}

// Fall-through có chủ ý (hợp lệ):
switch (day) {
    case 6:
    case 7:
        cout << "Cuối tuần!"; // Chạy cho cả case 6 và 7
        break;
    default:
        cout << "Ngày làm việc";
}</code></pre>

<h3>2.4 Toán tử trong C++</h3>
<pre><code>// Toán tử số học
int a = 10, b = 3;
cout << a + b;  // 13
cout << a - b;  // 7
cout << a * b;  // 30
cout << a / b;  // 3 (chia nguyên!)
cout << a % b;  // 1 (phần dư)

// CẨNH BÁO: Chia nguyên vs chia thực
cout << 7 / 2;          // 3 (sai nếu muốn 3.5)
cout << 7.0 / 2;        // 3.5 (đúng)
cout << (double)7 / 2;  // 3.5 (cast kiểu)

// Toán tử logic
cout << (a > 5 && b < 5);  // true (AND)
cout << (a > 15 || b < 5); // true (OR)
cout << !(a > 5);           // false (NOT)</code></pre>

<h3>2.5 Edge Cases cần nhớ</h3>
<ul>
  <li><strong>Integer overflow:</strong> <code>int x = 2147483647; x++;</code> → x = -2147483648 (tràn số). Dùng <code>long long</code> khi số lớn.</li>
  <li><strong>Chia cho 0:</strong> <code>int x = 5/0;</code> → Undefined behavior (UB), chương trình crash. Luôn kiểm tra trước khi chia!</li>
  <li><strong>So sánh float:</strong> <code>0.1 + 0.2 == 0.3</code> → false! Vì số nhị phân không biểu diễn chính xác. Dùng: <code>abs(a - b) < 1e-9</code>.</li>
</ul>
      `
    },
    {
      title: "Chương 3: Cấu trúc vòng lặp",
      quiz: [
        { question: "Vòng lặp nào đảm bảo thực thi ÍT NHẤT 1 lần?", options: ["for", "while", "do-while", "Không có vòng nào"], correct: 2, explanation: "do-while kiểm tra điều kiện SAU khi thực thi thân vòng lặp, nên thân luôn chạy ít nhất 1 lần dù điều kiện sai ngay từ đầu." },
        { question: "Vòng lặp for(int i=0; i<n; i++) chạy bao nhiêu lần?", options: ["n+1 lần", "n lần", "n-1 lần", "Phụ thuộc vào n"], correct: 1, explanation: "i chạy từ 0 đến n-1, nên vòng lặp thực thi đúng n lần." },
        { question: "Lệnh nào thoát khỏi toàn bộ vòng lặp?", options: ["continue", "break", "return", "exit"], correct: 1, explanation: "break thoát khỏi vòng lặp gần nhất. continue bỏ qua phần còn lại của iteration hiện tại và tiếp tục vòng kế tiếp." }
      ],
      content: `
<h3>3.1 Vòng lặp for</h3>
<p>Dùng khi <strong>biết trước số lần lặp</strong>.</p>
<pre><code>// Cú pháp: for(khởi_tạo; điều_kiện; cập_nhật)
for (int i = 0; i < 5; i++) {
    cout << i << " ";  // In: 0 1 2 3 4
}

// Đếm ngược
for (int i = 5; i >= 1; i--) {
    cout << i << " ";  // In: 5 4 3 2 1
}

// Vòng lặp tính tổng
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;  // sum = 1+2+...+100 = 5050
}

// Vòng lặp 2 chiều (ma trận)
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        cout << i*3 + j << " ";
    }
    cout << endl;
}</code></pre>

<h3>3.2 Vòng lặp while</h3>
<p>Dùng khi <strong>không biết trước số lần lặp</strong>, kiểm tra điều kiện trước.</p>
<pre><code>// Đọc số cho đến khi nhập 0
int n;
cin >> n;
while (n != 0) {
    cout << "Bạn nhập: " << n << endl;
    cin >> n;
}

// Tìm chữ số đầu tiên của một số
int num = 12345;
while (num >= 10) {
    num /= 10;
}
cout << "Chữ số đầu: " << num;  // 1</code></pre>

<h3>3.3 Vòng lặp do-while</h3>
<p>Thực thi ít nhất 1 lần, kiểm tra điều kiện sau.</p>
<pre><code>// Menu nhập lại khi sai
int choice;
do {
    cout << "Nhập lựa chọn (1-3): ";
    cin >> choice;
} while (choice < 1 || choice > 3);
// Đảm bảo choice hợp lệ khi ra khỏi vòng lặp</code></pre>

<h3>3.4 Break và Continue</h3>
<pre><code>// break: thoát ngay khỏi vòng lặp
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    cout << i;  // In: 0 1 2 3 4
}

// continue: bỏ qua iteration hiện tại
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    cout << i;  // In: 1 3 5 7 9 (số lẻ)
}

// CẢNH BÁO: Vòng lặp vô hạn
while (true) {
    // Code không có điều kiện thoát
    // → Chương trình treo (hang)!
    break; // Phải có điều kiện thoát
}</code></pre>

<h3>3.5 Edge Cases & Bẫy thường gặp</h3>
<ul>
  <li><strong>Off-by-one error:</strong> <code>for(i=1; i<=n; i++)</code> vs <code>for(i=0; i&lt;n; i++)</code> - Khác nhau 1 iteration, gây lỗi khó tìm.</li>
  <li><strong>Vòng lặp vô hạn do quên cập nhật biến:</strong> <code>int i=0; while(i&lt;5) { ... }</code> - quên <code>i++</code> → treo máy.</li>
  <li><strong>Integer overflow trong điều kiện:</strong> <code>for(int i=0; i&lt;=INT_MAX; i++)</code> → i tràn về 0, lặp vô hạn.</li>
</ul>
      `
    },
    {
      title: "Chương 4: Hàm (Functions)",
      quiz: [
        { question: "Trong C++, hàm không trả về giá trị dùng kiểu trả về nào?", options: ["null", "none", "void", "empty"], correct: 2, explanation: "void là kiểu dữ liệu đặc biệt nghĩa là 'không có giá trị'. Hàm void không dùng lệnh return (hoặc return không có giá trị)." },
        { question: "Truyền tham số theo giá trị (pass by value) có nghĩa là gì?", options: ["Hàm nhận địa chỉ của biến gốc", "Hàm nhận bản sao của giá trị", "Hàm có thể thay đổi biến gốc", "Hàm nhận con trỏ"], correct: 1, explanation: "Pass by value tạo ra bản sao. Thay đổi trong hàm KHÔNG ảnh hưởng biến gốc bên ngoài." },
        { question: "Recursion là gì?", options: ["Hàm có nhiều tham số", "Hàm gọi lại chính nó", "Hàm không có tham số", "Hàm trả về void"], correct: 1, explanation: "Recursion (đệ quy) là kỹ thuật hàm tự gọi lại chính nó. Phải có base case để dừng, tránh Stack Overflow." }
      ],
      content: `
<h3>4.1 Hàm (Function) là gì?</h3>
<p>Hàm là một khối code được đặt tên, thực hiện một nhiệm vụ cụ thể. Giúp code <strong>tái sử dụng, dễ đọc, dễ bảo trì</strong> (DRY - Don't Repeat Yourself).</p>
<pre><code>// Cú pháp
kiểu_trả_về tên_hàm(kiểu param1, kiểu param2) {
    // Thân hàm
    return giá_trị; // Nếu không phải void
}

// Ví dụ:
int add(int a, int b) {
    return a + b;
}

void printLine(int n) {  // void: không trả về
    for (int i = 0; i < n; i++) cout << "-";
    cout << endl;
}

// Gọi hàm
int main() {
    int result = add(3, 5);  // result = 8
    printLine(10);
    return 0;
}</code></pre>

<h3>4.2 Truyền tham số</h3>
<pre><code>// Pass by VALUE - bản sao, không thay đổi biến gốc
void tryChange(int x) {
    x = 100; // Chỉ thay đổi bản sao cục bộ
}

// Pass by REFERENCE - tham chiếu, thay đổi biến gốc
void realChange(int& x) {
    x = 100; // Thay đổi trực tiếp biến gốc!
}

// Pass by POINTER - con trỏ
void ptrChange(int* x) {
    *x = 100; // Thay đổi giá trị qua địa chỉ
}

int main() {
    int a = 5;
    tryChange(a);   cout << a; // 5 (không đổi)
    realChange(a);  cout << a; // 100 (đã đổi)
    return 0;
}</code></pre>

<h3>4.3 Hàm đệ quy (Recursion)</h3>
<p>Hàm gọi lại chính nó. Cần có <strong>base case</strong> (điều kiện dừng) để tránh đệ quy vô hạn.</p>
<pre><code>// Tính n! = n * (n-1) * ... * 1
long long factorial(int n) {
    if (n <= 1) return 1;   // Base case: dừng đệ quy
    return n * factorial(n - 1); // Recursive case
}
// factorial(5) = 5 * factorial(4)
//              = 5 * 4 * factorial(3)
//              = 5 * 4 * 3 * 2 * 1 = 120

// Fibonacci
int fib(int n) {
    if (n <= 1) return n; // Base case
    return fib(n-1) + fib(n-2);
}
// CẢNH BÁO: fib(50) rất chậm O(2^n)! Dùng DP hoặc memoization.</code></pre>

<h3>4.4 Phạm vi biến (Variable Scope)</h3>
<pre><code>int globalVar = 10; // Biến toàn cục - accessible mọi nơi

void func() {
    int localVar = 5;  // Biến cục bộ - chỉ tồn tại trong func()
    cout << globalVar; // OK - đọc được biến toàn cục
}

int main() {
    cout << globalVar; // OK
    // cout << localVar; // LỖI! localVar không tồn tại ở đây
    return 0;
}

// TRÁNH biến toàn cục khi có thể - gây ra side effects khó debug</code></pre>

<h3>4.5 Function Overloading</h3>
<pre><code>// Cùng tên hàm, khác tham số (C++ hỗ trợ)
int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; }
int add(int a, int b, int c) { return a + b + c; }

// Compiler tự chọn đúng version dựa vào kiểu tham số</code></pre>
      `
    },
    {
      title: "Chương 5: Mảng (Arrays)",
      quiz: [
        { question: "Mảng int a[5] trong C++ có chỉ số hợp lệ từ đến?", options: ["1 đến 5", "0 đến 4", "0 đến 5", "1 đến 4"], correct: 1, explanation: "Mảng trong C++ bắt đầu từ chỉ số 0. Mảng 5 phần tử có chỉ số từ 0 đến 4. Truy cập a[5] là lỗi buffer overflow." },
        { question: "Tìm kiếm nhị phân yêu cầu mảng phải như thế nào?", options: ["Mảng ngẫu nhiên", "Mảng đã được sắp xếp", "Mảng có số phần tử chẵn", "Mảng không có phần tử trùng"], correct: 1, explanation: "Binary Search bắt buộc mảng phải được sắp xếp (tăng hoặc giảm). Nếu không sort trước, kết quả sẽ sai." },
        { question: "Truyền mảng vào hàm trong C++ tương đương với?", options: ["Pass by value (copy cả mảng)", "Pass by reference (truyền con trỏ đến phần tử đầu)", "Pass by name", "Không thể truyền mảng vào hàm"], correct: 1, explanation: "Khi truyền mảng vào hàm, C++ thực ra truyền con trỏ đến phần tử đầu tiên. Hàm có thể thay đổi mảng gốc!" }
      ],
      content: `
<h3>5.1 Mảng 1 chiều</h3>
<pre><code>// Khai báo và khởi tạo
int a[5];                    // Khai báo (chưa khởi tạo - giá trị rác)
int b[5] = {1, 2, 3, 4, 5}; // Khởi tạo đầy đủ
int c[] = {1, 2, 3};         // Tự suy ra kích thước = 3
int d[5] = {0};              // Tất cả = 0

// Truy cập phần tử
cout << b[0]; // 1 (phần tử đầu)
cout << b[4]; // 5 (phần tử cuối)
// b[5] -> BUFFER OVERFLOW! Undefined behavior!

// Duyệt mảng
int n = 5;
for (int i = 0; i < n; i++) {
    cout << b[i] << " ";
}

// Nhập mảng từ người dùng
int arr[100], n;
cin >> n;
for (int i = 0; i < n; i++) {
    cin >> arr[i];
}</code></pre>

<h3>5.2 Thuật toán cơ bản trên mảng</h3>
<pre><code>// Tìm min/max
int findMax(int a[], int n) {
    int maxVal = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > maxVal) maxVal = a[i];
    }
    return maxVal;
}

// Tìm kiếm tuyến tính (Linear Search) - O(n)
int linearSearch(int a[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) return i;  // Trả về chỉ số
    }
    return -1;  // Không tìm thấy
}

// Tìm kiếm nhị phân (Binary Search) - O(log n) - PHẢI sort trước!
int binarySearch(int a[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2; // Tránh overflow: không dùng (left+right)/2
        if (a[mid] == target) return mid;
        else if (a[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Sắp xếp nổi bọt (Bubble Sort) - O(n²)
void bubbleSort(int a[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (a[j] > a[j+1]) {
                swap(a[j], a[j+1]);
            }
        }
    }
}</code></pre>

<h3>5.3 Mảng 2 chiều (Ma trận)</h3>
<pre><code>int matrix[3][4]; // 3 hàng, 4 cột

// Khởi tạo
int m[2][3] = {{1,2,3}, {4,5,6}};

// Duyệt ma trận
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        cout << m[i][j] << " ";
    }
    cout << endl;
}

// Chuyển vị ma trận
void transpose(int a[N][N], int t[N][N], int n) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            t[j][i] = a[i][j];
}</code></pre>

<h3>5.4 Truyền mảng vào hàm</h3>
<pre><code>// Hàm THAY ĐỔI ĐƯỢC mảng gốc (pass con trỏ)
void doubleAll(int a[], int n) {
    for (int i = 0; i < n; i++) a[i] *= 2;
}
// Luôn phải truyền kèm kích thước n!

// Hàm KHÔNG thay đổi mảng (const)
int sum(const int a[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) total += a[i];
    return total;
}</code></pre>

<h3>5.5 Edge Cases nguy hiểm</h3>
<ul>
  <li><strong>Buffer overflow:</strong> Truy cập <code>a[n]</code> hoặc <code>a[-1]</code> → undefined behavior, có thể gây security exploit.</li>
  <li><strong>Mảng chưa khởi tạo:</strong> <code>int a[5];</code> chứa giá trị rác - luôn khởi tạo hoặc gán trước khi dùng.</li>
  <li><strong>Kích thước mảng cố định:</strong> C++ mảng thông thường không thể resize - dùng <code>vector&lt;int&gt;</code> khi cần mảng động.</li>
</ul>
      `
    },
    {
      title: "Chương 6: Con trỏ (Pointer) & Bộ nhớ động",
      quiz: [
        { question: "Toán tử & trong C++ có nghĩa là gì khi dùng với biến?", options: ["Bitwise AND", "Lấy địa chỉ của biến (Address-of)", "Khai báo tham chiếu", "Phép nhân logic"], correct: 1, explanation: "Toán tử & (address-of) trả về địa chỉ bộ nhớ của biến. Ví dụ: int x=5; int* p = &x; // p chứa địa chỉ của x." },
        { question: "Toán tử * khi dùng với con trỏ có nghĩa là gì?", options: ["Nhân hai số", "Dereference - truy cập giá trị tại địa chỉ con trỏ đang trỏ", "Khai báo con trỏ", "Xóa bộ nhớ"], correct: 1, explanation: "Khi * dùng trong biểu thức (không phải khai báo), nó là dereference - lấy giá trị tại địa chỉ mà con trỏ đang trỏ." },
        { question: "Memory leak xảy ra khi nào?", options: ["Truy cập mảng vượt chỉ số", "Cấp phát động nhưng không giải phóng (delete)", "Khai báo biến không dùng", "Chia cho số 0"], correct: 1, explanation: "Memory leak: cấp phát bộ nhớ bằng new nhưng không delete khi xong. Bộ nhớ bị giữ mãi đến khi tắt chương trình." }
      ],
      content: `
<h3>6.1 Con trỏ là gì?</h3>
<p>Con trỏ là biến lưu <strong>địa chỉ bộ nhớ</strong> của biến khác. Đây là tính năng mạnh mẽ nhất và nguy hiểm nhất của C/C++.</p>
<pre><code>int x = 42;
int* p = &x;     // p lưu địa chỉ của x

cout << x;       // 42 (giá trị)
cout << &x;      // 0x7fff... (địa chỉ ô nhớ của x)
cout << p;       // 0x7fff... (giá trị của p = địa chỉ x)
cout << *p;      // 42 (dereference: lấy giá trị tại địa chỉ p)

// Thay đổi giá trị qua con trỏ
*p = 100;
cout << x;       // 100! x đã bị thay đổi qua con trỏ</code></pre>

<h3>6.2 Con trỏ và Mảng</h3>
<pre><code>int arr[] = {10, 20, 30, 40, 50};
int* p = arr; // p trỏ đến phần tử đầu tiên

cout << *p;       // 10
cout << *(p+1);   // 20 (pointer arithmetic)
cout << p[2];     // 30 (dùng như mảng)

// Duyệt mảng bằng con trỏ
for (int* ptr = arr; ptr < arr + 5; ptr++) {
    cout << *ptr << " ";
}</code></pre>

<h3>6.3 Cấp phát bộ nhớ động (Dynamic Memory)</h3>
<pre><code>// Cấp phát trên Heap (tồn tại đến khi delete)
int* p = new int;        // 1 int
*p = 42;
delete p;                // PHẢI giải phóng!
p = nullptr;             // Tránh dangling pointer

// Mảng động
int n = 5;
int* arr = new int[n];   // Mảng n phần tử động
arr[0] = 1;
// ... dùng arr...
delete[] arr;            // Giải phóng mảng dùng delete[]
arr = nullptr;

// Stack vs Heap:
// Stack: int x = 5;     (tự giải phóng khi ra khỏi scope)
// Heap:  int* p = new int;  (phải delete thủ công)</code></pre>

<h3>6.4 Con trỏ NULL và Dangling Pointer</h3>
<pre><code>int* p = nullptr; // Con trỏ null - không trỏ vào đâu

// NGUY HIỂM: Dereference null pointer → Crash!
// *p = 5; // Segmentation fault!

// Luôn kiểm tra trước khi dereference:
if (p != nullptr) {
    *p = 5; // An toàn
}

// Dangling pointer: con trỏ trỏ đến vùng nhớ đã giải phóng
int* q = new int(10);
delete q;
// *q = 5; // NGUY HIỂM! q là dangling pointer
q = nullptr; // Set null sau khi delete</code></pre>

<h3>6.5 Con trỏ hàm và Struct</h3>
<pre><code>// Struct (cấu trúc dữ liệu tự định nghĩa)
struct Student {
    string name;
    int age;
    double gpa;
};

Student s1 = {"Nguyen Van A", 20, 3.5};
cout << s1.name;

// Con trỏ đến struct
Student* ptr = &s1;
cout << ptr->name;  // Dùng -> thay vì .
cout << (*ptr).age; // Tương đương

// Cấp phát struct động
Student* s2 = new Student;
s2->name = "Tran Thi B";
delete s2;</code></pre>

<h3>6.6 Các lỗi cực kỳ nguy hiểm với con trỏ</h3>
<ul>
  <li><strong>Memory Leak:</strong> <code>new</code> nhưng quên <code>delete</code>. Dùng <code>smart pointer</code> (unique_ptr, shared_ptr) trong C++ hiện đại.</li>
  <li><strong>Double Free:</strong> Gọi <code>delete</code> hai lần trên cùng một con trỏ → crash.</li>
  <li><strong>Buffer Overflow:</strong> Ghi vượt ra ngoài vùng nhớ được cấp → lỗi bảo mật nghiêm trọng (stack smashing).</li>
  <li><strong>Wild Pointer:</strong> Con trỏ chưa khởi tạo, trỏ vào địa chỉ ngẫu nhiên → undefined behavior.</li>
</ul>
      `
    }
  ],
  exercises: [
    {
      id: "ex_it001_1",
      title: "Số nguyên tố",
      difficulty: "Easy",
      description: `<p>Kiểm tra số nguyên tố. Cho số nguyên <code>n</code>, xuất <code>YES</code> nếu là nguyên tố, <code>NO</code> nếu không.</p>
<p><strong>Input:</strong> Một số nguyên n (1 ≤ n ≤ 10^6)</p>
<p><strong>Output:</strong> YES hoặc NO</p>
<p><strong>Ví dụ:</strong></p>
<pre>Input: 7   → Output: YES
Input: 9   → Output: NO
Input: 1   → Output: NO (1 không phải số nguyên tố!)</pre>`,
      hint: "Kiểm tra từ 2 đến căn bậc hai của n (O(√n)). Đặc biệt n=1 không phải nguyên tố.",
      realWorldScenario: "Số nguyên tố dùng trong mã hóa RSA - bảo mật ngân hàng, HTTPS.",
      edgeCases: ["n = 1: KHÔNG phải nguyên tố", "n = 2: nguyên tố (số chẵn duy nhất là nguyên tố)", "n = 0 hoặc âm: không phải nguyên tố"],
      starterCode: {
        cpp: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // TODO: Viết code kiểm tra nguyên tố
    // Gợi ý: Kiểm tra từ 2 đến sqrt(n)
}

int main() {
    int n;
    cin >> n;
    cout << (isPrime(n) ? "YES" : "NO") << endl;
    return 0;
}`,
        python: `import math

def is_prime(n):
    # TODO: Viết code kiểm tra nguyên tố
    pass

n = int(input())
print("YES" if is_prime(n) else "NO")`
      },
      testCases: [
        { id: "1", input: "7", expectedOutput: "YES", isHidden: false },
        { id: "2", input: "1", expectedOutput: "NO", isHidden: false },
        { id: "3", input: "2", expectedOutput: "YES", isHidden: false },
        { id: "4", input: "9", expectedOutput: "NO", isHidden: false },
        { id: "5", input: "999983", expectedOutput: "YES", isHidden: true }
      ]
    },
    {
      id: "ex_it001_2",
      title: "Đảo ngược chuỗi không dùng hàm có sẵn",
      difficulty: "Easy",
      description: `<p>Đảo ngược một chuỗi ký tự sử dụng mảng <code>char</code> (không được dùng string::reverse hoặc thư viện tương tự).</p>
<p><strong>Ví dụ:</strong> "hello" → "olleh"</p>`,
      hint: "Dùng kỹ thuật hai con trỏ (left, right) swap từ hai đầu vào giữa.",
      edgeCases: ["Chuỗi rỗng", "Chuỗi 1 ký tự", "Chuỗi có khoảng trắng"],
      starterCode: {
        cpp: `#include <iostream>
#include <cstring>
using namespace std;

int main() {
    char s[1000];
    cin.getline(s, 1000);
    int n = strlen(s);
    // TODO: Đảo ngược chuỗi s tại chỗ (in-place)
    cout << s << endl;
    return 0;
}`
      },
      testCases: [
        { id: "1", input: "hello", expectedOutput: "olleh", isHidden: false },
        { id: "2", input: "a", expectedOutput: "a", isHidden: false },
        { id: "3", input: "abcde", expectedOutput: "edcba", isHidden: false }
      ]
    }
  ]
};

const it002: Subject = {
  id: "it002",
  code: "IT002",
  name: "Lập trình Hướng đối tượng (C++)",
  credits: 4,
  icon: "",
  color: "#a855f7",
  theory: [
    {
      title: "Chương 1 & 2: Tổng quan OOP",
      quiz: [
        { question: "Nguyên tắc nào KHÔNG thuộc 4 trụ cột OOP?", options: ["Encapsulation (Đóng gói)", "Inheritance (Kế thừa)", "Compilation (Biên dịch)", "Polymorphism (Đa hình)"], correct: 2, explanation: "4 trụ cột OOP: Encapsulation, Inheritance, Polymorphism, Abstraction. Compilation là quá trình biên dịch, không liên quan OOP." },
        { question: "Encapsulation (Đóng gói) có nghĩa là gì?", options: ["Kế thừa giữa các lớp", "Ẩn dữ liệu nội bộ, chỉ lộ giao diện cần thiết", "Một đối tượng có nhiều dạng", "Lớp không thể khởi tạo"], correct: 1, explanation: "Encapsulation: đóng gói dữ liệu (data) và hành vi (methods) vào một đơn vị, ẩn chi tiết nội bộ qua access modifiers (private, protected, public)." }
      ],
      content: `
<h3>2.1 Tại sao cần OOP?</h3>
<p>Lập trình thủ tục (procedural) cho các chương trình nhỏ. Khi quy mô lớn lên, code trở nên khó quản lý. OOP giải quyết bằng cách <strong>mô hình hóa thế giới thực</strong> thành các đối tượng.</p>
<p>So sánh:</p>
<table>
  <tr><th>Procedural</th><th>OOP</th></tr>
  <tr><td>Tập trung vào hàm/thủ tục</td><td>Tập trung vào đối tượng</td></tr>
  <tr><td>Data và function tách rời</td><td>Data và function gắn kết trong object</td></tr>
  <tr><td>Khó tái sử dụng</td><td>Dễ tái sử dụng qua kế thừa</td></tr>
  <tr><td>Khó bảo trì khi lớn</td><td>Dễ bảo trì, mở rộng</td></tr>
</table>

<h3>2.2 4 Trụ cột OOP</h3>
<ul>
  <li><strong>Encapsulation (Đóng gói):</strong> Gom dữ liệu + hành vi vào một lớp. Dùng access modifier để kiểm soát truy cập.</li>
  <li><strong>Inheritance (Kế thừa):</strong> Lớp con thừa hưởng thuộc tính và phương thức của lớp cha.</li>
  <li><strong>Polymorphism (Đa hình):</strong> Cùng interface, hành vi khác nhau tùy đối tượng.</li>
  <li><strong>Abstraction (Trừu tượng hóa):</strong> Ẩn chi tiết triển khai, chỉ lộ giao diện cần thiết.</li>
</ul>

<h3>2.3 Ví dụ thực tế: Hệ thống Ngân hàng</h3>
<pre><code>// Procedural: khó mở rộng
void deposit(double* balance, double amount) { *balance += amount; }
void withdraw(double* balance, double amount) { *balance -= amount; }

// OOP: rõ ràng, an toàn, dễ mở rộng
class BankAccount {
private:
    double balance;    // Ẩn dữ liệu nhạy cảm
    string owner;
    
public:
    BankAccount(string name, double initial) : owner(name), balance(initial) {}
    
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    
    bool withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false; // Không đủ tiền
    }
    
    double getBalance() const { return balance; } // Getter
};</code></pre>
      `
    },
    {
      title: "Chương 3 & 4: Class, Object, Constructor, Destructor",
      quiz: [
        { question: "Constructor có đặc điểm gì?", options: ["Phải có kiểu trả về void", "Cùng tên với class, không có kiểu trả về", "Phải có tham số", "Chỉ gọi được 1 lần trong chương trình"], correct: 1, explanation: "Constructor: tên GIỐNG tên class, KHÔNG có kiểu trả về (kể cả void). Tự động được gọi khi tạo object." },
        { question: "Destructor được gọi khi nào?", options: ["Khi tạo object", "Khi object bị hủy/ra khỏi scope", "Khi gọi thủ công", "Khi chương trình bắt đầu"], correct: 1, explanation: "Destructor tự động được gọi khi: object ra khỏi scope (với stack), hoặc khi gọi delete (với heap). Dùng để giải phóng tài nguyên." },
        { question: "Từ khóa this trong C++ là gì?", options: ["Trỏ đến lớp cha", "Con trỏ đến đối tượng hiện tại đang gọi method", "Từ khóa tạo object mới", "Từ khóa kế thừa"], correct: 1, explanation: "this là con trỏ ẩn trong mọi non-static method, trỏ đến object đang gọi method đó. Dùng để phân biệt member variable và local variable cùng tên." }
      ],
      content: `
<h3>3.1 Class và Object</h3>
<pre><code>// Class = Khuôn mẫu (blueprint)
class Circle {
private:
    double radius;   // Thuộc tính (attribute)
    
public:
    // Constructor: khởi tạo object
    Circle(double r) : radius(r) {}  // Initialization list
    
    // Destructor: dọn dẹp khi object bị hủy
    ~Circle() {
        // Giải phóng tài nguyên nếu cần
        cout << "Circle destroyed" << endl;
    }
    
    // Phương thức (method)
    double area() const {
        return 3.14159 * radius * radius;
    }
    
    void setRadius(double r) {
        if (r > 0) radius = r; // Validation!
    }
    
    double getRadius() const { return radius; } // Getter
};

// Object = Instance của class
int main() {
    Circle c1(5.0);           // Tạo trên stack
    Circle* c2 = new Circle(3.0); // Tạo trên heap
    
    cout << c1.area() << endl;    // Gọi method
    cout << c2->area() << endl;   // Dùng -> với con trỏ
    
    delete c2; // Phải delete heap object
    // c1 tự động bị hủy khi ra khỏi main()
    return 0;
}</code></pre>

<h3>3.2 Constructor overloading</h3>
<pre><code>class Student {
    string name;
    int age;
    double gpa;
    
public:
    Student() : name("Unknown"), age(0), gpa(0.0) {}  // Default constructor
    
    Student(string n, int a) : name(n), age(a), gpa(0.0) {}  // Partial
    
    Student(string n, int a, double g) : name(n), age(a), gpa(g) {}  // Full
    
    // Copy constructor
    Student(const Student& other) : name(other.name), age(other.age), gpa(other.gpa) {
        cout << "Copy constructor called" << endl;
    }
    
    // Copy assignment operator
    Student& operator=(const Student& other) {
        if (this != &other) { // Self-assignment check!
            name = other.name;
            age = other.age;
            gpa = other.gpa;
        }
        return *this;
    }
};</code></pre>

<h3>3.3 Hàm bạn (Friend Function) & Lớp bạn (Friend Class)</h3>
<pre><code>class Temperature {
private:
    double celsius;
    
public:
    Temperature(double c) : celsius(c) {}
    
    // Khai báo hàm bạn - có thể truy cập private members
    friend double toFahrenheit(Temperature t);
    friend class WeatherReport; // Lớp bạn
};

// Hàm bạn được định nghĩa ngoài class
double toFahrenheit(Temperature t) {
    return t.celsius * 9/5 + 32; // Truy cập được private celsius
}

// LƯU Ý: Friend phá vỡ Encapsulation - dùng hạn chế!</code></pre>

<h3>3.4 Static members</h3>
<pre><code>class Counter {
private:
    static int count;  // Chia sẻ giữa tất cả objects
    int id;
    
public:
    Counter() : id(++count) {}
    
    static int getCount() { return count; }  // Static method
    int getId() const { return id; }
};

int Counter::count = 0; // Khởi tạo static member ngoài class

int main() {
    Counter c1, c2, c3;
    cout << Counter::getCount(); // 3 - gọi qua tên class
}</code></pre>
      `
    },
    {
      title: "Chương 5: Đa năng hóa toán tử (Operator Overloading)",
      quiz: [
        { question: "Toán tử nào KHÔNG thể overload trong C++?", options: ["+", "==", "::", "<<"], correct: 2, explanation: ":: (scope resolution), . (member access), .* (pointer to member), ?: (ternary) KHÔNG thể overload. Còn lại hầu hết overload được." },
        { question: "Để overload toán tử << cho cout, hàm phải có dạng?", options: ["void operator<<()", "ostream& operator<<(ostream&, const ClassName&)", "ClassName operator<<()", "bool operator<<()"], correct: 1, explanation: "Phải là non-member function (hoặc friend), nhận ostream& và object, trả về ostream& để cho phép chain: cout << a << b;" }
      ],
      content: `
<h3>5.1 Operator Overloading là gì?</h3>
<p>Định nghĩa lại hành vi của toán tử có sẵn (+, -, ==, <<...) cho kiểu dữ liệu tự định nghĩa.</p>
<pre><code>class Vector2D {
public:
    double x, y;
    
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}
    
    // Overload +
    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }
    
    // Overload -
    Vector2D operator-(const Vector2D& other) const {
        return Vector2D(x - other.x, y - other.y);
    }
    
    // Overload == 
    bool operator==(const Vector2D& other) const {
        return (x == other.x && y == other.y);
    }
    
    // Overload +=
    Vector2D& operator+=(const Vector2D& other) {
        x += other.x; y += other.y;
        return *this;
    }
    
    // Overload << (non-member, friend)
    friend ostream& operator<<(ostream& os, const Vector2D& v) {
        os << "(" << v.x << ", " << v.y << ")";
        return os; // Cho phép chain: cout << v1 << v2
    }
    
    // Subscript operator []
    double& operator[](int idx) {
        if (idx == 0) return x;
        if (idx == 1) return y;
        throw out_of_range("Index out of range");
    }
};

int main() {
    Vector2D v1(1, 2), v2(3, 4);
    Vector2D v3 = v1 + v2;  // Gọi operator+
    cout << v3;              // (4, 6) - Gọi operator<<
    cout << (v1 == v2);      // 0 (false)
}</code></pre>

<h3>5.2 Prefix vs Postfix Increment</h3>
<pre><code>class MyInt {
    int val;
public:
    MyInt(int v) : val(v) {}
    
    // Prefix ++x (trả về reference)
    MyInt& operator++() {
        ++val;
        return *this;
    }
    
    // Postfix x++ (có tham số int giả, trả về bản sao cũ)
    MyInt operator++(int) {
        MyInt old(*this); // Lưu bản cũ
        ++val;
        return old;       // Trả về bản cũ
    }
};</code></pre>

<h3>5.3 Nguyên tắc thiết kế</h3>
<ul>
  <li>Đừng overload nếu ý nghĩa không tự nhiên (người đọc không đoán được làm gì).</li>
  <li>Nên giữ nguyên tắc: <code>a + b</code> không nên thay đổi a hay b.</li>
  <li>Luôn overload cặp: nếu có <code>==</code> thì nên có <code>!=</code>; nếu có <code>&lt;</code> thì nên có đủ 6 phép so sánh.</li>
</ul>
      `
    },
    {
      title: "Chương 6: Kế thừa (Inheritance)",
      quiz: [
        { question: "Trong public inheritance, member protected của lớp cha trở thành gì trong lớp con?", options: ["public", "protected", "private", "Không kế thừa được"], correct: 1, explanation: "Public inheritance: public → public, protected → protected. Lớp con vẫn có thể dùng protected members của cha." },
        { question: "Vấn đề Diamond Problem xảy ra ở đâu?", options: ["Single inheritance", "Multiple inheritance với lớp cha chung", "Không có kế thừa", "Inheritance với abstract class"], correct: 1, explanation: "Diamond Problem: lớp D kế thừa từ B và C, cả B và C đều kế thừa từ A. D có 2 bản sao của A. Giải quyết bằng virtual inheritance." },
        { question: "Constructor của lớp cha được gọi khi nào?", options: ["Không bao giờ", "Sau constructor của lớp con", "Trước constructor của lớp con", "Phải gọi thủ công bằng super()"], correct: 2, explanation: "Trong C++, constructor cha luôn chạy TRƯỚC constructor con. Gọi tường minh qua initialization list: ChildClass() : ParentClass() {}" }
      ],
      content: `
<h3>6.1 Cơ bản về Kế thừa</h3>
<pre><code>class Animal {
protected:
    string name;
    int age;
    
public:
    Animal(string n, int a) : name(n), age(a) {}
    
    void breathe() { cout << name << " đang thở" << endl; }
    void eat() { cout << name << " đang ăn" << endl; }
    
    virtual void makeSound() { // virtual - cho phép override
        cout << "... (tiếng kêu chung)" << endl;
    }
    
    virtual ~Animal() {} // Virtual destructor - rất quan trọng!
};

// Public inheritance: IS-A relationship (Dog IS-A Animal)
class Dog : public Animal {
private:
    string breed;
    
public:
    Dog(string n, int a, string b) : Animal(n, a), breed(b) {}
    
    void makeSound() override { // override rõ ràng
        cout << name << ": Woof!" << endl;
    }
    
    void fetch() { cout << name << " đang nhặt bóng" << endl; }
};

class Cat : public Animal {
public:
    Cat(string n, int a) : Animal(n, a) {}
    
    void makeSound() override {
        cout << name << ": Meow!" << endl;
    }
};</code></pre>

<h3>6.2 Access Modifiers trong Inheritance</h3>
<table>
  <tr><th>Member trong Base</th><th>public inherit</th><th>protected inherit</th><th>private inherit</th></tr>
  <tr><td>public</td><td>public</td><td>protected</td><td>private</td></tr>
  <tr><td>protected</td><td>protected</td><td>protected</td><td>private</td></tr>
  <tr><td>private</td><td>Không kế thừa</td><td>Không kế thừa</td><td>Không kế thừa</td></tr>
</table>

<h3>6.3 Đa kế thừa và Diamond Problem</h3>
<pre><code>class A {
public:
    void hello() { cout << "A::hello" << endl; }
};

class B : virtual public A {}; // virtual inheritance
class C : virtual public A {}; // virtual inheritance

class D : public B, public C {
    // Chỉ có 1 bản sao của A nhờ virtual inheritance
};

D d;
d.hello(); // Không ambiguous nhờ virtual
// d.A::hello(); // Tường minh nếu muốn</code></pre>
      `
    },
    {
      title: "Chương 7: Đa hình (Polymorphism)",
      quiz: [
        { question: "Late binding (dynamic dispatch) xảy ra với?", options: ["Hàm thông thường", "Hàm virtual", "Hàm inline", "Hàm static"], correct: 1, explanation: "Virtual functions dùng vtable để resolve tại runtime (late binding), cho phép đúng hàm của đối tượng thực được gọi qua con trỏ/tham chiếu lớp cha." },
        { question: "Pure virtual function được khai báo như thế nào?", options: ["virtual void f() {}", "void f() = 0;", "virtual void f() = 0;", "abstract void f();"], correct: 2, explanation: "Pure virtual: virtual void f() = 0; Lớp chứa ít nhất 1 pure virtual trở thành Abstract Class - không thể tạo instance trực tiếp." },
        { question: "Tại sao destructor của lớp cha nên là virtual?", options: ["Tăng hiệu năng", "Đảm bảo destructor của lớp con được gọi khi delete qua pointer lớp cha", "Bắt buộc theo chuẩn C++", "Để sử dụng override"], correct: 1, explanation: "Nếu destructor cha không virtual: delete pBase; chỉ gọi destructor cha, bỏ qua destructor con → memory leak. Virtual destructor đảm bảo chuỗi destructor đúng." }
      ],
      content: `
<h3>7.1 Polymorphism qua Virtual Functions</h3>
<pre><code>#include <iostream>
#include <vector>
using namespace std;

class Shape {
public:
    virtual double area() const = 0;   // Pure virtual
    virtual double perimeter() const = 0;
    virtual void draw() const { cout << "Drawing shape..." << endl; }
    virtual ~Shape() {}  // PHẢI là virtual!
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
    double perimeter() const override { return 2 * (width + height); }
    void draw() const override { cout << "Drawing Rectangle " << width << "x" << height << endl; }
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
    double perimeter() const override { return 2 * 3.14159 * radius; }
    void draw() const override { cout << "Drawing Circle r=" << radius << endl; }
};

// Tính tổng diện tích - hoạt động với bất kỳ Shape nào!
double totalArea(vector<Shape*>& shapes) {
    double total = 0;
    for (Shape* s : shapes) {
        total += s->area(); // Late binding: gọi đúng hàm của đối tượng thực
    }
    return total;
}

int main() {
    vector<Shape*> shapes;
    shapes.push_back(new Rectangle(3, 4));  // area = 12
    shapes.push_back(new Circle(5));        // area ≈ 78.5
    shapes.push_back(new Rectangle(2, 6));  // area = 12
    
    for (Shape* s : shapes) s->draw();
    
    cout << "Total area: " << totalArea(shapes) << endl;
    
    for (Shape* s : shapes) delete s; // Destructor virtual → gọi đúng
}</code></pre>

<h3>7.2 vtable (Virtual Table) - Hoạt động bên trong</h3>
<p>Mỗi class có virtual function có một <strong>vtable</strong> (bảng con trỏ hàm). Mỗi object có <strong>vptr</strong> trỏ vào vtable của class thực của nó.</p>
<pre><code>// Khi gọi ptr->area():
// 1. Lấy vptr từ object
// 2. Tìm trong vtable entry của area()  
// 3. Nhảy đến đúng hàm

// Chi phí: mỗi virtual call có overhead nhỏ (1 indirect call)
// Trong code performance-critical, tránh virtual nếu có thể</code></pre>

<h3>7.3 dynamic_cast và RTTI</h3>
<pre><code>Shape* s = new Circle(5);

// Kiểm tra runtime type
Circle* c = dynamic_cast<Circle*>(s);
if (c != nullptr) {
    cout << "Đây là Circle, radius = " << c->getRadius();
}

// Nếu cast thất bại, dynamic_cast trả về nullptr (với pointer)
// Hoặc throw bad_cast (với reference)</code></pre>
      `
    }
  ],
  exercises: [
    {
      id: "ex_it002_1",
      title: "Triển khai Stack bằng Class",
      difficulty: "Medium",
      description: `<p>Triển khai cấu trúc dữ liệu Stack bằng class C++, hỗ trợ:</p>
<ul>
  <li><code>push(x)</code>: thêm x vào đỉnh stack</li>
  <li><code>pop()</code>: xóa và trả về phần tử đỉnh</li>
  <li><code>top()</code>: xem phần tử đỉnh (không xóa)</li>
  <li><code>isEmpty()</code>: kiểm tra stack rỗng</li>
  <li><code>size()</code>: số phần tử</li>
</ul>
<p><strong>Input format (mỗi dòng là 1 lệnh):</strong></p>
<pre>PUSH 5
PUSH 3
TOP
POP
SIZE</pre>
<p><strong>Output:</strong> Kết quả của TOP, POP, SIZE</p>`,
      hint: "Dùng mảng nội bộ (internal array) với biến top_idx. Xử lý edge case: pop khi rỗng.",
      edgeCases: ["Pop khi stack rỗng → in 'EMPTY'", "Top khi stack rỗng → in 'EMPTY'"],
      starterCode: {
        cpp: `#include <iostream>
using namespace std;

class Stack {
private:
    int data[1000];
    int top_idx;
    
public:
    Stack() : top_idx(-1) {}
    
    void push(int x) {
        // TODO
    }
    
    int pop() {
        // TODO: trả về -1 nếu rỗng
    }
    
    int top() const {
        // TODO: trả về -1 nếu rỗng
    }
    
    bool isEmpty() const {
        // TODO
    }
    
    int size() const {
        // TODO
    }
};

int main() {
    Stack s;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "PUSH") {
            int x; cin >> x;
            s.push(x);
        } else if (cmd == "POP") {
            if (s.isEmpty()) cout << "EMPTY" << endl;
            else cout << s.pop() << endl;
        } else if (cmd == "TOP") {
            if (s.isEmpty()) cout << "EMPTY" << endl;
            else cout << s.top() << endl;
        } else if (cmd == "SIZE") {
            cout << s.size() << endl;
        }
    }
}`
      },
      testCases: [
        { id: "1", input: "PUSH 5\nPUSH 3\nTOP\nPOP\nSIZE", expectedOutput: "3\n3\n1", isHidden: false },
        { id: "2", input: "POP", expectedOutput: "EMPTY", isHidden: false },
        { id: "3", input: "PUSH 1\nPUSH 2\nPUSH 3\nPOP\nPOP\nPOP\nPOP", expectedOutput: "3\n2\n1\nEMPTY", isHidden: false }
      ]
    }
  ]
};

const it003: Subject = {
  id: "it003",
  code: "IT003",
  name: "Cấu trúc Dữ liệu và Giải thuật",
  credits: 4,
  icon: "",
  color: "#22c55e",
  theory: [
    {
      title: "Chương 1: Độ phức tạp thuật toán (Big O)",
      quiz: [
        { question: "O(log n) tương ứng với thuật toán nào?", options: ["Linear Search", "Binary Search", "Bubble Sort", "DFS"], correct: 1, explanation: "Binary Search mỗi bước loại bỏ nửa mảng → sau log₂n bước là xong. Đây là ví dụ kinh điển của O(log n)." },
        { question: "Sắp xếp nhanh nhất về Big O trong trường hợp trung bình là?", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], correct: 1, explanation: "Merge Sort, Quick Sort (avg case), Heap Sort đều đạt O(n log n). Đây là giới hạn dưới lý thuyết cho comparison-based sorting." },
        { question: "Quy hoạch động (Dynamic Programming) giải quyết vấn đề nào?", options: ["Đồ thị không trọng số", "Bài toán có overlapping subproblems và optimal substructure", "Chỉ bài toán sắp xếp", "Chỉ bài toán tìm kiếm"], correct: 1, explanation: "DP lưu kết quả các bài toán con (memoization/tabulation) để tránh tính lại. Điều kiện: overlapping subproblems + optimal substructure." }
      ],
      content: `
<h3>1.1 Tại sao cần đánh giá thuật toán?</h3>
<p>Cùng một bài toán có nhiều cách giải. Ta cần tiêu chí khách quan để so sánh: <strong>Thời gian chạy</strong> và <strong>Bộ nhớ sử dụng</strong>.</p>
<p>Big O notation mô tả tốc độ tăng của thời gian/bộ nhớ theo kích thước input n.</p>

<h3>1.2 Các mức Big O phổ biến</h3>
<table>
  <tr><th>Big O</th><th>Tên</th><th>Ví dụ</th><th>n=10⁶</th></tr>
  <tr><td>O(1)</td><td>Hằng số</td><td>Truy cập mảng, Hash table</td><td>Tức thì</td></tr>
  <tr><td>O(log n)</td><td>Logarithmic</td><td>Binary Search, BST</td><td>~20 bước</td></tr>
  <tr><td>O(n)</td><td>Tuyến tính</td><td>Linear Search, duyệt mảng</td><td>10⁶ bước</td></tr>
  <tr><td>O(n log n)</td><td>Linearithmic</td><td>Merge Sort, Heap Sort</td><td>~2×10⁷</td></tr>
  <tr><td>O(n²)</td><td>Bình phương</td><td>Bubble Sort, Selection Sort</td><td>10¹² bước </td></tr>
  <tr><td>O(2ⁿ)</td><td>Mũ</td><td>Brute-force subset</td><td>Không khả thi</td></tr>
</table>

<h3>1.3 Tính Big O</h3>
<pre><code>// O(1) - không phụ thuộc n
int getFirst(int a[], int n) {
    return a[0]; // 1 phép toán
}

// O(n) - 1 vòng lặp
int sum(int a[], int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i]; // n lần
    return s;
}

// O(n²) - 2 vòng lặp lồng nhau
bool hasDuplicate(int a[], int n) {
    for (int i = 0; i < n; i++)          // n lần
        for (int j = i+1; j < n; j++)   // ~n/2 lần
            if (a[i] == a[j]) return true;
    return false;
}
// Tối ưu thành O(n) bằng Hash Set!

// O(log n) - chia đôi mỗi bước
int binarySearch(int a[], int n, int target) {
    int lo = 0, hi = n-1;
    while (lo <= hi) {
        int mid = lo + (hi-lo)/2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}</code></pre>

<h3>1.4 Các chiến lược thiết kế thuật toán</h3>
<ul>
  <li><strong>Chia để trị (Divide & Conquer):</strong> Chia bài toán thành bài toán con nhỏ hơn, giải từng phần, ghép kết quả. Ví dụ: Merge Sort, Quick Sort, Binary Search.</li>
  <li><strong>Quy hoạch động (Dynamic Programming):</strong> Lưu kết quả bài toán con đã tính. Ví dụ: Fibonacci, Knapsack, LCS.</li>
  <li><strong>Tham lam (Greedy):</strong> Luôn chọn lựa tốt nhất hiện tại. Không phải lúc nào cũng đúng. Ví dụ: Dijkstra, Kruskal, Huffman.</li>
  <li><strong>Quay lui (Backtracking):</strong> Thử tất cả khả năng, quay lại khi không hợp lệ. Ví dụ: N-Queens, Sudoku solver.</li>
</ul>

<h3>1.5 Ví dụ: Fibonacci với 3 cách</h3>
<pre><code>// Cách 1: Đệ quy thuần - O(2^n) CHẬM!
int fib1(int n) {
    if (n <= 1) return n;
    return fib1(n-1) + fib1(n-2);
}

// Cách 2: Memoization (Top-down DP) - O(n)
int memo[100] = {};
int fib2(int n) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fib2(n-1) + fib2(n-2);
}

// Cách 3: Tabulation (Bottom-up DP) - O(n) time, O(1) space
int fib3(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b;
        a = b; b = c;
    }
    return b;
}</code></pre>
      `
    },
    {
      title: "Chương 2: Tìm kiếm & Sắp xếp",
      quiz: [
        { question: "Quick Sort có worst case là bao nhiêu?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 1, explanation: "Quick Sort worst case là O(n²) khi pivot luôn là phần tử lớn nhất/nhỏ nhất (mảng đã sort). Tránh bằng cách random pivot hoặc median-of-3." },
        { question: "Merge Sort có đặc điểm gì so với Quick Sort?", options: ["Nhanh hơn trong mọi trường hợp", "Stable và O(n log n) mọi trường hợp nhưng cần O(n) bộ nhớ phụ", "Không cần so sánh", "In-place, không cần bộ nhớ phụ"], correct: 1, explanation: "Merge Sort: stable (giữ thứ tự phần tử bằng nhau), luôn O(n log n), nhưng cần O(n) bộ nhớ phụ để merge. Quick Sort thường nhanh hơn trong thực tế nhưng không stable." }
      ],
      content: `
<h3>2.1 Các thuật toán sắp xếp quan trọng</h3>
<pre><code>// Selection Sort - O(n²) - không stable
void selectionSort(int a[], int n) {
    for (int i = 0; i < n-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < n; j++)
            if (a[j] < a[minIdx]) minIdx = j;
        swap(a[i], a[minIdx]);
    }
}

// Insertion Sort - O(n²) avg, O(n) best (gần sorted) - stable
void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i-1;
        while (j >= 0 && a[j] > key) {
            a[j+1] = a[j]; j--;
        }
        a[j+1] = key;
    }
}

// Merge Sort - O(n log n) mọi TH - stable
void merge(int a[], int l, int m, int r) {
    vector<int> left(a+l, a+m+1);
    vector<int> right(a+m+1, a+r+1);
    int i=0, j=0, k=l;
    while (i < left.size() && j < right.size())
        a[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
    while (i < left.size()) a[k++] = left[i++];
    while (j < right.size()) a[k++] = right[j++];
}
void mergeSort(int a[], int l, int r) {
    if (l < r) {
        int m = l + (r-l)/2;
        mergeSort(a, l, m);
        mergeSort(a, m+1, r);
        merge(a, l, m, r);
    }
}

// Quick Sort - O(n log n) avg, O(n²) worst - không stable
int partition(int a[], int l, int r) {
    int pivot = a[r], i = l-1;
    for (int j = l; j < r; j++) {
        if (a[j] <= pivot) { i++; swap(a[i], a[j]); }
    }
    swap(a[i+1], a[r]);
    return i+1;
}
void quickSort(int a[], int l, int r) {
    if (l < r) {
        int pi = partition(a, l, r);
        quickSort(a, l, pi-1);
        quickSort(a, pi+1, r);
    }
}</code></pre>

<h3>2.2 So sánh các thuật toán sắp xếp</h3>
<table>
  <tr><th>Thuật toán</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr>
  <tr><td>Bubble Sort</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
  <tr><td>Selection Sort</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>No</td></tr>
  <tr><td>Insertion Sort</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>Yes</td></tr>
  <tr><td>Merge Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Yes</td></tr>
  <tr><td>Quick Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>No</td></tr>
  <tr><td>Heap Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(1)</td><td>No</td></tr>
</table>
      `
    },
    {
      title: "Chương 3: CTDL Động - LinkedList, Stack, Queue",
      quiz: [
        { question: "Ưu điểm chính của Linked List so với Array là?", options: ["Truy cập ngẫu nhiên O(1)", "Chèn/xóa ở đầu O(1)", "Ít bộ nhớ hơn", "Cache-friendly hơn"], correct: 1, explanation: "LinkedList: chèn/xóa O(1) (chỉ thay đổi pointer). Array: chèn/xóa O(n) vì cần dịch chuyển phần tử. Nhưng array truy cập ngẫu nhiên O(1) còn LinkedList O(n)." },
        { question: "Stack dùng nguyên tắc nào?", options: ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Priority based", "Random access"], correct: 1, explanation: "Stack: LIFO - phần tử vào sau sẽ ra trước. Như chồng đĩa - chỉ lấy được đĩa trên cùng." },
        { question: "Ứng dụng kinh điển của Stack là?", options: ["BFS trên đồ thị", "Kiểm tra ngoặc hợp lệ", "Tìm đường ngắn nhất", "Sort mảng"], correct: 1, explanation: "Stack dùng để kiểm tra ngoặc hợp lệ: push khi gặp ngoặc mở, pop và so sánh khi gặp ngoặc đóng. Cũng dùng trong: DFS, undo/redo, function call stack." }
      ],
      content: `
<h3>3.1 Danh sách liên kết đơn (Singly Linked List)</h3>
<pre><code>struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
    
public:
    LinkedList() : head(nullptr) {}
    
    ~LinkedList() {
        while (head) {
            Node* tmp = head;
            head = head->next;
            delete tmp;
        }
    }
    
    // Chèn đầu - O(1)
    void pushFront(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
    
    // Chèn cuối - O(n)
    void pushBack(int val) {
        Node* newNode = new Node(val);
        if (!head) { head = newNode; return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = newNode;
    }
    
    // Xóa node theo giá trị - O(n)
    void remove(int val) {
        if (!head) return;
        if (head->data == val) {
            Node* tmp = head;
            head = head->next;
            delete tmp; return;
        }
        Node* cur = head;
        while (cur->next && cur->next->data != val)
            cur = cur->next;
        if (cur->next) {
            Node* tmp = cur->next;
            cur->next = tmp->next;
            delete tmp;
        }
    }
    
    // Đảo ngược linked list - O(n)
    void reverse() {
        Node *prev = nullptr, *cur = head, *next = nullptr;
        while (cur) {
            next = cur->next;
            cur->next = prev;
            prev = cur;
            cur = next;
        }
        head = prev;
    }
    
    void print() {
        Node* cur = head;
        while (cur) { cout << cur->data << " -> "; cur = cur->next; }
        cout << "NULL" << endl;
    }
};</code></pre>

<h3>3.2 Stack - Ứng dụng kiểm tra ngoặc</h3>
<pre><code>bool isValidBrackets(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return st.empty(); // Stack rỗng là hợp lệ
}
// "({[]})" → true
// "({[}])" → false</code></pre>

<h3>3.3 Queue - Hàng đợi</h3>
<pre><code>class Queue {
    deque<int> data;
public:
    void enqueue(int x) { data.push_back(x); }  // O(1)
    int dequeue() {                               // O(1)
        if (data.empty()) throw runtime_error("Queue empty");
        int front = data.front();
        data.pop_front();
        return front;
    }
    bool empty() const { return data.empty(); }
};

// BFS dùng Queue (xem thêm chương Đồ thị)
// Ứng dụng: CPU task scheduling, print queue, BFS</code></pre>
      `
    },
    {
      title: "Chương 4: Cây (Tree) - BST, B-Tree",
      quiz: [
        { question: "In-order traversal của BST cho ra kết quả gì?", options: ["Các node theo thứ tự ngẫu nhiên", "Các node theo thứ tự tăng dần", "Chỉ các node lá", "Các node theo level"], correct: 1, explanation: "In-order BST: Trái → Gốc → Phải. Vì BST property (trái < gốc < phải), in-order luôn cho dãy tăng dần." },
        { question: "Balanced BST (như AVL) đảm bảo điều gì?", options: ["Tất cả lá cùng độ sâu", "Chiều cao O(log n), đảm bảo tìm kiếm O(log n)", "Tìm kiếm O(1)", "Không cần pointer"], correct: 1, explanation: "AVL Tree/Red-Black Tree tự cân bằng sau insert/delete để chiều cao luôn O(log n). Đảm bảo search/insert/delete đều O(log n)." }
      ],
      content: `
<h3>4.1 Cây nhị phân (Binary Tree)</h3>
<pre><code>struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// 3 cách duyệt cây nhị phân
void inorder(TreeNode* root) {   // Trái - Gốc - Phải
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}

void preorder(TreeNode* root) {  // Gốc - Trái - Phải
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}

void postorder(TreeNode* root) { // Trái - Phải - Gốc
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}

// Level-order (BFS)
void levelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        cout << node->val << " ";
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
}</code></pre>

<h3>4.2 Binary Search Tree (BST)</h3>
<pre><code>class BST {
    TreeNode* root = nullptr;
    
    TreeNode* insert(TreeNode* node, int val) {
        if (!node) return new TreeNode(val);
        if (val < node->val) node->left = insert(node->left, val);
        else if (val > node->val) node->right = insert(node->right, val);
        // val == node->val: không chèn duplicate
        return node;
    }
    
    bool search(TreeNode* node, int val) {
        if (!node) return false;
        if (val == node->val) return true;
        if (val < node->val) return search(node->left, val);
        return search(node->right, val);
    }
    
public:
    void insert(int val) { root = insert(root, val); }
    bool search(int val) { return search(root, val); }
};

// BST Operations:
// Average: O(log n) - khi cây cân bằng
// Worst:   O(n) - khi cây lệch (degenerate) như linked list!</code></pre>

<h3>4.3 Chiều cao và số node</h3>
<pre><code>int height(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(height(root->left), height(root->right));
}

int countNodes(TreeNode* root) {
    if (!root) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}

// Kiểm tra cây cân bằng
bool isBalanced(TreeNode* root) {
    if (!root) return true;
    int lh = height(root->left);
    int rh = height(root->right);
    return abs(lh - rh) <= 1 && isBalanced(root->left) && isBalanced(root->right);
}</code></pre>
      `
    },
    {
      title: "Chương 5: Bảng băm (Hash Table)",
      quiz: [
        { question: "Collision trong Hash Table xảy ra khi nào?", options: ["Mảng đầy", "Hai key khác nhau có cùng hash value", "Key không tồn tại", "Hash function bị lỗi"], correct: 1, explanation: "Collision: hai key khác nhau nhưng hash(key1) == hash(key2). Không thể tránh hoàn toàn (Birthday Paradox). Giải quyết bằng Chaining hoặc Open Addressing." },
        { question: "Load factor của Hash Table là gì?", options: ["Kích thước của bảng", "Số phần tử / Kích thước bảng", "Số collision đã xảy ra", "Thời gian tìm kiếm"], correct: 1, explanation: "Load factor = n/m (n: số phần tử, m: kích thước bảng). Load factor cao → nhiều collision → hiệu năng giảm. Thường resize khi load factor > 0.75." }
      ],
      content: `
<h3>5.1 Hash Table - Ý tưởng</h3>
<p>Hash Table dùng hàm hash để ánh xạ key → index trong mảng. Cho phép tìm kiếm, chèn, xóa trung bình <strong>O(1)</strong>.</p>
<pre><code>// Hàm hash đơn giản cho string
int hashString(string key, int tableSize) {
    int hash = 0;
    for (char c : key) {
        hash = (hash * 31 + c) % tableSize;
    }
    return hash;
}

// Trong thực tế: dùng unordered_map<> của C++ STL
#include <unordered_map>
unordered_map<string, int> freq;
freq["hello"]++;
freq["world"]++;
cout << freq["hello"]; // 1</code></pre>

<h3>5.2 Xử lý Collision</h3>
<pre><code>// Phương pháp 1: Chaining (Separate Chaining)
// Mỗi slot là một Linked List
class HashTableChaining {
    vector<list<pair<int,int>>> table;
    int size;
    
    int hash(int key) { return key % size; }
    
public:
    HashTableChaining(int s) : size(s), table(s) {}
    
    void put(int key, int value) {
        int h = hash(key);
        for (auto& p : table[h]) {
            if (p.first == key) { p.second = value; return; }
        }
        table[h].push_back({key, value});
    }
    
    int get(int key) {
        int h = hash(key);
        for (auto& p : table[h]) {
            if (p.first == key) return p.second;
        }
        return -1; // Not found
    }
};

// Phương pháp 2: Open Addressing (Linear Probing)
// Khi collision, tìm slot trống kế tiếp
void put(int key, int value) {
    int h = hash(key);
    while (table[h].occupied && table[h].key != key) {
        h = (h + 1) % size; // Linear probing
    }
    table[h] = {key, value, true};
}</code></pre>

<h3>5.3 Ứng dụng Hash Table</h3>
<pre><code>// Đếm tần suất xuất hiện
map<char, int> frequency(string s) {
    map<char, int> freq;
    for (char c : s) freq[c]++;
    return freq;
}

// Tìm 2 số có tổng bằng target - O(n) dùng hash
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen; // value -> index
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}</code></pre>
      `
    },
    {
      title: "Chương 6: Đồ thị (Graph) - BFS, DFS, Dijkstra",
      quiz: [
        { question: "BFS tìm đường đi ngắn nhất trong trường hợp nào?", options: ["Đồ thị có trọng số", "Đồ thị không trọng số (unweighted)", "Đồ thị có trọng số âm", "Mọi trường hợp"], correct: 1, explanation: "BFS tìm đường đi ngắn nhất (về số cạnh) trong đồ thị KHÔNG có trọng số. Với đồ thị có trọng số dùng Dijkstra. Với trọng số âm dùng Bellman-Ford." },
        { question: "Độ phức tạp của Dijkstra với Priority Queue là?", options: ["O(V²)", "O(E log V)", "O(VE)", "O(V + E)"], correct: 1, explanation: "Dijkstra với min-heap priority queue: O((V + E) log V) ≈ O(E log V). Không dùng PQ: O(V²). V: số đỉnh, E: số cạnh." }
      ],
      content: `
<h3>6.1 Biểu diễn đồ thị</h3>
<pre><code>int n = 5; // số đỉnh
// Adjacency Matrix: O(V²) space
int adj[5][5] = {}; // adj[u][v] = 1 nếu có cạnh u-v

// Adjacency List: O(V + E) space - thường dùng hơn
vector<vector<int>> adjList(n);
void addEdge(int u, int v) {
    adjList[u].push_back(v);
    adjList[v].push_back(u); // Đồ thị vô hướng
}

// Đồ thị có trọng số
vector<vector<pair<int,int>>> wAdj(n); // {vertex, weight}
void addWeightedEdge(int u, int v, int w) {
    wAdj[u].push_back({v, w});
    wAdj[v].push_back({u, w});
}</code></pre>

<h3>6.2 DFS - Depth First Search</h3>
<pre><code>vector<bool> visited(n, false);

void dfs(int u, vector<vector<int>>& adj) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v, adj);
    }
}
// DFS dùng: Phát hiện cycle, topological sort, connected components

// DFS iterative (dùng stack thay đệ quy)
void dfsIterative(int start, vector<vector<int>>& adj) {
    stack<int> st;
    vector<bool> vis(n, false);
    st.push(start); vis[start] = true;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        cout << u << " ";
        for (int v : adj[u]) {
            if (!vis[v]) { vis[v] = true; st.push(v); }
        }
    }
}</code></pre>

<h3>6.3 BFS - Breadth First Search</h3>
<pre><code>void bfs(int start, vector<vector<int>>& adj) {
    queue<int> q;
    vector<bool> vis(n, false);
    q.push(start); vis[start] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u]) {
            if (!vis[v]) { vis[v] = true; q.push(v); }
        }
    }
}

// BFS tìm đường đi ngắn nhất (số cạnh)
vector<int> shortestPath(int src, int dst, vector<vector<int>>& adj) {
    vector<int> dist(n, -1), parent(n, -1);
    queue<int> q;
    dist[src] = 0; q.push(src);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                parent[v] = u;
                q.push(v);
            }
        }
    }
    // Truy ngược path từ dst về src
    vector<int> path;
    for (int v = dst; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return path;
}</code></pre>

<h3>6.4 Dijkstra - Đường đi ngắn nhất có trọng số</h3>
<pre><code>vector<int> dijkstra(int src, vector<vector<pair<int,int>>>& adj) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    dist[src] = 0;
    pq.push({0, src}); // {distance, vertex}
    
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue; // Đã tìm được đường tốt hơn
        
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
// KHÔNG dùng với cạnh trọng số âm!</code></pre>
      `
    }
  ],
  exercises: [
    {
      id: "ex_it003_1",
      title: "Two Sum - Hash Map O(N)",
      difficulty: "Medium",
      description: `<p>Cho mảng <code>nums</code> và số nguyên <code>target</code>. Tìm 2 chỉ số <code>i, j</code> sao cho <code>nums[i] + nums[j] == target</code>. Bắt buộc giải <strong>O(N)</strong>.</p>
<p><strong>Input:</strong> Dòng 1: N và target. Dòng 2: N số nguyên.</p>
<p><strong>Output:</strong> Hai chỉ số i j (i &lt; j), cách nhau dấu cách.</p>
<pre>Input: 4 9
2 7 11 15
Output: 0 1</pre>`,
      hint: "Dùng unordered_map lưu {giá_trị → chỉ_số}. Với mỗi nums[i], kiểm tra xem (target - nums[i]) đã trong map chưa.",
      realWorldScenario: "Hash Map dùng trong: cache (Redis), routing table mạng, biên dịch symbol table.",
      edgeCases: ["Không có cặp nào thỏa mãn", "Cùng phần tử (nums[i] + nums[i] = target) - phải kiểm tra j != i"],
      starterCode: {
        cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;
    
    vector<int> nums(n);
    for(int i = 0; i < n; i++) cin >> nums[i];
    
    unordered_map<int, int> seen; // {value -> index}
    
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        // TODO: Kiểm tra xem complement có trong seen không
        // Nếu có: in ra chỉ số và kết thúc
        // Nếu không: thêm nums[i] vào seen
    }
    
    return 0;
}`,
        python: `def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        # TODO: Kiểm tra complement trong seen
        pass
    return []

line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))
result = two_sum(nums, target)
print(result[0], result[1])`
      },
      testCases: [
        { id: "1", input: "4 9\n2 7 11 15", expectedOutput: "0 1", isHidden: false },
        { id: "2", input: "3 6\n3 2 4", expectedOutput: "1 2", isHidden: false },
        { id: "3", input: "2 6\n3 3", expectedOutput: "0 1", isHidden: false },
        { id: "4", input: "5 10\n1 2 3 4 6", expectedOutput: "3 4", isHidden: true }
      ]
    },
    {
      id: "ex_it003_2",
      title: "Maximum Subarray (Kadane's Algorithm)",
      difficulty: "Medium",
      description: `<p>Tìm tổng lớn nhất của dãy con liên tiếp (subarray) trong mảng. Bắt buộc giải <strong>O(N)</strong> bằng Kadane's Algorithm.</p>
<p><strong>Input:</strong> Dòng 1: N. Dòng 2: N số nguyên (có thể âm).</p>
<p><strong>Output:</strong> Tổng lớn nhất.</p>
<pre>Input: 8
-2 1 -3 4 -1 2 1 -5 4
Output: 6   (subarray [4,-1,2,1])</pre>`,
      hint: "Kadane: max_ending_here = max(nums[i], max_ending_here + nums[i]). Tổng kết thúc tại i hoặc bắt đầu mới từ i.",
      edgeCases: ["Tất cả phần tử âm: kết quả là phần tử lớn nhất (không phải 0)", "Mảng 1 phần tử"],
      starterCode: {
        cpp: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    // TODO: Kadane's algorithm
    int maxSum = INT_MIN;
    int currentSum = 0;
    
    // Gợi ý:
    // for each nums[i]:
    //   currentSum = max(nums[i], currentSum + nums[i])
    //   maxSum = max(maxSum, currentSum)
    
    cout << maxSum << endl;
    return 0;
}`
      },
      testCases: [
        { id: "1", input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
        { id: "2", input: "4\n-1 -2 -3 -4", expectedOutput: "-1", isHidden: false },
        { id: "3", input: "1\n5", expectedOutput: "5", isHidden: false },
        { id: "4", input: "5\n1 2 3 4 5", expectedOutput: "15", isHidden: false }
      ]
    },
    {
      id: "ex_it003_3",
      title: "Đường đi ngắn nhất BFS",
      difficulty: "Hard",
      description: `<p>Cho đồ thị vô hướng không trọng số. Tìm đường đi ngắn nhất (số cạnh) từ đỉnh S đến đỉnh T.</p>
<p><strong>Input:</strong><br/>Dòng 1: V (đỉnh), E (cạnh), S (nguồn), T (đích)<br/>E dòng tiếp: u v (cạnh giữa u và v)</p>
<p><strong>Output:</strong> Số cạnh ngắn nhất. In -1 nếu không có đường.</p>
<pre>Input: 4 4 0 3
0 1
0 2
1 3
2 3
Output: 2</pre>`,
      hint: "Dùng BFS với mảng dist[] khởi tạo -1. Enqueue source với dist=0. Mỗi khi visit đỉnh mới, dist[v] = dist[u]+1.",
      edgeCases: ["S == T: kết quả là 0", "Không có đường đi: in -1", "Đồ thị không liên thông"],
      starterCode: {
        cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int V, E, S, T;
    cin >> V >> E >> S >> T;
    
    vector<vector<int>> adj(V);
    for (int i = 0; i < E; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    
    // TODO: BFS từ S đến T
    vector<int> dist(V, -1);
    queue<int> q;
    dist[S] = 0;
    q.push(S);
    
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    
    cout << dist[T] << endl;
    return 0;
}`
      },
      testCases: [
        { id: "1", input: "4 4 0 3\n0 1\n0 2\n1 3\n2 3", expectedOutput: "2", isHidden: false },
        { id: "2", input: "3 2 0 2\n0 1\n1 2", expectedOutput: "2", isHidden: false },
        { id: "3", input: "3 1 0 2\n0 1", expectedOutput: "-1", isHidden: false },
        { id: "4", input: "1 0 0 0", expectedOutput: "0", isHidden: false }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════
// NHÓM 2: KIẾN TRÚC HỆ THỐNG & HẠ TẦNG
// ═══════════════════════════════════════════════════════

const it007: Subject = {
  id: "it007", code: "IT007", name: "Hệ điều hành", credits: 4, icon: "", color: "#0284c7",
  theory: [
    { title: "Chương 1 & 2: Tổng quan OS & System Call", content: "<p>Tổng quan, Lời gọi hệ thống (System call) và Cấu trúc hệ thống.</p>" },
    { title: "Chương 3 & 4: Quản lý Tiến trình & Thread", content: "<p>Quản lý Tiến trình (Process), Tiểu trình (Thread). Các giải thuật định thời CPU (FCFS, SJF, RR, Priority, Multilevel Queue).</p>" },
    { title: "Chương 5: Đồng bộ hóa tiến trình", content: "<p>Race condition, Vùng găng. Giải pháp Busy Waiting (Peterson) và Sleep/Wakeup (Semaphore, Monitor).</p>" },
    { title: "Chương 6: Tắc nghẽn (Deadlock)", content: "<p>Đồ thị cấp phát, thuật toán Banker để phòng tránh/ngăn chặn.</p>" },
    { title: "Chương 7 & 8: Quản lý bộ nhớ & Bộ nhớ ảo", content: "<p>Phân vùng, Phân trang. Bộ nhớ ảo: Thay thế trang (FIFO, LRU, OPT) và hiện tượng Trashing.</p>" }
  ],
  exercises: []
};

const it005: Subject = {
  id: "it005", code: "IT005", name: "Nhập môn Mạng máy tính", credits: 4, icon: "", color: "#38bdf8",
  theory: [
    { title: "Chương 1: Tổng quan Mạng máy tính", content: "<p>Tổng quan về mạng máy tính và Internet.</p>" },
    { title: "Chương 2: Tầng ứng dụng (HTTP, DNS...)", content: "<p>Giao thức HTTP, FTP, SMTP, DNS.</p>" },
    { title: "Chương 3: Tầng giao vận (TCP/UDP)", content: "<p>TCP, UDP, kiểm soát luồng và tắc nghẽn.</p>" },
    { title: "Chương 4 & 5: Tầng mạng", content: "<p>Mặt phẳng dữ liệu (định tuyến gói tin) và Mặt phẳng điều khiển (thuật toán tìm đường).</p>" },
    { title: "Chương 6-8: Data Link & Bảo mật", content: "<p>Tầng liên kết dữ liệu, Mạng không dây/Di động, và An toàn bảo mật mạng.</p>" }
  ],
  exercises: []
};

// ═══════════════════════════════════════════════════════
// CÁC NHÓM CÒN LẠI (rút gọn, sẽ mở rộng sau)
// ═══════════════════════════════════════════════════════

const otherSubjects: Subject[] = [
  { id: "azure", code: "CLOUD", name: "Điện toán Đám mây (Azure)", credits: 3, icon: "️", color: "#0ea5e9",
    theory: [
      { title: "Tài nguyên lõi Azure", content: "<p>Quản lý Azure Storage, Virtual Networks (VNet Peering), Virtual Machines.</p>" },
      { title: "Tích hợp & ETL", content: "<p>Azure Data Factory (ETL), Azure Synapse Analytics, Databricks.</p>" },
      { title: "Serverless & AI", content: "<p>Azure Functions, Cognitive Services, Bot Service.</p>" },
      { title: "Vận hành & Bảo mật", content: "<p>Azure Monitor, Key Vault, Defender, RBAC, Backup & Restore.</p>" }
    ], exercises: [] },
  { id: "is210", code: "IS210", name: "Hệ Quản trị CSDL", credits: 4, icon: "", color: "#f59e0b",
    theory: [
      { title: "Chương 1 & 2: Lập trình T-SQL", content: "<p>Kiến trúc 3 mức. Cursor, Function, Stored Procedure, Trigger.</p>" },
      { title: "Chương 3: Giao tác & ACID", content: "<p>Tính chất ACID, Lịch tuần tự và Khả tuần tự.</p>" },
      { title: "Chương 4: Điều khiển đồng thời", content: "<p>Dirty read, Phantom. 2-Phase Locking, Timestamps, Deadlock.</p>" },
      { title: "Chương 5: Phục hồi dữ liệu", content: "<p>Transaction log, Checkpoint, Undo/Redo Logging.</p>" },
      { title: "Chương 6: Tối ưu truy vấn", content: "<p>Cây phân tích ĐSQH, kế hoạch thực thi và ước lượng chi phí.</p>" }
    ], exercises: [] },
  { id: "is211", code: "IS211", name: "CSDL Phân tán", credits: 3, icon: "️", color: "#d97706",
    theory: [
      { title: "Chương 1 & 2: Kiến trúc phân tán", content: "<p>Ưu/nhược điểm CSDL phân tán vs tập trung.</p>" },
      { title: "Chương 3: Phân mảnh dữ liệu", content: "<p>Phân mảnh ngang (HF), dọc (VF) và hỗn hợp.</p>" },
      { title: "Chương 4 & 5: Tối ưu truy vấn", content: "<p>Tính trong suốt. Phân rã truy vấn phân tán.</p>" },
      { title: "Chương 6: Quản lý giao dịch", content: "<p>Đồng thời phân tán trên Oracle/SQL Server và NoSQL.</p>" }
    ], exercises: [] },
  { id: "is217", code: "IS217", name: "Kho dữ liệu và OLAP", credits: 3, icon: "", color: "#fbbf24",
    theory: [
      { title: "Chương 1 & 2: Data Warehouse", content: "<p>Lược đồ hình sao, bông tuyết, Bảng Fact, Bảng Dimension.</p>" },
      { title: "Chương 3: ETL với SSIS", content: "<p>Quy trình Trích xuất - Biến đổi - Nạp bằng SSIS.</p>" },
      { title: "Chương 4: OLAP & MDX", content: "<p>ROLAP/MOLAP bằng SSAS, ngôn ngữ MDX.</p>" },
      { title: "Chương 5: DSS & Data Mining", content: "<p>Khai phá dữ liệu bằng công cụ BI.</p>" }
    ], exercises: [] },
  { id: "is405", code: "IS405", name: "Dữ liệu lớn (Big Data)", credits: 3, icon: "", color: "#fb923c",
    theory: [
      { title: "Chương 1 & 2: MapReduce & Hadoop", content: "<p>Đặc điểm Big Data. MapReduce. Hadoop (HDFS, YARN).</p>" },
      { title: "Chương 3: NoSQL", content: "<p>Hệ sinh thái NoSQL và tiền xử lý dữ liệu.</p>" },
      { title: "Chương 4: Apache Spark", content: "<p>RDD, DataFrame API, Spark SQL, Spark MLlib.</p>" },
      { title: "Chương 5: Lambda & Kappa", content: "<p>Kiến trúc hệ thống xử lý thời gian thực.</p>" }
    ], exercises: [] },
  { id: "is355", code: "IS355", name: "Công nghệ Blockchain", credits: 3, icon: "️", color: "#4f46e5",
    theory: [
      { title: "Chương 1 & 2: Bitcoin & P2P", content: "<p>Cấu trúc mạng P2P, Bitcoin, cấu trúc khối, UTXO và ví.</p>" },
      { title: "Chương 3: Giao thức đồng thuận", content: "<p>Nakamoto, Dolev-Strong, State Machine Replication, Proof-of-Stake.</p>" },
      { title: "Chương 4: Ethereum & Smart Contract", content: "<p>Smart Contract, EVM, Vyper/Web3.py.</p>" },
      { title: "Chương 5-7: DeFi & IPFS", content: "<p>DeFi, Rollups, Payment Channels, ERC20, ERC721.</p>" }
    ], exercises: [] },
  { id: "is336", code: "IS336", name: "ERP - Hoạch định Nguồn lực", credits: 3, icon: "", color: "#e11d48",
    theory: [
      { title: "Chương 1: SCM & Logistics", content: "<p>Tổng quan Doanh nghiệp, Logistics và Chuỗi cung ứng (SCM).</p>" },
      { title: "Chương 2 & 3: Order to Cash & P2P", content: "<p>Bán hàng & Phân phối, Mua hàng.</p>" },
      { title: "Chương 4 & 5: Hoạch định sản xuất", content: "<p>BOM, MRP, Lệnh sản xuất, Quản lý Kho bãi.</p>" },
      { title: "Chương 6: Tài chính Kế toán", content: "<p>AR/AP, báo cáo doanh thu, bảng cân đối kế toán.</p>" }
    ], exercises: [] },
  { id: "is208", code: "IS208", name: "Quản lý Dự án CNTT", credits: 3, icon: "", color: "#be185d",
    theory: [
      { title: "Chương 1-3: Cơ cấu quản lý", content: "<p>Các khái niệm dự án, cơ cấu quản lý, quy trình.</p>" },
      { title: "Chương 4-13: 10 vùng tri thức PMBOK", content: "<p>Phạm vi, Thời gian, Chi phí, Chất lượng, Nhân lực, Rủi ro, Truyền thông, Mua sắm, Stakeholder, Tích hợp.</p>" },
      { title: "Agile & Scrum", content: "<p>Mô hình Agile và khung làm việc Scrum.</p>" }
    ], exercises: [] },
  { id: "nt118", code: "NT118", name: "Phát triển Ứng dụng Di động", credits: 3, icon: "", color: "#db2777",
    theory: [
      { title: "Quy trình phát triển", content: "<p>Idea → Requirements → UI/UX → Dev → QA.</p>" },
      { title: "Native vs Cross-platform vs PWA", content: "<p>Ưu/nhược điểm Native App, Cross-platform App, Progressive Web App (PWA).</p>" }
    ], exercises: [] },
  { id: "is005", code: "IS005", name: "Giới thiệu ngành HTTT", credits: 2, icon: "", color: "#f43f5e",
    theory: [
      { title: "Chương 1 & 2: Tổng quan CNTT", content: "<p>Phần cứng, phần mềm, nhị phân. Ứng dụng trong doanh nghiệp, giáo dục, chính phủ.</p>" },
      { title: "Chương 3: Kỹ năng mềm & Đạo đức", content: "<p>Đạo đức CNTT. Cách viết CV chuẩn và kỹ năng phỏng vấn.</p>" }
    ], exercises: [] }
];

export const subjectGroups: SubjectGroup[] = [
  {
    id: "g1", name: "Lập trình & Thuật toán", icon: "", color: "#3b82f6",
    subjects: [it001, it002, it003]
  },
  {
    id: "g2", name: "Kiến trúc & Hạ tầng", icon: "️", color: "#0ea5e9",
    subjects: [it007, it005, otherSubjects[0]] // azure
  },
  {
    id: "g3", name: "Data Engineering", icon: "️", color: "#f59e0b",
    subjects: [otherSubjects[1], otherSubjects[2], otherSubjects[3], otherSubjects[4]] // is210,211,217,405
  },
  {
    id: "g4", name: "Công nghệ Blockchain", icon: "", color: "#6366f1",
    subjects: [otherSubjects[5]] // is355
  },
  {
    id: "g5", name: "Nghiệp vụ & Sản phẩm", icon: "", color: "#ec4899",
    subjects: [otherSubjects[6], otherSubjects[7], otherSubjects[8], otherSubjects[9]] // is336,208,nt118,is005
  }
];
