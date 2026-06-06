'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface InterviewSession {
  role: string;
  level: string;
  questions: InterviewQuestion[];
}

export interface InterviewQuestion {
  id: number;
  type: 'behavioral' | 'technical_theory' | 'coding' | 'system_design';
  question: string;
  followUp?: string;
  codeTemplate?: string;
  language?: string;
  hint?: string;
}

export interface InterviewEvaluation {
  overallScore: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  questionFeedbacks: {
    questionId: number;
    question: string;
    userAnswer: string;
    score: number; // 0-10
    feedback: string;
    idealAnswer: string;
  }[];
  recommendation: string;
  nextSteps: string[];
}

// Generate a full interview session plan
export async function generateInterviewSession(
  role: string,
  level: string,
  focusAreas: string
): Promise<InterviewSession> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `Bạn là một Senior Engineering Manager tại một công ty công nghệ hàng đầu.
Hãy tạo một buổi phỏng vấn thực tế cho vị trí sau:
- Vị trí: ${role}
- Level: ${level}
- Kỹ năng tập trung: ${focusAreas}

Tạo đúng 22 câu hỏi phỏng vấn thực tế, đa dạng và chuyên sâu, bố cục như một buổi phỏng vấn thật:
- 3 câu behavioral (giới thiệu bản thân, kinh nghiệm, tình huống)
- 10 câu technical theory (chuyên sâu về ${focusAreas})
- 5 câu coding challenge (viết code/pseudocode thực tế)
- 4 câu system design / architecture thinking

Trả về JSON theo cấu trúc:
{
  "role": "${role}",
  "level": "${level}",
  "questions": [
    {
      "id": 1,
      "type": "behavioral",
      "question": "Câu hỏi bằng tiếng Việt, rõ ràng và chuyên nghiệp",
      "followUp": "Câu hỏi follow-up nếu câu trả lời ngắn (optional)",
      "hint": null
    },
    {
      "id": 2,
      "type": "technical_theory",
      "question": "Câu hỏi technical chuyên sâu",
      "followUp": "Câu follow-up đào sâu hơn",
      "hint": "Gợi ý nhỏ nếu người dùng bí"
    },
    {
      "id": 6,
      "type": "coding",
      "question": "Mô tả bài toán coding rõ ràng với input/output example",
      "codeTemplate": "# Template code để bắt đầu\\ndef solution(...):\\n    pass",
      "language": "python",
      "hint": "Gợi ý thuật toán"
    },
    {
      "id": 19,
      "type": "system_design",
      "question": "Hãy thiết kế hệ thống... (mô tả chi tiết yêu cầu)",
      "hint": "Bắt đầu bằng cách xác định requirements"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/```(?:json)?([\s\S]*?)```/);
    return JSON.parse(match ? match[1].trim() : text);
  } catch (e) {
    console.error('Interview session generation error:', e);
    return getFallbackSession(role, level);
  }
}

// Evaluate a single answer in real-time
export async function evaluateAnswer(
  question: string,
  questionType: string,
  userAnswer: string,
  role: string
): Promise<{ score: number; feedback: string; followUp?: string }> {
  if (!userAnswer || userAnswer.trim().length < 5) {
    return {
      score: 0,
      feedback: 'Câu trả lời quá ngắn hoặc trống. Hãy giải thích chi tiết hơn.',
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `Bạn là interviewer chuyên nghiệp đang phỏng vấn vị trí ${role}.

Câu hỏi: "${question}"
Loại câu hỏi: ${questionType}
Câu trả lời của ứng viên: "${userAnswer}"

Đánh giá câu trả lời và trả về JSON:
{
  "score": <số từ 0-10, chính xác>,
  "feedback": "<nhận xét ngắn gọn 2-3 câu bằng tiếng Việt: điểm tốt, điểm thiếu, gợi ý>",
  "followUp": "<câu hỏi follow-up nếu câu trả lời cần làm rõ hơn, hoặc null>"
}

