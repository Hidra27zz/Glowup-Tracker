export interface MockQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CodeSnippetItem {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  isAntiPattern?: boolean;
}

export interface CurriculumModule {
  id: string;
  groupId: number;
  groupName: string;
  title: string;
  description: string;
  theoryHtml: string;
  codeSnippets: CodeSnippetItem[];
  realWorldHtml: string;
  mockTests: MockQuestion[];
}

export const curriculumData: CurriculumModule[] = [
  // =====================================================================
  // BÀI 1: C++ CƠ BẢN ĐẾN NÂNG CAO (STRUCT, HÀM, THƯ VIỆN)
  // =====================================================================
  {
    id: 'g1-cpp-core',
    groupId: 1,
    groupName: 'NHÓM 1: C++ TỪ A ĐẾN Z',
    title: 'Bài 1: Cú pháp C++, Thư viện, Biến & Struct',
    description: 'Ôn tập toàn tập từ cách import thư viện, phân biệt biến toàn cục/cục bộ, viết hàm chuẩn và tạo Struct.',
    theoryHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">1. Thư viện (Libraries) và Không gian tên (Namespace)</h3>
        <p>Để sử dụng các tính năng có sẵn (in ra màn hình, xử lý chuỗi), ta phải include thư viện.</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li><code>#include &lt;iostream&gt;</code>: Dùng cho nhập/xuất (cin, cout).</li>
          <li><code>#include &lt;string&gt;</code>: Dùng cho chuỗi ký tự.</li>
          <li><code>#include &lt;vector&gt;</code>: Dùng cho mảng động.</li>
          <li><code>using namespace std;</code>: Tránh phải viết <code>std::cout</code> mỗi lần in. (Tuy nhiên trong dự án lớn thường tránh dùng lệnh này để chống đụng độ tên).</li>
        </ul>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">2. Các Kiểu Biến (Variables) và Phạm vi (Scope)</h3>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li><strong>Primitive Types:</strong> <code>int</code> (4 bytes), <code>float</code> (4 bytes), <code>double</code> (8 bytes - chính xác hơn float), <code>char</code> (1 byte - 1 ký tự), <code>bool</code> (1 byte - true/false).</li>
          <li><strong>Biến Cục Bộ (Local):</strong> Khai báo bên trong hàm. Khi hàm kết thúc, biến tự động bị xóa khỏi RAM.</li>
          <li><strong>Biến Toàn Cục (Global):</strong> Khai báo ngoài tất cả các hàm. Tồn tại suốt vòng đời chương trình. Dễ gây bug vì hàm nào cũng có thể sửa lén nó.</li>
        </ul>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">3. Khai báo Hàm (Function Declaration & Definition)</h3>
        <p>C++ yêu cầu phải biết tên hàm trước khi sử dụng. Cấu trúc: <code>Kiểu_Trả_Về Tên_Hàm(Tham_Số)</code>.</p>
        <p>Nếu hàm không trả về gì, dùng từ khóa <code>void</code>.</p>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">4. Struct (Cấu trúc)</h3>
        <p>Struct giúp gom nhóm nhiều biến khác kiểu lại với nhau thành một thực thể duy nhất (ví dụ: SinhVien gồm string ten, int tuoi, float diem).</p>
      </div>
    `,
    codeSnippets: [
      {
        id: 'c1-1',
        title: 'CÚ PHÁP: Khai báo Biến, Hàm và Struct chuẩn mực',
        description: 'Đoạn code minh họa đầy đủ các khái niệm trên.',
        language: 'cpp',
        code: `#include <iostream>
#include <string>
using namespace std;

// 1. BIẾN TOÀN CỤC (Khuyên dùng: Hạn chế tối đa)
int globalScore = 100; 

// 2. STRUCT
struct Student {
    string name;
    int age;
    float gpa;
};

// 3. KHAI BÁO HÀM (Prototype)
// Báo cho C++ biết hàm này tồn tại để hàm main() gọi trước khi định nghĩa
void printStudentInfo(Student s); 

int main() {
    // Biến cục bộ
    Student s1;
    s1.name = "Nguyen Van A";
    s1.age = 20;
    s1.gpa = 3.5;

    printStudentInfo(s1);
    return 0;
}

// 4. ĐỊNH NGHĨA HÀM
void printStudentInfo(Student s) {
    cout << "Name: " << s.name << ", GPA: " << s.gpa << endl;
}`
      }
    ],
    realWorldHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <p><strong>Tại sao dùng Struct thay vì truyền nhiều biến rời rạc?</strong></p>
        <p>Giả sử bạn lập trình Game. Một nhân vật có: <code>x, y, z, hp, mp, stamina, speed, armor</code>. Thay vì viết hàm: <br><code>void move(float x, float y, float z, int speed)</code> <br>Ta gói gọn lại: <br><code>void move(Character c)</code>. Code sạch hơn, dễ bảo trì, và khi cần thêm thuộc tính mới, không phải sửa lại toàn bộ định nghĩa hàm.</p>
      </div>
    `,
    mockTests: [
      {
        id: 't1-1',
        question: 'Biến toàn cục (Global Variable) được lưu trữ ở vùng nhớ nào?',
        options: [
          'Vùng nhớ Stack',
          'Vùng nhớ Heap',
          'Vùng nhớ Data Segment (Static Data)',
          'Vùng nhớ Code (Text Segment)'
        ],
        correctAnswer: 2,
        explanation: 'Biến toàn cục và biến static được cấp phát ở vùng Data Segment. Biến cục bộ nằm trên Stack. Bộ nhớ cấp phát bằng new/malloc nằm trên Heap.'
      }
    ]
  },

  // =====================================================================
  // BÀI 2: CON TRỎ (POINTERS), THAM CHIẾU VÀ CẤP PHÁT ĐỘNG
  // =====================================================================
  {
    id: 'g1-pointers-deep',
    groupId: 1,
    groupName: 'NHÓM 1: C++ TỪ A ĐẾN Z',
    title: 'Bài 2: Con Trỏ (Pointers), Tham Chiếu & Cấp Phát Động',
    description: 'Bản chất bộ nhớ máy tính. Toán tử & (Address), * (Dereference), new và delete.',
    theoryHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">1. Con Trỏ là gì?</h3>
        <p>Mọi biến đều có một <strong>địa chỉ bộ nhớ</strong> (Address), có thể lấy bằng dấu <code>&</code>.</p>
        <p><strong>Con trỏ (Pointer)</strong> là một biến chuyên dùng để LƯU TRỮ CÁC ĐỊA CHỈ ĐÓ. Nó được khai báo bằng dấu <code>*</code>.</p>
        
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">2. Tham Chiếu (Reference) khác Con Trỏ thế nào?</h3>
        <p>Tham chiếu (dấu <code>&</code> khi khai báo) chỉ đơn giản là <strong>một cái tên gọi khác (bí danh - alias)</strong> cho cùng một biến. Nó an toàn hơn con trỏ vì không thể trỏ tới nullptr (null), và không cần dùng dấu <code>*</code> để truy xuất giá trị.</p>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">3. Cấp Phát Động (Dynamic Allocation)</h3>
        <p>Khi dùng mảng thường <code>int arr[100];</code>, bộ nhớ cấp trên <strong>Stack</strong> và phải biết trước kích thước. Khi dùng <code>int* arr = new int[n];</code>, bộ nhớ cấp trên <strong>Heap</strong>, kích thước có thể thay đổi lúc chạy (Runtime).</p>
        <p>Nhưng bạn BẮT BUỘC phải dọn rác bằng lệnh <code>delete[] arr;</code> nếu không sẽ gây Memory Leak.</p>
      </div>
    `,
    codeSnippets: [
      {
        id: 'c2-1',
        title: 'LỖI CƠ BẢN: Truyền tham trị khiến hàm vô dụng',
        description: 'Khi truyền biến thông thường vào hàm, hàm tạo ra một bản COPY. Code gốc KHÔNG bị ảnh hưởng.',
        language: 'cpp',
        isAntiPattern: true,
        code: `void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}
int main() {
    int x = 5, y = 10;
    swap(x, y); 
    // x vẫn là 5, y vẫn là 10. Hàm swap vô dụng!
}`
      },
      {
        id: 'c2-2',
        title: 'CÁCH CHUẨN: Truyền Con trỏ / Tham chiếu',
        description: 'Đưa địa chỉ cho hàm, hàm sẽ "đột nhập" vào đúng địa chỉ đó để sửa giá trị.',
        language: 'cpp',
        code: `// CÁCH 1: Dùng Con Trỏ (C Style)
void swap_pointer(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// CÁCH 2: Dùng Tham Chiếu (C++ Style - Khuyên dùng)
void swap_reference(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 5, y = 10;
    
    // Gọi hàm con trỏ phải truyền ĐỊA CHỈ (&)
    swap_pointer(&x, &y); 
    
    // Gọi hàm tham chiếu truyền bình thường, C++ tự ngầm hiểu
    swap_reference(x, y); 
}`
      },
      {
        id: 'c2-3',
        title: 'CẤP PHÁT ĐỘNG: Tránh rò rỉ bộ nhớ (Memory Leak)',
        description: 'Cấp phát mảng trên Heap dựa trên biến n nhập từ bàn phím.',
        language: 'cpp',
        code: `int main() {
    int n;
    cin >> n;
    
    // Cấp phát mảng n phần tử trên Heap
    int* arr = new int[n]; 
    
    for(int i=0; i<n; i++) arr[i] = i;
    
    // BẮT BUỘC DỌN RÁC
    delete[] arr; 
    
    // Gán nullptr để tránh lỗi Dangling Pointer (Con trỏ lơ lửng)
    arr = nullptr; 
}`
      }
    ],
    realWorldHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <p><strong>Ứng dụng của Con trỏ hàm (Function Pointer) trong thực tế:</strong></p>
        <p>Bạn đã từng dùng hàm <code>sort()</code> của C++ chưa? Làm sao nó biết nên sắp xếp tăng dần hay giảm dần? Đó là nhờ bạn truyền một <strong>hàm so sánh (comparator)</strong> vào bên trong nó dưới dạng một con trỏ hàm.</p>
        <p>Trong hệ thống mạng, khi một sự kiện xảy ra (ví dụ: User click nút Đăng nhập), hệ thống sẽ gọi các hàm <strong>Callback</strong>. Callback thực chất là các con trỏ trỏ tới hàm xử lý sự kiện đó.</p>
      </div>
    `,
    mockTests: [
      {
        id: 't2-1',
        question: 'Điều gì xảy ra khi bạn gọi lệnh `delete` trên một con trỏ 2 lần liên tiếp (Double Free)?',
        options: [
          'Chương trình chạy bình thường vì bộ nhớ đã rỗng.',
          'Chương trình sẽ tự động tối ưu hóa lệnh thứ 2 đi.',
          'Chương trình lập tức bị Crash (Undefined Behavior).',
          'Bộ nhớ RAM được tăng gấp đôi.'
        ],
        correctAnswer: 2,
        explanation: 'Xóa một vùng nhớ 2 lần là lỗi cực kỳ nguy hiểm (Double Free), dẫn đến sập chương trình. Đó là lý do ta luôn gán ptr = nullptr sau khi delete, vì gọi delete trên nullptr không sao cả.'
      }
    ]
  },

  // =====================================================================
  // BÀI 3: LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP) TỪ A ĐẾN Z
  // =====================================================================
  {
    id: 'g1-oop-deep',
    groupId: 1,
    groupName: 'NHÓM 1: C++ TỪ A ĐẾN Z',
    title: 'Bài 3: Hướng Đối Tượng (OOP) - Bức Tranh Toàn Cảnh',
    description: 'Struct vs Class, 4 tính chất OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng), Constructor và Virtual Method.',
    theoryHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">1. Class vs Struct trong C++</h3>
        <p>Trong C++, Class và Struct gần như giống hệt nhau. Điểm khác biệt DUY NHẤT: Thuộc tính của <strong>Struct</strong> mặc định là <code>public</code>, trong khi của <strong>Class</strong> mặc định là <code>private</code>.</p>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">2. Tính Đóng Gói (Encapsulation)</h3>
        <p>Giấu data (biến) vào trong (private) để bảo vệ khỏi việc chỉnh sửa sai quy tắc. Giao tiếp qua các hàm public (Getters / Setters).</p>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">3. Hàm Thiết Lập (Constructor) & Hàm Hủy (Destructor)</h3>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li><strong>Constructor:</strong> Có cùng tên với Class, chạy tự động khi Object sinh ra để set giá trị ban đầu.</li>
          <li><strong>Destructor:</strong> Ký hiệu <code>~ClassName()</code>, chạy tự động khi Object bị xóa khỏi RAM. Rất quan trọng để gọi lệnh <code>delete</code> giải phóng bộ nhớ bên trong object.</li>
        </ul>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">4. Tính Kế Thừa (Inheritance) & Đa Hình (Polymorphism)</h3>
        <p>Kế thừa giúp Lớp Con (Child) dùng lại code của Lớp Cha (Parent).</p>
        <p>Đa hình đạt được thông qua từ khóa <code>virtual</code>. Hàm ảo (Virtual Function) cho phép Lớp Con "ghi đè" (override) logic của Lớp Cha.</p>
      </div>
    `,
    codeSnippets: [
      {
        id: 'c3-1',
        title: 'KIẾN TRÚC CLASS CHUẨN: Constructor, Destructor & Kế thừa',
        description: 'Ví dụ kinh điển về việc dùng Đa hình để gọi đúng hàm của đối tượng.',
        language: 'cpp',
        code: `#include <iostream>
using namespace std;

// LỚP CHA (Trừu tượng)
class Animal {
protected: 
    // Protected: Con cháu truy cập được, nhưng người ngoài thì KHÔNG
    string name;

public:
    // Constructor
    Animal(string n) { name = n; }

    // HÀM ẢO (Virtual Function) - Cho phép lớp con ghi đè
    virtual void speak() {
        cout << name << " tao ra am thanh!" << endl;
    }

    // Hàm Hủy Ảo (Virtual Destructor) - LUÔN LUÔN CẦN THIẾT
    virtual ~Animal() {}
};

// LỚP CON
class Dog : public Animal {
public:
    // Kế thừa Constructor của cha
    Dog(string n) : Animal(n) {}

    // GHI ĐÈ (Override) hàm của cha
    void speak() override {
        cout << name << " sua: Gau Gau!" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string n) : Animal(n) {}
    void speak() override {
        cout << name << " keu: Meo Meo!" << endl;
    }
};

int main() {
    // ỨNG DỤNG ĐA HÌNH
    // Tạo 1 con trỏ Lớp Cha, nhưng lại trỏ tới Lớp Con
    Animal* myPet1 = new Dog("Husky");
    Animal* myPet2 = new Cat("Tom");

    // V-Table sẽ tự động gọi đúng hàm của Dog và Cat!
    myPet1->speak(); // In ra: Husky sua: Gau Gau!
    myPet2->speak(); // In ra: Tom keu: Meo Meo!

    delete myPet1;
    delete myPet2;
}`
      }
    ],
    realWorldHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <p><strong>Lỗi kinh điển: Quên Virtual Destructor</strong></p>
        <p>Trong code trên, nếu class <code>Animal</code> KHÔNG có <code>virtual ~Animal()</code>, khi ta gọi lệnh <code>delete myPet1;</code>, C++ chỉ gọi hàm hủy của Animal mà <strong>KHÔNG</strong> gọi hàm hủy của Dog. Điều này gây rò rỉ bộ nhớ nghiêm trọng nếu Dog có cấp phát mảng bên trong nó.</p>
        <p><strong>Quy tắc bất thành văn:</strong> Cứ hễ class có bất kỳ hàm <code>virtual</code> nào, bắt buộc phải có một Virtual Destructor.</p>
      </div>
    `,
    mockTests: [
      {
        id: 't3-1',
        question: 'Lỗi Diamond Problem (Bài toán kim cương) trong C++ xảy ra khi nào?',
        options: [
          'Khi class con kế thừa một class cha không có Constructor.',
          'Khi dùng quá nhiều con trỏ lồng nhau gây rò rỉ bộ nhớ.',
          'Đa kế thừa: Class D kế thừa từ B và C, mà B và C lại cùng kế thừa từ A. Dẫn đến D có 2 bản sao dữ liệu của A.',
          'Lỗi khi cố gắng ghi đè một hàm không có từ khóa virtual.'
        ],
        correctAnswer: 2,
        explanation: 'Diamond Problem xảy ra trong Đa kế thừa (Multiple Inheritance). Cách giải quyết là B và C phải kế thừa A bằng từ khóa "virtual public A".'
      }
    ]
  },

  // =====================================================================
  // BÀI 4: CẤU TRÚC DỮ LIỆU & THUẬT TOÁN (DSA)
  // =====================================================================
  {
    id: 'g2-dsa-advanced',
    groupId: 2,
    groupName: 'NHÓM 2: CTDL VA GIAI THUAT (IT003)',
    title: 'Bài 4: Phân Tích CTDL, Danh sách liên kết & Cây',
    description: 'Từ Mảng tĩnh, Mảng động (Vector) cho tới Linked List và Binary Search Tree.',
    theoryHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">1. Vector (Mảng động) trong C++</h3>
        <p>Vector (<code>std::vector</code>) giải quyết nhược điểm của Mảng tĩnh. Khi Vector bị đầy, nó tự động cấp phát một vùng RAM mới to gấp đôi, copy dữ liệu cũ sang, và xóa vùng nhớ cũ.</p>
        
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">2. Linked List (Danh sách liên kết)</h3>
        <p>Dữ liệu (Node) nằm rải rác. Node này giữ con trỏ trỏ tới Node kia.</p>
        <p>Code Linked List cực kỳ hay bị hỏi vòng Code Interview vì nó kiểm tra khả năng quản lý con trỏ của bạn.</p>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 8px;">3. Cây Tìm Kiếm Nhị Phân (Binary Search Tree - BST)</h3>
        <p>Quy tắc: Con bên trái NHỎ HƠN cha, con bên phải LỚN HƠN cha. Tốc độ tìm kiếm siêu nhanh: O(log N).</p>
      </div>
    `,
    codeSnippets: [
      {
        id: 'c4-1',
        title: 'CÚ PHÁP: Cài đặt Node của Linked List',
        description: 'Tự định nghĩa CTDL Linked List.',
        language: 'cpp',
        code: `struct Node {
    int data;
    Node* next; // Con trỏ trỏ tới Node tiếp theo
    
    // Constructor cho Struct
    Node(int val) {
        data = val;
        next = nullptr;
    }
};

void printList(Node* head) {
    Node* current = head;
    while(current != nullptr) {
        cout << current->data << " -> ";
        current = current->next;
    }
    cout << "NULL" << endl;
}`
      }
    ],
    realWorldHtml: `
      <div style="color: #cbd5e1; line-height: 1.7; font-size: 0.95rem;">
        <p><strong>Cơ sở dữ liệu Database tổ chức Index như thế nào?</strong></p>
        <p>DB không dùng BST thông thường, vì BST có thể bị lệch (giống 1 đường thẳng) làm tốc độ giảm xuống O(N). Thay vào đó, DB sử dụng <strong>B-Tree</strong> hoặc <strong>B+ Tree</strong> (Cây tự cân bằng nhiều nhánh). Nhờ vậy, thao tác SELECT 1 dòng trong bảng 1 tỷ records chỉ mất 4-5 thao tác đọc đĩa (O(log N)).</p>
      </div>
    `,
    mockTests: [
      {
        id: 't4-1',
        question: 'Tại sao lại nói XÓA một phần tử ở giữa Vector (Mảng) là một thảm họa về hiệu suất?',
        options: [
          'Vì máy tính phải giải phóng RAM liên tục.',
          'Vì khi xóa phần tử ở giữa, Vector phải dời toàn bộ các phần tử phía sau lùi lại 1 ô để lấp vào chỗ trống (Độ phức tạp O(N)).',
          'Vì kích thước Vector là cố định không thể thay đổi.'
        ],
        correctAnswer: 1,
        explanation: 'Khác với Linked List chỉ cần đổi hướng con trỏ (O(1)), Mảng phải dời toàn bộ phần tử (Shift Left), tốn rất nhiều chu kỳ CPU.'
      }
    ]
  }
];
