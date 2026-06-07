export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Hardcoded exercise bank theo môn — Static First
const STATIC_EXERCISES: Record<string, any[]> = {
  IT001: [
    {
      title: 'Kiểm tra số nguyên tố',
      difficulty: 'Easy',
      description: '<p>Nhập số nguyên <code>n</code> (1 ≤ n ≤ 10^6). Kiểm tra xem n có phải số nguyên tố không.</p><p><b>Input:</b> Một số nguyên n.<br/><b>Output:</b> "YES" nếu là số nguyên tố, "NO" nếu không.</p>',
      hint: 'Chỉ cần kiểm tra ước đến sqrt(n). Dùng vòng lặp for từ 2 đến sqrt(n).',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // TODO: kiểm tra n có phải số nguyên tố?\n    return 0;\n}', python: 'import math\nn = int(input())\n# TODO: kiểm tra n có phải số nguyên tố?\n', javascript: 'const n = parseInt(require("fs").readFileSync("/dev/stdin","utf8"));\n// TODO: kiểm tra n có phải số nguyên tố?\n' },
      testCases: [{ input: '7', expectedOutput: 'YES', isHidden: false }, { input: '1', expectedOutput: 'NO', isHidden: false }, { input: '12', expectedOutput: 'NO', isHidden: true }],
    },
    {
      title: 'Dãy Fibonacci',
      difficulty: 'Easy',
      description: '<p>In ra n số đầu tiên của dãy Fibonacci (F0=0, F1=1, F(n)=F(n-1)+F(n-2)).</p>',
      hint: 'Dùng vòng lặp for, lưu hai giá trị trước đó vào biến a, b.',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // TODO: in n số đầu của Fibonacci\n    return 0;\n}', python: 'n = int(input())\n# TODO: in n số đầu của Fibonacci\n', javascript: '' },
      testCases: [{ input: '5', expectedOutput: '0 1 1 2 3', isHidden: false }, { input: '1', expectedOutput: '0', isHidden: false }],
    },
    {
      title: 'Sắp xếp mảng tăng dần',
      difficulty: 'Medium',
      description: '<p>Nhập n và mảng n số nguyên. In mảng sau khi sắp xếp tăng dần.</p>',
      hint: 'Dùng thuật toán Bubble Sort hoặc hàm sort() có sẵn.',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for(int i=0;i<n;i++) cin >> a[i];\n    // TODO: sắp xếp và in\n    return 0;\n}', python: 'n = int(input())\narr = list(map(int, input().split()))\n# TODO: sắp xếp và in\n', javascript: '' },
      testCases: [{ input: '5\n3 1 4 1 5', expectedOutput: '1 1 3 4 5', isHidden: false }],
    },
  ],
  IT003: [
    {
      title: 'Tìm kiếm nhị phân',
      difficulty: 'Medium',
      description: '<p>Cho mảng n phần tử đã sắp xếp tăng dần và giá trị x. Tìm vị trí của x trong mảng (0-indexed). In -1 nếu không tìm thấy.</p>',
      hint: 'Dùng hai con trỏ lo và hi. Mỗi bước so sánh mid = (lo+hi)/2 với x.',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n, x;\n    cin >> n >> x;\n    vector<int> a(n);\n    for(int i=0;i<n;i++) cin >> a[i];\n    // TODO: Binary Search\n    return 0;\n}', python: 'n, x = map(int, input().split())\narr = list(map(int, input().split()))\n# TODO: Binary Search\n', javascript: '' },
      testCases: [{ input: '5 3\n1 2 3 4 5', expectedOutput: '2', isHidden: false }, { input: '5 6\n1 2 3 4 5', expectedOutput: '-1', isHidden: false }],
    },
    {
      title: 'Kiểm tra cây BST hợp lệ',
      difficulty: 'Hard',
      description: '<p>Cài đặt cấu trúc BST và hàm kiểm tra một cây có phải BST hợp lệ không (inorder traversal phải tăng dần).</p>',
      hint: 'Duyệt inorder và kiểm tra mỗi node phải lớn hơn node trước.',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct Node { int val; Node *left, *right; Node(int v): val(v), left(nullptr), right(nullptr){} };\nbool isValidBST(Node* root, long long lo = LLONG_MIN, long long hi = LLONG_MAX) {\n    // TODO\n    return true;\n}\nint main() {\n    // Build BST from input and check validity\n    return 0;\n}', python: '# TODO: Implement BST validation\n', javascript: '' },
      testCases: [{ input: 'valid', expectedOutput: 'YES', isHidden: false }],
    },
  ],
  IT002: [
    {
      title: 'Lớp Stack (LIFO)',
      difficulty: 'Medium',
      description: '<p>Implement lớp Stack với các phương thức: push(x), pop(), top(), isEmpty(). Sử dụng OOP (class, constructor, destructor).</p>',
      hint: 'Dùng mảng hoặc linked list để lưu dữ liệu. Kiểm tra isEmpty trước khi pop.',
      starterCode: { cpp: '#include<bits/stdc++.h>\nusing namespace std;\nclass Stack {\nprivate:\n    vector<int> data;\npublic:\n    void push(int x) { /* TODO */ }\n    void pop() { /* TODO */ }\n    int top() { /* TODO */ return -1; }\n    bool isEmpty() { /* TODO */ return true; }\n};\nint main() {\n    Stack s;\n    s.push(1); s.push(2);\n    cout << s.top() << endl; // 2\n    s.pop();\n    cout << s.top() << endl; // 1\n    return 0;\n}', python: 'class Stack:\n    def __init__(self):\n        self.data = []\n    def push(self, x): pass  # TODO\n    def pop(self): pass  # TODO\n    def top(self): pass  # TODO\n    def is_empty(self): pass  # TODO\n', javascript: '' },
      testCases: [{ input: 'push 1, push 2, top, pop, top', expectedOutput: '2\n1', isHidden: false }],
    },
  ],
};

async function generateFromGithub(subjectCode: string): Promise<any[] | null> {
  // Pull exercises from TheAlgorithms GitHub
  const repoMap: Record<string, { path: string; title: string; difficulty: string }[]> = {
    IT001: [
      { path: 'math/fibonacci.cpp', title: 'Fibonacci (TheAlgorithms)', difficulty: 'Easy' },
      { path: 'math/prime_factorization.cpp', title: 'Phân tích thừa số nguyên tố', difficulty: 'Medium' },
    ],
    IT003: [
      { path: 'sorting/bubble_sort.cpp', title: 'Bubble Sort', difficulty: 'Easy' },
      { path: 'sorting/quick_sort.cpp', title: 'Quick Sort', difficulty: 'Medium' },
      { path: 'search/binary_search.cpp', title: 'Binary Search', difficulty: 'Medium' },
      { path: 'graph/depth_first_search.cpp', title: 'DFS - Duyệt theo chiều sâu', difficulty: 'Hard' },
      { path: 'graph/dijkstra.cpp', title: 'Dijkstra - Đường đi ngắn nhất', difficulty: 'Hard' },
    ],
  };

  const sources = repoMap[subjectCode];
  if (!sources) return null;

  const results = [];
  for (const src of sources) {
    try {
      const url = `https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/${src.path}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const code = await res.text();

      results.push({
        title: src.title,
        difficulty: src.difficulty,
        description: `<p>Đọc hiểu và phân tích thuật toán từ <strong>TheAlgorithms/C-Plus-Plus</strong>.</p><p>File: <code>${src.path}</code></p>`,
        hint: 'Đọc comments trong code để hiểu từng bước thuật toán.',
        starterCode: { cpp: code, python: '# Hãy implement lại bằng Python\n', javascript: '// Hãy implement lại bằng JavaScript\n' },
        testCases: [{ input: 'Đọc và chạy code', expectedOutput: 'Kết quả đúng theo logic thuật toán.', isHidden: false }],
      });
    } catch {}
  }
  return results.length > 0 ? results : null;
}

async function generateFromAI(subjectCode: string, subjectName: string, coreConcept: string): Promise<any[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { temperature: 0.6, maxOutputTokens: 3000, responseMimeType: 'application/json' },
    });

    let prompt = `Tạo 5 bài tập lập trình thực tế cho môn ${subjectCode} - ${subjectName}. Yêu cầu đa dạng độ khó từ Dễ đến Khó.
Mỗi bài phải có code mẫu C++, Python, JavaScript.
TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI trong toàn bộ nội dung.
JSON: { "exercises": [{ "title": str, "difficulty": "Easy|Medium|Hard", "description": "HTML string", "hint": str, "starterCode": { "cpp": str, "python": str, "javascript": str }, "testCases": [{ "input": str, "expectedOutput": str, "isHidden": false }] }] }`;

    if (coreConcept && coreConcept.length > 50) {
      prompt = `Dựa vào TÀI LIỆU HỌC TẬP sau đây của môn ${subjectCode} - ${subjectName}, hãy tạo 5 bài tập thực hành BÁM SÁT 100% nội dung tài liệu.
TÀI LIỆU HỌC TẬP:
${coreConcept.slice(0, 15000)}

Yêu cầu độ khó từ Dễ đến Khó. Mỗi bài phải có code mẫu C++, Python, JavaScript.
TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI trong toàn bộ nội dung.
Định dạng JSON: { "exercises": [{ "title": str, "difficulty": "Easy|Medium|Hard", "description": "HTML string", "hint": str, "starterCode": { "cpp": str, "python": str, "javascript": str }, "testCases": [{ "input": str, "expectedOutput": str, "isHidden": false }] }] }`;
    }

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(text);
      return data.exercises || null;
    } catch (parseErr) {
      console.error('[Exercise AI] JSON Parse Error. Raw text:', text.slice(0, 200));
      return null;
    }
  } catch (e: any) {
    console.error('[Exercise AI] Error:', e?.message);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { subjectCode, subjectName, sectionId, forceGenerate } = await req.json();
    if (!subjectCode) return NextResponse.json({ error: 'Thiếu mã môn học' }, { status: 400 });

    const subject = await prisma.subject.findFirst({ where: { code: subjectCode } });
    if (!subject) return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 });
    
    let coreConcept = '';
    if (sectionId) {
      const section = await prisma.theorySection.findUnique({ where: { id: sectionId } });
      if (section && section.coreConcept) {
        coreConcept = section.coreConcept;
      }
    }

    // Nếu có sectionId, kiểm tra bài tập riêng của section đó
    const whereClause = sectionId ? { sectionId } : { subjectId: subject.id };
    const existing = await prisma.exercise.count({ where: whereClause });
    if (existing >= 2 && !forceGenerate) {
      return NextResponse.json({ success: true, count: existing, source: 'cache' });
    }

    let exercises: any[] | null = null;
    let source = '';

    // 1. Nếu không có sectionId cụ thể, thử lấy bài tập tĩnh
    if (!sectionId) {
      exercises = STATIC_EXERCISES[subjectCode] || null;
      if (exercises) source = 'static';

      if (!exercises && !forceGenerate) {
        exercises = await generateFromGithub(subjectCode);
        if (exercises) source = 'github';
      }
    }

    // 2. AI sinh bài tập (có kèm nội dung bài giảng nếu có sectionId)
    if (!exercises) {
      exercises = await generateFromAI(subjectCode, subjectName || '', coreConcept);
      if (exercises) source = 'ai';
    }

    if (!exercises) return NextResponse.json({ error: 'Không tạo được bài tập' }, { status: 404 });

    let created = 0;
    for (const ex of exercises) {
      const exercise = await prisma.exercise.create({
        data: {
          title: ex.title,
          difficulty: ex.difficulty || 'Medium',
          description: ex.description || '',
          hint: ex.hint || '',
          starterCode: JSON.stringify(ex.starterCode || {}),
          realWorldScenario: ex.realWorldScenario || null,
          subjectId: subject.id,
          sectionId: sectionId || null,
        },
      });
      for (const tc of (ex.testCases || [])) {
        await prisma.exerciseTestCase.create({
          data: {
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            isHidden: tc.isHidden || false,
            exerciseId: exercise.id,
          },
        });
      }
      created++;
    }

    return NextResponse.json({ success: true, count: created, source });
  } catch (error: any) {
    console.error('[Exercise API]', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