Tiêu chí chấm điểm:
- 9-10: Câu trả lời xuất sắc, chính xác, có ví dụ thực tế
- 7-8: Tốt, đúng hướng nhưng thiếu chi tiết
- 5-6: Trung bình, hiểu cơ bản nhưng thiếu sâu
- 3-4: Yếu, hiểu sai hoặc thiếu nhiều
- 0-2: Không liên quan hoặc sai hoàn toàn`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/```(?:json)?([\s\S]*?)```/);
    return JSON.parse(match ? match[1].trim() : text);
  } catch {
    return {
      score: 5,
      feedback: 'Câu trả lời đã được ghi nhận. Tiếp tục phỏng vấn.',
    };
  }
}

// Generate final comprehensive evaluation report
export async function generateFinalReport(
  role: string,
  level: string,
  answers: { question: string; type: string; answer: string; score: number; feedback: string }[]
): Promise<InterviewEvaluation> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const answersText = answers
    .map((a, i) => `Q${i + 1} [${a.type}]: ${a.question}\nĐiểm: ${a.score}/10\nTrả lời: ${a.answer}\nFeedback: ${a.feedback}`)
    .join('\n\n');

  const prompt = `Bạn là HR Manager đang tổng kết buổi phỏng vấn cho vị trí ${role} (${level}).

Dưới đây là toàn bộ câu hỏi và câu trả lời của ứng viên:
${answersText}

Hãy tạo báo cáo đánh giá tổng thể bằng tiếng Việt, theo JSON:
{
  "overallScore": <điểm trung bình tổng thể 0-100>,
  "summary": "<tóm tắt tổng thể về ứng viên, 3-4 câu>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>", "<điểm mạnh 3>"],
  "weaknesses": ["<điểm cần cải thiện 1>", "<điểm cần cải thiện 2>"],
  "questionFeedbacks": [
    {
      "questionId": <id>,
      "question": "<câu hỏi>",
      "userAnswer": "<tóm tắt câu trả lời>",
      "score": <điểm 0-10>,
      "feedback": "<nhận xét chi tiết>",
      "idealAnswer": "<câu trả lời lý tưởng ngắn gọn>"
    }
  ],
  "recommendation": "<Kết luận: Pass/Borderline/Fail và lý do>",
  "nextSteps": ["<bước tiếp theo để cải thiện 1>", "<bước tiếp theo 2>", "<bước tiếp theo 3>"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/```(?:json)?([\s\S]*?)```/);
    return JSON.parse(match ? match[1].trim() : text);
  } catch (e) {
    console.error('Final report error:', e);
    const avgScore = answers.reduce((s, a) => s + a.score, 0) / answers.length;
    return {
      overallScore: Math.round(avgScore * 10),
      summary: 'Buổi phỏng vấn đã hoàn thành. Xem chi tiết từng câu bên dưới.',
      strengths: ['Đã hoàn thành toàn bộ câu hỏi', 'Thể hiện sự nghiêm túc trong phỏng vấn'],
      weaknesses: ['Cần cải thiện độ sâu kỹ thuật', 'Cần thêm ví dụ thực tế'],
      questionFeedbacks: answers.map((a, i) => ({
        questionId: i + 1,
        question: a.question,
        userAnswer: a.answer,
        score: a.score,
        feedback: a.feedback,
        idealAnswer: 'Xem tài liệu học tập để nắm rõ hơn.',
      })),
      recommendation: avgScore >= 7 ? 'Pass - Tiếp tục vòng tiếp theo' : 'Borderline - Cần ôn tập thêm',
      nextSteps: ['Ôn tập lại các câu hỏi trả lời chưa tốt', 'Xem lại phần Lý thuyết trong Career Mentor', 'Thực hành coding exercises thêm'],
    };
  }
}

