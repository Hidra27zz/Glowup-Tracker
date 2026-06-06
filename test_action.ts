import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY;

async function test() {
  const genAI = new GoogleGenerativeAI(apiKey!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const systemPrompt = `
Bạn là một Senior Tech Lead và AI Mentor xuất sắc.
Mục tiêu của bạn là đọc Job Description (JD) hoặc yêu cầu học tập của người dùng, phân tích ngữ cảnh của họ, và tạo ra một Lộ trình học tập (Career Blueprint) tùy chỉnh dạng JSON.

Ngữ cảnh người dùng hiện tại: Người dùng là người mới bắt đầu.

Dữ liệu đầu vào của người dùng:
"Sinh viên năm cuối hoặc mới tốt nghiệp các ngành Công nghệ thông tin, Khoa học máy tính, Hệ thống thông tin hoặc các ngành liên quan.
Có kiến thức cơ bản về Python, PostgreSQL, Javescript, HTML/CSS và lập trình hướng đối tượng (OOP)
Có hiểu biết cơ bản về Linux, Git và quy trình làm việc với source code là một lợi thế
Có khả năng tìm hiểu công nghệ mới, tư duy logic tốt và chủ động trong công việc
Kỹ năng làm việc nhóm, giao tiếp và phối hợp công việc tốt.
Có tinh thần trách nhiệm và cam kết trong công việc."

YÊU CẦU ĐẦU RA:
Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau (KHÔNG giải thích gì thêm, KHÔNG format markdown backticks \`\`\`json):
{
  "focusArea": "Tên ngành/Vị trí trọng tâm",
  "pathway": {
    "basic": ["3-4 kỹ năng cốt lõi cần học"],
    "intermediate": ["3-4 kỹ năng trung cấp"],
    "advanced": ["3-4 kỹ năng chuyên sâu"]
  },
  "interviewQuestions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Câu hỏi trắc nghiệm thực tế chuyên sâu (không quá dễ)",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Câu trả lời đúng",
      "explanation": "Giải thích chi tiết tại sao"
    },
    {
      "id": "q2",
      "type": "text_input",
      "question": "Câu hỏi điền từ khóa khóa (không quá dễ)",
      "correctAnswer": ["keyword1", "keyword2"],
      "explanation": "Giải thích chi tiết"
    }
  ],
  "youtubeQuery": "từ khóa tìm kiếm youtube tốt nhất",
  "theoryReview": [
    {
      "title": "Chủ đề lý thuyết 1",
      "content": "Giải thích chuyên sâu chuẩn bị phỏng vấn"
    }
  ],
  "codingExercises": [
    {
      "title": "Tên bài tập thực hành",
      "language": "javascript/python/swift...",
      "code": "Đoạn code snippet để học viên sửa lỗi hoặc phân tích",
      "task": "Yêu cầu bài tập chi tiết"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    console.log("RESPONSE TEXT:");
    console.log(responseText);
    
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace('```json', '');
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace('```', '');
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    
    const parsedData = JSON.parse(jsonStr.trim());
    console.log("PARSE SUCCESS!");
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }
}
test();
