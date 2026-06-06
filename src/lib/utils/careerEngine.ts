export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'text_input';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[]; // string for multiple choice, array of keywords for text_input
  explanation: string;
}

export interface CareerBlueprint {
  focusArea: string;
  pathway: {
    basic: string[];
    intermediate: string[];
    advanced: string[];
  };
  interviewQuestions: QuizQuestion[];
  youtubeQuery: string;
  theoryReview?: { title: string; content: string }[];
  codingExercises?: { title: string; language: string; code: string; task: string }[];
}

export function generateCareerBlueprint(prompt: string): CareerBlueprint {
  const lowerPrompt = prompt.toLowerCase();
  
  let focusArea = 'Kỹ năng chung (General Skill)';
  let pathway = {
    basic: ['Hiểu các khái niệm cốt lõi', 'Cài đặt môi trường làm việc', 'Nắm vững cú pháp / công cụ cơ bản'],
    intermediate: ['Thực hành qua các dự án nhỏ', 'Áp dụng Best Practices', 'Làm quen với các thư viện/công cụ phổ biến'],
    advanced: ['Tối ưu hóa hiệu suất (Performance Optimization)', 'Kiến trúc hệ thống / Design Patterns', 'Giải quyết các bài toán thực tế quy mô lớn']
  };
  
  let interviewQuestions: QuizQuestion[] = [
    {
      id: 'gen_1', type: 'multiple_choice',
      question: 'Kỹ năng nào sau đây quan trọng nhất khi làm việc nhóm?',
      options: ['Làm việc độc lập không cần ai', 'Giao tiếp hiệu quả', 'Giấu lỗi sai', 'Chỉ nói khi được hỏi'],
      correctAnswer: 'Giao tiếp hiệu quả',
      explanation: 'Giao tiếp (Communication) là cốt lõi của làm việc nhóm, giúp đồng bộ thông tin và giải quyết xung đột.'
    },
    {
      id: 'gen_2', type: 'text_input',
      question: 'Khái niệm "Growth Mindset" (Tư duy phát triển) là gì? (Nhập từ khóa)',
      correctAnswer: ['học hỏi', 'cải thiện', 'không sợ sai', 'cố gắng'],
      explanation: 'Growth Mindset là niềm tin rằng khả năng và trí tuệ có thể phát triển qua nỗ lực và học hỏi.'
    }
  ];
  let youtubeQuery = 'tutorial full course beginner';
  let theoryReview: { title: string; content: string }[] | undefined = undefined;
  let codingExercises: { title: string; language: string; code: string; task: string }[] | undefined = undefined;

  // 1. MOBILE / iOS ENGINEER
  if (/\b(ios|swift|mobile|objective-c|apple)\b/.test(lowerPrompt)) {
    focusArea = 'iOS / Mobile App Developer';
    pathway = {
      basic: ['Ngôn ngữ Swift cơ bản', 'UIKit hoặc SwiftUI', 'Quản lý trạng thái (State Management) cơ bản'],
      intermediate: ['Core Data / SQLite', 'Giao tiếp API (URLSession, Alamofire)', 'Kiến trúc MVVM / VIPER', 'Quản lý bộ nhớ (ARC)'],
      advanced: ['Tối ưu hóa UI (Instruments, Core Animation)', 'CI/CD cho Mobile (Fastlane)', 'Multi-threading (GCD, Swift Concurrency)']
    };
    interviewQuestions = [
      {
        id: 'ios_1', type: 'multiple_choice',
        question: 'Trong Swift, sự khác biệt chính giữa struct và class là gì?',
        options: ['struct là Reference type, class là Value type', 'struct là Value type, class là Reference type', 'Cả hai đều là Value type', 'Cả hai đều không hỗ trợ kế thừa'],
        correctAnswer: 'struct là Value type, class là Reference type',
        explanation: 'Struct là kiểu tham trị (được copy khi gán), trong khi Class là kiểu tham chiếu (cùng trỏ về một vùng nhớ). Swift ưu tiên dùng struct để an toàn và tối ưu bộ nhớ.'
      },
      {
        id: 'ios_2', type: 'multiple_choice',
        question: 'ARC (Automatic Reference Counting) giải quyết vấn đề gì?',
        options: ['Render UI nhanh hơn', 'Tự động quản lý bộ nhớ để tránh rò rỉ (memory leak)', 'Quản lý state của component', 'Quản lý đa luồng'],
        correctAnswer: 'Tự động quản lý bộ nhớ để tránh rò rỉ (memory leak)',
        explanation: 'ARC tự động đếm số lượng tham chiếu đến một đối tượng. Khi số tham chiếu bằng 0, bộ nhớ sẽ được giải phóng.'
      },
      {
        id: 'ios_3', type: 'text_input',
        question: 'Vấn đề vòng lặp tham chiếu (Retain Cycle) thường được giải quyết bằng từ khóa nào khi khai báo biến?',
        correctAnswer: ['weak', 'unowned'],
        explanation: 'Sử dụng từ khóa "weak" hoặc "unowned" giúp ngăn chặn vòng lặp tham chiếu mạnh (strong retain cycle), nguyên nhân chính gây memory leak trong iOS.'
      },
      {
        id: 'ios_4', type: 'multiple_choice',
        question: 'Đâu là Pattern thường dùng nhất hiện nay để thay thế MVC trong iOS nhằm tách biệt UI và Business Logic?',
        options: ['Singleton', 'MVVM (Model-View-ViewModel)', 'Observer', 'Factory'],
        correctAnswer: 'MVVM (Model-View-ViewModel)',
        explanation: 'MVVM giúp tách biệt hoàn toàn Logic khỏi View (ViewController), giúp code dễ test và bảo trì hơn rất nhiều so với MVC truyền thống (thường bị gọi đùa là Massive View Controller).'
      }
    ];
    youtubeQuery = 'iOS Swift SwiftUI MVVM full course tutorial advanced';
    theoryReview = [
      {
        title: 'Quản lý bộ nhớ với ARC & Retain Cycle',
        content: 'Khác với Garbage Collection của Java/C#, iOS dùng ARC. ARC giải phóng bộ nhớ ngay khi đếm tham chiếu (Reference Count) bằng 0. Trọng tâm phỏng vấn thường rơi vào "Retain Cycle" (Vòng lặp tham chiếu) - khi 2 class giữ reference mạnh (strong) lẫn nhau khiến bộ nhớ không bao giờ giải phóng. Giải pháp là dùng `weak` hoặc `unowned`.'
      },
      {
        title: 'Concurrency trong iOS',
        content: 'Xử lý đa luồng (Multi-threading) là bắt buộc khi gọi API hoặc tải ảnh để không làm đơ UI. Bạn cần nắm vững GCD (Grand Central Dispatch) với `DispatchQueue.main.async` (cập nhật UI) và `DispatchQueue.global()` (tác vụ ngầm), hoặc công nghệ mới hơn là `async/await` trong Swift 5.5+.'
      }
    ];
    codingExercises = [
      {
        title: 'Sửa lỗi Retain Cycle trong Swift',
        language: 'swift',
        code: `class User {
    var name: String
    var device: Device?
    init(name: String) { self.name = name }
    deinit { print("User deallocated") }
}

class Device {
    var model: String
    var owner: User?
    init(model: String) { self.model = model }
    deinit { print("Device deallocated") }
}

var john: User? = User(name: "John")
var iphone: Device? = Device(model: "iPhone 15")

john?.device = iphone
iphone?.owner = john

john = nil
iphone = nil
// Phân tích: Vì sao hàm deinit không được gọi? Sửa code thế nào?`,
        task: 'Biến `owner` trong Device đang giữ tham chiếu mạnh tới User. Khi gán cả 2 bằng nil, chúng vẫn giữ nhau (Retain cycle). Hãy thêm từ khóa `weak` vào trước `var owner: User?` để sửa lỗi này.'
      }
    ];
  }
  // 2. AI INTEGRATION / BACKEND PHP
  else if (/\b(llm|genai|php)\b/.test(lowerPrompt) || (/\b(api)\b/.test(lowerPrompt) && /\b(ai)\b/.test(lowerPrompt))) {
    focusArea = 'AI Integration Engineer (GenAI & Backend PHP)';
    pathway = {
      basic: ['Ôn tập OOP vững chắc (Class, Object, Kế thừa, Đa hình)', 'Hiểu định dạng JSON và tương tác RESTful API', 'Kiến trúc Client-Server cơ bản'],
      intermediate: ['Tích hợp API của OpenAI / Google Gemini bằng PHP/NodeJS', 'Xử lý JSON responses phức tạp', 'Prompt Engineering cho LLMs'],
      advanced: ['Xây dựng AI Agent cơ bản (Function Calling)', 'Tối ưu hóa API calls (Caching, Rate Limiting)', 'Vector Databases & RAG (Retrieval-Augmented Generation)']
    };
    interviewQuestions = [
      {
        id: 'ai_php_1', type: 'multiple_choice',
        question: 'Trong PHP, hàm nào dùng để chuyển một mảng (array) thành chuỗi JSON?',
        options: ['json_decode()', 'json_encode()', 'serialize()', 'parse_json()'],
        correctAnswer: 'json_encode()',
        explanation: 'Hàm json_encode() được dùng để chuyển đổi mảng hoặc đối tượng trong PHP thành định dạng chuỗi JSON, rất cần thiết khi trả về API response hoặc gửi request lên AI server.'
      },
      {
        id: 'ai_php_2', type: 'multiple_choice',
        question: 'RESTful API thường sử dụng HTTP method nào để GỬI dữ liệu (như prompt) và TẠO MỚI một tài nguyên?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 'POST',
        explanation: 'POST được sử dụng để gửi dữ liệu lên server (payload) với độ an toàn và dung lượng lớn, ví dụ: gửi prompt text dài lên server để gọi OpenAI API.'
      },
      {
        id: 'ai_php_3', type: 'text_input',
        question: 'LLM là viết tắt của cụm từ tiếng Anh nào trong lĩnh vực AI?',
        correctAnswer: ['large language model', 'large language models'],
        explanation: 'LLM (Large Language Model) là các mô hình ngôn ngữ lớn như GPT-4, Claude, hay Gemini được huấn luyện trên tập dữ liệu văn bản khổng lồ.'
      },
      {
        id: 'ai_php_4', type: 'text_input',
        question: 'Khi gọi API của OpenAI, Header nào thường được dùng để xác thực Bearer Token?',
        correctAnswer: ['authorization', 'auth'],
        explanation: 'Bạn cần truyền API Key vào Header với định dạng: "Authorization: Bearer YOUR_API_KEY".'
      }
    ];
    youtubeQuery = 'PHP OpenAI API integration tutorial GenAI REST API';
    theoryReview = [
      {
        title: 'RESTful API & JSON Client-Server',
        content: 'REST (Representational State Transfer) là kiểu kiến trúc phần mềm cho các hệ thống phân tán. Trong mô hình Client-Server, client gửi HTTP Request (GET, POST...) lên server. Server xử lý (gọi AI Model, Query Database) và trả về HTTP Response. Dữ liệu thường được trao đổi dưới định dạng JSON (JavaScript Object Notation), một định dạng key-value nhẹ và dễ đọc.'
      },
      {
        title: 'OOP & Clean Code',
        content: 'Lập trình hướng đối tượng (OOP) cung cấp 4 tính chất: Đóng gói, Kế thừa, Đa hình, Trừu tượng. Trong hệ thống tích hợp AI, việc áp dụng OOP giúp chia nhỏ các module (ví dụ: `OpenAIService`, `PromptBuilder`, `ResponseParser`). Điều này giúp code dễ bảo trì, mở rộng và test hơn.'
      }
    ];
    codingExercises = [
      {
        title: 'Gọi API OpenAI bằng PHP (cURL)',
        language: 'php',
        code: `<?php
$apiKey = "YOUR_API_KEY";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

$headers = [
  "Content-Type: application/json",
  "Authorization: Bearer " . $apiKey
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$data = [
  "model" => "gpt-4",
  "messages" => [
    ["role" => "user", "content" => "Hãy tóm tắt về REST API"]
  ]
];
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
} else {
    $response = json_decode($result, true);
    echo $response['choices'][0]['message']['content'];
}
curl_close($ch);
?>`,
        task: 'Hãy đọc đoạn mã PHP ở trên và chú ý vào cách dữ liệu mảng PHP được convert sang JSON qua json_encode(), cũng như cách hứng kết quả trả về bằng json_decode().'
      }
    ];
  }
  // 3. NGÀNH DATA / AI (dùng regex tránh nhầm với Data Structures)
  else if (/\b(data science|machine learning|ai|deep learning|data analyst|data engineer)\b/.test(lowerPrompt)) {
    focusArea = 'Data Science & Machine Learning';
    pathway = {
      basic: ['Python cơ bản, NumPy, Pandas', 'Thống kê xác suất cơ bản', 'Trực quan hóa dữ liệu (Matplotlib, Seaborn)'],
      intermediate: ['Machine Learning cơ bản (Scikit-Learn)', 'SQL & Database Design', 'EDA (Exploratory Data Analysis)', 'Feature Engineering'],
      advanced: ['Deep Learning (TensorFlow/PyTorch)', 'Triển khai Model (MLOps, FastAPI, Docker)', 'Xử lý ngôn ngữ tự nhiên (NLP) hoặc Computer Vision']
    };
    interviewQuestions = [
      {
        id: 'data_1', type: 'multiple_choice',
        question: 'Thuật toán nào sau đây thuộc nhóm Supervised Learning (Học có giám sát)?',
        options: ['K-Means Clustering', 'Random Forest', 'PCA', 'Apriori'],
        correctAnswer: 'Random Forest',
        explanation: 'Random Forest cần dữ liệu có nhãn (labeled data) để huấn luyện. Các thuật toán còn lại (K-Means, PCA, Apriori) thuộc nhóm Unsupervised Learning (Học không giám sát).'
      },
      {
        id: 'data_2', type: 'text_input',
        question: 'Trong SQL, từ khóa nào dùng để gom nhóm các bản ghi có cùng giá trị nhằm sử dụng với các hàm tổng hợp (COUNT, SUM...)?',
        correctAnswer: ['group by', 'groupby'],
        explanation: 'Lệnh GROUP BY kết hợp với các hàm tổng hợp (COUNT, MAX, MIN, SUM, AVG) được dùng để gom nhóm dữ liệu theo một hoặc nhiều cột.'
      },
      {
        id: 'data_3', type: 'multiple_choice',
        question: 'Vấn đề "Overfitting" trong Machine Learning nghĩa là gì?',
        options: ['Mô hình quá đơn giản, không học được quy luật', 'Mô hình học thuộc lòng dữ liệu train nhưng dự đoán kém trên dữ liệu test', 'Dữ liệu bị thiếu quá nhiều', 'Thuật toán chạy quá chậm'],
        correctAnswer: 'Mô hình học thuộc lòng dữ liệu train nhưng dự đoán kém trên dữ liệu test',
        explanation: 'Overfitting xảy ra khi mô hình quá phức tạp, ghi nhớ cả nhiễu (noise) trong tập huấn luyện dẫn đến tổng quát hóa (generalization) kém trên dữ liệu thực tế.'
      }
    ];
    youtubeQuery = 'data science machine learning full course tutorial python';
    theoryReview = [
      {
        title: 'Overfitting vs Underfitting',
        content: 'Overfitting (Quá khớp): Mô hình hoạt động cực tốt trên dữ liệu huấn luyện nhưng lại tệ trên dữ liệu thực tế. Cách khắc phục: Tăng lượng dữ liệu, giảm độ phức tạp của mô hình, dùng Regularization (L1, L2), hoặc Dropout (trong Deep Learning). Underfitting (Chưa khớp): Mô hình quá đơn giản, hiệu suất kém trên cả 2 tập dữ liệu.'
      },
      {
        title: 'Precision và Recall',
        content: 'Khi đánh giá mô hình phân loại (Classification), Accuracy không phải lúc nào cũng tốt (ví dụ tập dữ liệu lệch - Imbalanced data). \n- Precision: Trong số các mẫu dự đoán là Tích cực, bao nhiêu mẫu thực sự là Tích cực? (Tránh báo động giả).\n- Recall: Trong số tất cả mẫu thực sự Tích cực, hệ thống tìm được bao nhiêu? (Tránh bỏ sót).'
      }
    ];
    codingExercises = [
      {
        title: 'Làm sạch dữ liệu bằng Pandas (Python)',
        language: 'python',
        code: `import pandas as pd
import numpy as np

# Tạo DataFrame bị khuyết dữ liệu
data = {'Name': ['Tom', 'Nick', 'Krish', 'Jack'],
        'Age': [20, 21, np.nan, 18],
        'Salary': [5000, np.nan, 7000, 4500]}
df = pd.DataFrame(data)

# Bài tập 1: Điền giá trị độ tuổi (Age) bị thiếu bằng giá trị trung bình (mean)
df['Age'] = df['Age'].fillna(df['Age'].mean())

# Bài tập 2: Bỏ luôn các hàng bị thiếu Lương (Salary)
df = df.dropna(subset=['Salary'])

print(df)`,
        task: 'Chạy thử đoạn code Pandas trên. Việc điền giá trị thiếu (Imputation) bằng trung bình (mean) hoặc trung vị (median) là bước quan trọng nhất trong quá trình Feature Engineering. Hãy tìm hiểu thêm về KNNImputer.'
      }
    ];
  }
  // 4. NGÀNH WEB / APP DEV
  else if (/\b(web|frontend|backend|react|next|node|javascript|html|css)\b/.test(lowerPrompt)) {
    focusArea = 'Software Engineering (Web Development)';
    pathway = {
      basic: ['Cấu trúc HTML, CSS Box Model', 'JavaScript ES6+ (Arrow function, Destructuring, Promises)', 'DOM Manipulation & Events'],
      intermediate: ['Frameworks (React/Vue/Angular)', 'Giao tiếp API (REST, Fetch/Axios, CORS)', 'Quản lý trạng thái (Redux, Zustand)'],
      advanced: ['System Design cơ bản, Microservices', 'Server-Side Rendering (Next.js)', 'Tối ưu hiệu suất (Web Core Vitals, Caching)']
    };
    interviewQuestions = [
      {
        id: 'web_1', type: 'multiple_choice',
        question: 'Trong JavaScript, Promise có mấy trạng thái (states)?',
        options: ['1 (Pending)', '2 (Pending, Resolved)', '3 (Pending, Fulfilled, Rejected)', '4 (Start, Pending, Success, Error)'],
        correctAnswer: '3 (Pending, Fulfilled, Rejected)',
        explanation: 'Một Promise luôn ở một trong 3 trạng thái: Pending (đang chờ), Fulfilled (thành công), hoặc Rejected (thất bại).'
      },
      {
        id: 'web_2', type: 'text_input',
        question: 'Kỹ thuật tối ưu hóa nhằm giảm số lượng lần gọi hàm liên tục khi người dùng gõ phím nhanh được gọi là gì? (bắt đầu bằng chữ d)',
        correctAnswer: ['debounce', 'debouncing'],
        explanation: 'Debounce trì hoãn việc thực thi hàm cho đến khi người dùng ngừng thao tác trong một khoảng thời gian nhất định (ví dụ: chức năng tìm kiếm).'
      },
      {
        id: 'web_3', type: 'multiple_choice',
        question: 'Virtual DOM trong React hoạt động như thế nào?',
        options: ['Cập nhật toàn bộ trình duyệt mỗi khi có thay đổi', 'Tạo ra một bản sao nhẹ của DOM thực, so sánh (diffing) và chỉ cập nhật những phần thay đổi', 'Nó thay thế hoàn toàn HTML truyền thống', 'Chạy trực tiếp trên Server'],
        correctAnswer: 'Tạo ra một bản sao nhẹ của DOM thực, so sánh (diffing) và chỉ cập nhật những phần thay đổi',
        explanation: 'React dùng Virtual DOM để thuật toán Reconciliation (Diffing) tìm ra điểm khác biệt, sau đó cập nhật DOM thực một cách tối ưu và tiết kiệm tài nguyên nhất.'
      }
    ];
    youtubeQuery = 'web development full course tutorial advanced project';
    if (lowerPrompt.includes('frontend') || lowerPrompt.includes('react')) youtubeQuery = 'react nextjs frontend full course advanced';
    if (lowerPrompt.includes('backend')) youtubeQuery = 'backend nodejs system design full course';
    
    theoryReview = [
      {
        title: 'Event Loop trong JavaScript',
        content: 'JS là ngôn ngữ đơn luồng (Single-threaded). Event Loop giúp JS xử lý bất đồng bộ. Khi gặp tác vụ tốn thời gian (như setTimeout, gọi API), JS ném nó sang Web APIs xử lý. Xong xuôi, kết quả được đẩy vào Callback Queue/Microtask Queue. Event Loop liên tục kiểm tra nếu Call Stack trống, nó sẽ bốc tác vụ từ Queue lên chạy.'
      },
      {
        title: 'CORS & Security',
        content: 'CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt ngăn trang web ở domain A gọi API của domain B trừ khi domain B cấp phép. Lỗi CORS thường phải được xử lý ở phía Server (Backend) bằng cách cấu hình Access-Control-Allow-Origin.'
      }
    ];
    codingExercises = [
      {
        title: 'Cài đặt hàm Debounce',
        language: 'javascript',
        code: `function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    // Nếu gọi lại hàm trước khi hết delay, xóa timeout cũ
    clearTimeout(timeoutId);
    
    // Đặt timeout mới
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Giả lập người dùng gõ liên tục tìm kiếm
const handleSearch = debounce((query) => {
  console.log("Đang gọi API tìm kiếm với từ khóa:", query);
}, 500);

handleSearch("i");
handleSearch("io");
handleSearch("ios"); // Chỉ lần gọi này được thực thi sau 500ms`,
        task: 'Closure trong JS cho phép hàm trả về bên trong giữ lại quyền truy cập biến `timeoutId` của hàm debounce bên ngoài. Hiểu được đoạn code này là bạn đã nắm chắc Closure và Asynchronous JS.'
      }
    ];
  }
  // 5. OOP CƠ BẢN HOẶC MẶC ĐỊNH
  else {
    focusArea = 'Software Engineer (Nền Tảng Core CS)';
    pathway = {
      basic: ['Cấu trúc dữ liệu (Array, Linked List, Stack, Queue)', 'Thuật toán cơ bản (Sort, Search)', 'Khái niệm Class & Object (OOP)'],
      intermediate: ['4 tính chất của OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng)', 'SOLID Principles cơ bản', 'Cấu trúc dữ liệu nâng cao (Tree, Graph, Hash Table)'],
      advanced: ['Design Patterns (Singleton, Factory, Observer)', 'Kiến trúc Clean Architecture', 'System Design (Load Balancing, Caching, DB Sharding)']
    };
    interviewQuestions = [
      {
        id: 'core_1', type: 'multiple_choice',
        question: 'Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO (Last In, First Out)?',
        options: ['Queue (Hàng đợi)', 'Stack (Ngăn xếp)', 'Linked List (Danh sách liên kết)', 'Hash Table (Bảng băm)'],
        correctAnswer: 'Stack (Ngăn xếp)',
        explanation: 'Stack tuân theo LIFO (Vào sau ra trước), ví dụ như tính năng Undo trong phần mềm hoặc Call Stack của chương trình.'
      },
      {
        id: 'core_2', type: 'multiple_choice',
        question: 'Tính chất nào của OOP cho phép các đối tượng thuộc các lớp khác nhau phản hồi cùng một phương thức theo những cách riêng biệt?',
        options: ['Kế thừa (Inheritance)', 'Đóng gói (Encapsulation)', 'Trừu tượng (Abstraction)', 'Đa hình (Polymorphism)'],
        correctAnswer: 'Đa hình (Polymorphism)',
        explanation: 'Đa hình (Polymorphism) cho phép phương thức draw() vẽ ra hình vuông ở class Square và vẽ ra hình tròn ở class Circle.'
      },
      {
        id: 'core_3', type: 'text_input',
        question: 'Nguyên lý chữ S trong SOLID (Single Responsibility Principle) yêu cầu mỗi class chỉ nên có bao nhiêu lý do để thay đổi?',
        correctAnswer: ['một', '1', 'one'],
        explanation: 'Single Responsibility Principle (SRP): Mỗi class hoặc module chỉ nên đảm nhiệm một và chỉ một trách nhiệm (chức năng) duy nhất.'
      }
    ];
    youtubeQuery = 'data structures algorithms object oriented programming full course interview';
    theoryReview = [
      {
        title: 'Độ phức tạp thuật toán (Big O Notation)',
        content: 'Big O đánh giá hiệu năng thuật toán khi kích thước dữ liệu (N) tăng lên.\n- O(1): Thời gian không đổi (Truy xuất phần tử trong mảng bằng index).\n- O(log N): Rất nhanh (Tìm kiếm nhị phân - Binary Search).\n- O(N): Tuyến tính (Duyệt qua mảng).\n- O(N log N): Thuật toán sắp xếp tối ưu (Merge Sort, Quick Sort).\n- O(N^2): Hai vòng lặp lồng nhau (Bubble Sort), cần tránh khi N lớn.'
      },
      {
        title: 'Sự khác biệt giữa Abstract Class và Interface',
        content: 'Abstract Class: Dùng khi các class có mối quan hệ "Is-A" mạnh, chia sẻ cả code đã implement và state (biến). Interface: Dùng để định nghĩa khả năng "Can-Do" (hợp đồng), không chứa implement (tùy ngôn ngữ), một class có thể implement nhiều interface để lách luật đa kế thừa.'
      }
    ];
    codingExercises = [
      {
        title: 'Đảo ngược chuỗi không dùng hàm có sẵn (Two Pointers)',
        language: 'javascript',
        code: `function reverseString(s) {
  let left = 0;
  let right = s.length - 1;
  let arr = s.split('');
  
  while (left < right) {
    // Hoán đổi (Swap) 2 phần tử
    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    
    left++;
    right--;
  }
  
  return arr.join('');
}

console.log(reverseString("interview")); // "weivretni"`,
        task: 'Kỹ thuật Two Pointers (2 con trỏ chạy từ 2 đầu vào giữa) là một mẫu (pattern) kinh điển trong phỏng vấn thuật toán, giúp giải quyết bài toán với độ phức tạp thời gian O(N) và không gian O(1).'
      }
    ];
  }

  return {
    focusArea,
    pathway,
    interviewQuestions,
    youtubeQuery,
    theoryReview,
    codingExercises
  };
}