// Fallback session when AI fails
function getFallbackSession(role: string, level: string): InterviewSession {
  return {
    role,
    level,
    questions: [
      { id: 1, type: 'behavioral', question: 'Hãy giới thiệu bản thân và nói về hành trình trở thành lập trình viên của bạn.', followUp: 'Điều gì thúc đẩy bạn chọn công nghệ này?' },
      { id: 2, type: 'behavioral', question: 'Hãy kể về một dự án bạn tự hào nhất. Bạn đóng vai trò gì và bạn học được gì từ đó?', followUp: 'Nếu làm lại, bạn sẽ thay đổi điều gì?' },
      { id: 3, type: 'behavioral', question: 'Bạn xử lý như thế nào khi deadline gấp nhưng task lại phức tạp hơn dự kiến?', hint: 'Dùng STAR method: Situation, Task, Action, Result' },
      { id: 4, type: 'technical_theory', question: 'Giải thích 4 tính chất của OOP và cho ví dụ thực tế với mỗi tính chất.', followUp: 'Polymorphism khác gì với Overloading?' },
      { id: 5, type: 'technical_theory', question: 'RESTful API là gì? Giải thích các HTTP methods và khi nào dùng mỗi loại.', followUp: 'Sự khác biệt giữa PUT và PATCH?' },
      { id: 6, type: 'technical_theory', question: 'Giải thích các mức độ Database Normalization (1NF, 2NF, 3NF) với ví dụ cụ thể.', hint: 'Bắt đầu từ 1NF: mỗi cột có giá trị nguyên tử' },
      { id: 7, type: 'technical_theory', question: 'JWT hoạt động như thế nào? Giải thích 3 phần của JWT và tại sao cần Refresh Token?', followUp: 'Làm thế nào để revoke JWT khi người dùng logout?' },
      { id: 8, type: 'technical_theory', question: 'N+1 Problem trong database là gì? Khi nào nó xảy ra và cách fix?', hint: 'Nghĩ về ORM lazy loading' },
      { id: 9, type: 'technical_theory', question: 'Giải thích sự khác biệt giữa Index Scan và Seq Scan trong PostgreSQL. Khi nào dùng EXPLAIN ANALYZE?', followUp: 'Khi nào việc tạo index lại làm hệ thống chậm hơn?' },
      { id: 10, type: 'technical_theory', question: 'SOLID Principles là gì? Giải thích từng nguyên tắc và cho ví dụ vi phạm + cách fix.', hint: 'S-O-L-I-D: 5 chữ cái đầu của 5 nguyên tắc' },
      { id: 11, type: 'technical_theory', question: 'Docker và container khác Virtual Machine như thế nào? Giải thích Docker image vs container.', followUp: 'Tại sao không dùng localhost trong docker-compose để kết nối DB?' },
      { id: 12, type: 'technical_theory', question: 'Giải thích sự khác nhau giữa Authentication và Authorization. Cho ví dụ HTTP status code tương ứng.', followUp: 'OAuth2 là gì và khác gì với JWT thuần?' },
      { id: 13, type: 'technical_theory', question: 'Git rebase vs git merge khác nhau thế nào? Khi nào nên dùng loại nào?', hint: 'Nghĩ về lịch sử commit và teamwork' },
      { id: 14, type: 'coding', question: 'Viết function `find_duplicates(arr)` nhận vào một list số nguyên và trả về list các số xuất hiện nhiều hơn 1 lần. Ví dụ: [1,2,3,2,4,3,5] → [2,3]', codeTemplate: 'def find_duplicates(arr: list) -> list:\n    # TODO: Implement\n    pass\n\n# Test\nprint(find_duplicates([1,2,3,2,4,3,5]))  # [2, 3]\nprint(find_duplicates([1,2,3]))  # []', language: 'python', hint: 'Dùng dict hoặc set để đếm tần suất' },
      { id: 15, type: 'coding', question: 'Viết function `is_palindrome(s)` kiểm tra một chuỗi có phải palindrome không (không phân biệt hoa/thường, bỏ qua ký tự đặc biệt). Ví dụ: "A man, a plan, a canal: Panama" → True', codeTemplate: 'def is_palindrome(s: str) -> bool:\n    # TODO: Implement\n    pass\n\nprint(is_palindrome("A man, a plan, a canal: Panama"))  # True\nprint(is_palindrome("race a car"))  # False', language: 'python', hint: 'Dùng two pointers hoặc string reversal sau khi clean' },
      { id: 16, type: 'coding', question: 'Viết SQL query lấy danh sách top 5 sản phẩm bán chạy nhất (theo số lượng) trong tháng hiện tại. Tables: products(id, name, price), orders(id, created_at, status), order_items(id, order_id, product_id, quantity)', codeTemplate: '-- Viết SQL query ở đây\n-- Chú ý: chỉ tính orders có status = \'completed\'\n-- Chỉ tính orders trong tháng hiện tại', language: 'sql', hint: 'Dùng JOIN, GROUP BY, và hàm DATE_TRUNC hoặc EXTRACT' },
      { id: 17, type: 'coding', question: 'Implement một simple LRU Cache class với get(key) và put(key, value) methods. Capacity = 3. Khi cache đầy, xóa item ít được dùng gần nhất.', codeTemplate: 'class LRUCache:\n    def __init__(self, capacity: int):\n        # TODO\n        pass\n    \n    def get(self, key: int) -> int:\n        # Trả về -1 nếu key không tồn tại\n        pass\n    \n    def put(self, key: int, value: int) -> None:\n        # Thêm/cập nhật key-value\n        pass\n\n# Test\ncache = LRUCache(3)\ncache.put(1, 1)\ncache.put(2, 2)\ncache.put(3, 3)\nprint(cache.get(1))  # 1 (vừa dùng)\ncache.put(4, 4)      # evict key 2 (LRU)\nprint(cache.get(2))  # -1 (đã bị evict)', language: 'python', hint: 'Dùng OrderedDict hoặc doubly linked list + hashmap' },
      { id: 18, type: 'coding', question: 'Viết một REST API endpoint (pseudocode hoặc FastAPI) để xử lý user registration. Cần validate: email hợp lệ, password ≥ 8 ký tự có chữ hoa+số, check email duplicate, hash password trước khi lưu.', codeTemplate: '# Dùng FastAPI hoặc pseudocode\n# Endpoint: POST /api/auth/register\n# Input: { "email": str, "password": str, "name": str }\n# Output: { "id": int, "email": str, "message": "success" } hoặc error\n\n# TODO: Implement với đầy đủ validation và error handling', language: 'python', hint: 'Dùng pydantic validators, bcrypt để hash password, check duplicate trước khi insert' },
      { id: 19, type: 'system_design', question: 'Thiết kế hệ thống URL Shortener (tương tự bit.ly). Yêu cầu: 100M URLs, 10K requests/giây đọc, 1K requests/giây ghi. Hãy nói về: database schema, cách generate short code, caching strategy, và scale plan.', hint: 'Bắt đầu bằng functional requirements → non-functional requirements → high-level design' },
      { id: 20, type: 'system_design', question: 'Thiết kế hệ thống Notification (push notification, email, SMS). Yêu cầu: gửi 1M notifications/ngày, đảm bảo at-least-once delivery, support retry, tracking trạng thái. Nói về queue, worker, database design.', hint: 'Nghĩ về message queue (RabbitMQ/Kafka), retry mechanism, và idempotency' },
      { id: 21, type: 'system_design', question: 'Bạn phát hiện một API endpoint bị chậm (response time > 5s) trên production với 10K users/ngày. Hãy mô tả quy trình debug và optimize từng bước.', hint: 'APM tools, logging, profiling, database slow query log' },
      { id: 22, type: 'behavioral', question: 'Bạn có câu hỏi nào muốn hỏi về team, dự án hoặc công ty không? (Đây là cơ hội để show sự quan tâm của bạn)', hint: 'Hỏi về tech stack, team culture, growth opportunities...' },
    ],
  };
}
