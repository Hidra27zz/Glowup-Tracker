export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  category: string;
  leetcodeUrl?: string;
  w3Link?: string;
  hint?: string;
  descriptionHtml: string;
  starterCode: Record<string, string>;
  testCases: TestCase[];
}

// ═══════════════════════════════════════════════════════════════════
// PROBLEM BANK - GlowUp LeetCode
// Categories: C++ Basics | LeetCode | Interview | Math | OOP
// Source inspirations: kamyu104/LeetCode-Solutions (GitHub)
// ═══════════════════════════════════════════════════════════════════

export const problemsData: Problem[] = [

  // ────────────────────────────────────────────────────────────────
  // CATEGORY 1: C++ CƠ BẢN (IT001 - Nhập môn Lập trình)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'hello-world',
    title: '#0 · Hello, World!',
    difficulty: 'Easy',
    topic: 'C++ Syntax',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_syntax.asp',
    hint: 'Dung cout va << de in ra man hinh. Them endl hoac "\\n" de xuong dong.',
    descriptionHtml: `
      <p>Bai toan kinh dien mo dau moi hanh trinh lap trinh.</p>
      <p>In ra chinh xac dong chu: <code>Hello, World!</code></p>
      <hr/>
      <p><strong>Output:</strong></p>
      <pre><code>Hello, World!</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Viet code cua ban o day

    return 0;
}`,
      javascript: `// Viet code cua ban o day
`,
      python: `# Viet code cua ban o day
`
    },
    testCases: [
      { input: '', expectedOutput: 'Hello, World!' }
    ]
  },

  {
    id: 'variables-swap',
    title: '#1 · Hoan doi 2 bien (Swap)',
    difficulty: 'Easy',
    topic: 'Variables',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_variables.asp',
    hint: 'Dung phep XOR: a=a^b; b=a^b; a=a^b; hoac phep cong/tru.',
    descriptionHtml: `
      <p>Nhap vao 2 so nguyen A va B. In ra 2 so do nhung da <strong>hoan doi vi tri</strong>
      cho nhau <strong>ma khong dung bien thu 3</strong>.</p>

      <p><strong>Input:</strong> Dong 1: 2 so nguyen A va B cach nhau dau cach.<br/>
      <strong>Output:</strong> In ra B roi A, cach nhau dau cach.</p>

      <pre><code>Input : 5 10
Output: 10 5</code></pre>

      <p><strong>Giai thich 2 cach:</strong></p>
      <ul>
        <li>Cach 1 (Cong/Tru): a = a+b; b = a-b; a = a-b;</li>
        <li>Cach 2 (XOR): a = a^b; b = a^b; a = a^b;</li>
      </ul>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // Hoan doi KHONG dung bien thu 3

    cout << a << " " << b << endl;
    return 0;
}`,
      javascript: `const [a, b] = require('fs').readFileSync('/dev/stdin','utf-8').trim().split(' ').map(Number);
let x = a, y = b;
// Hoan doi KHONG dung bien thu 3

console.log(x, y);`,
      python: `a, b = map(int, input().split())
# Hoan doi KHONG dung bien thu 3

print(a, b)`
    },
    testCases: [
      { input: '5 10', expectedOutput: '10 5' },
      { input: '0 99', expectedOutput: '99 0' },
      { input: '-3 7', expectedOutput: '7 -3' }
    ]
  },

  {
    id: 'if-else-grade',
    title: '#2 · Xep loai hoc luc (If/Else)',
    difficulty: 'Easy',
    topic: 'Conditions',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_conditions.asp',
    hint: 'Kiem tra tu cao xuong thap: >= 9 -> >= 7 -> >= 5 -> >= 3.5 -> con lai.',
    descriptionHtml: `
      <p>Nhap vao mot so diem thuc (0-10). Xep loai hoc luc:</p>
      <table>
        <tr><th>Diem</th><th>Xep loai</th></tr>
        <tr><td>&gt;= 9.0</td><td>Xuat sac</td></tr>
        <tr><td>&gt;= 7.0</td><td>Gioi</td></tr>
        <tr><td>&gt;= 5.0</td><td>Kha</td></tr>
        <tr><td>&gt;= 3.5</td><td>Trung binh</td></tr>
        <tr><td>&lt; 3.5</td><td>Yeu</td></tr>
      </table>
      <pre><code>Input : 8.5
Output: Gioi</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    float score;
    cin >> score;

    // Viet code phan loai o day

    return 0;
}`,
      javascript: `const score = parseFloat(require('fs').readFileSync('/dev/stdin','utf-8').trim());
// Viet code phan loai o day`,
      python: `score = float(input())
# Viet code phan loai o day`
    },
    testCases: [
      { input: '9.5', expectedOutput: 'Xuat sac' },
      { input: '8.5', expectedOutput: 'Gioi' },
      { input: '6.0', expectedOutput: 'Kha' },
      { input: '4.0', expectedOutput: 'Trung binh' },
      { input: '2.0', expectedOutput: 'Yeu' }
    ]
  },

  {
    id: 'for-loop-sum',
    title: '#3 · Tinh tong 1+2+...+N (For Loop)',
    difficulty: 'Easy',
    topic: 'For Loops',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_for_loop.asp',
    hint: 'Cong thuc Gauss: S = N*(N+1)/2. Nhanh hon vong lap O(N).',
    descriptionHtml: `
      <p>Nhap vao so nguyen duong N. Tinh va in ra tong:</p>
      <p><code>S = 1 + 2 + 3 + ... + N</code></p>
      <pre><code>Input : 100
Output: 5050</code></pre>
      <p><em>Thu thach nang cao: Giai bang cong thuc Gauss O(1) thay vi vong lap?</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;

    long long sum = 0;
    for (long long i = 1; i <= n; i++) {
        // Cong don tung gia tri
    }

    cout << sum << endl;
    return 0;
}`,
      javascript: `const n = BigInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
let sum = 0n;
for (let i = 1n; i <= n; i++) sum += i;
console.log(sum.toString());`,
      python: `n = int(input())
print(n*(n+1)//2)`
    },
    testCases: [
      { input: '10', expectedOutput: '55' },
      { input: '100', expectedOutput: '5050' },
      { input: '1000', expectedOutput: '500500' },
      { input: '1', expectedOutput: '1' }
    ]
  },

  {
    id: 'while-factorial',
    title: '#4 · Giai thua N! (While Loop)',
    difficulty: 'Easy',
    topic: 'While Loops',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_while_loop.asp',
    hint: '0! = 1. Nhan tu 1 den N. N <= 12 tranh tran so int.',
    descriptionHtml: `
      <p>Nhap vao so nguyen N (0 &lt;= N &lt;= 12). In ra N! (giai thua).</p>
      <ul>
        <li>0! = 1, 1! = 1</li>
        <li>5! = 1 * 2 * 3 * 4 * 5 = 120</li>
        <li>12! = 479001600</li>
      </ul>
      <pre><code>Input : 5
Output: 120</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    long long result = 1;
    int i = 1;
    while (i <= n) {
        // Nhan dan
        i++;
    }

    cout << result << endl;
    return 0;
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
let result = 1;
let i = 1;
while (i <= n) { result *= i++; }
console.log(result);`,
      python: `n = int(input())
result = 1
i = 1
while i <= n:
    result *= i
    i += 1
print(result)`
    },
    testCases: [
      { input: '0', expectedOutput: '1' },
      { input: '1', expectedOutput: '1' },
      { input: '5', expectedOutput: '120' },
      { input: '10', expectedOutput: '3628800' },
      { input: '12', expectedOutput: '479001600' }
    ]
  },

  {
    id: 'array-max-min',
    title: '#5 · Tim Max & Min trong mang (Arrays)',
    difficulty: 'Easy',
    topic: 'Arrays',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_arrays.asp',
    hint: 'Khoi tao max = INT_MIN, min = INT_MAX. Duyet mang so sanh tung phan tu.',
    descriptionHtml: `
      <p>Nhap vao N so nguyen. Tim va in ra gia tri <strong>lon nhat (Max)</strong>
      va <strong>nho nhat (Min)</strong>, cach nhau dau cach.</p>
      <p><strong>Input:</strong> Dong 1: N. Dong 2: N so nguyen.</p>
      <pre><code>Input :
5
3 1 4 1 5
Output: 5 1</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;

    int maxVal = INT_MIN, minVal = INT_MAX;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        // Cap nhat max va min
    }

    cout << maxVal << " " << minVal << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const arr = lines[1].split(' ').map(Number);
console.log(Math.max(...arr), Math.min(...arr));`,
      python: `n = int(input())
arr = list(map(int, input().split()))
print(max(arr), min(arr))`
    },
    testCases: [
      { input: '5\n3 1 4 1 5', expectedOutput: '5 1' },
      { input: '1\n42', expectedOutput: '42 42' },
      { input: '4\n-5 -1 -3 -2', expectedOutput: '-1 -5' }
    ]
  },

  {
    id: 'string-ops',
    title: '#6 · Dem nguyen am trong chuoi (Strings)',
    difficulty: 'Easy',
    topic: 'Strings',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_strings.asp',
    hint: 'Duyet tung ky tu, kiem tra xem no co trong tap {a,e,i,o,u,A,E,I,O,U} khong.',
    descriptionHtml: `
      <p>Nhap vao mot chuoi ky tu ASCII (chi chu cai, khong dau cach).
      Dem va in ra so luong <strong>nguyen am (vowels)</strong> trong chuoi do.</p>
      <p>Nguyen am: a, e, i, o, u (ca hoa ca thuong)</p>
      <pre><code>Input : Hello
Output: 2</code></pre>
      <pre><code>Input : programming
Output: 3</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;

    int count = 0;
    string vowels = "aeiouAEIOU";
    for (char c : s) {
        // Kiem tra nguyen am
    }

    cout << count << endl;
    return 0;
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf-8').trim();
const count = s.split('').filter(c => 'aeiouAEIOU'.includes(c)).length;
console.log(count);`,
      python: `s = input()
print(sum(1 for c in s if c in 'aeiouAEIOU'))`
    },
    testCases: [
      { input: 'Hello', expectedOutput: '2' },
      { input: 'programming', expectedOutput: '3' },
      { input: 'bcdfg', expectedOutput: '0' },
      { input: 'aeiou', expectedOutput: '5' }
    ]
  },

  {
    id: 'recursion-fibonacci',
    title: '#7 · Fibonacci - De quy & Memoization',
    difficulty: 'Medium',
    topic: 'Functions & Recursion',
    category: 'C++ Basics',
    w3Link: 'https://www.w3schools.com/cpp/cpp_functions.asp',
    hint: 'De quy thuan: O(2^N) - cham. Dung map<int,int> memo de cache ket qua = O(N).',
    descriptionHtml: `
      <p>Tinh so Fibonacci thu N. Day Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, ...</p>
      <p><code>fib(0)=0, fib(1)=1, fib(N) = fib(N-1) + fib(N-2)</code></p>
      <pre><code>Input : 10
Output: 55</code></pre>
      <p><strong>Canh bao hieu nang:</strong></p>
      <ul>
        <li>De quy thuan: O(2^N) - vo cung cham voi N lon</li>
        <li>Memoization (Top-Down DP): O(N) - nen dung</li>
        <li>Bottom-Up DP: O(N) voi O(1) space - tot nhat</li>
      </ul>
      <p><em>Thu thach: Viet ca 3 cach va so sanh toc do!</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <unordered_map>
using namespace std;

unordered_map<int, long long> memo;

long long fib(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    // Tinh va luu vao memo
    return memo[n] = fib(n-1) + fib(n-2);
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`,
      javascript: `const memo = new Map();
function fib(n) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const result = fib(n-1) + fib(n-2);
    memo.set(n, result);
    return result;
}
const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
console.log(fib(n));`,
      python: `import sys
sys.setrecursionlimit(10000)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

n = int(input())
print(fib(n))`
    },
    testCases: [
      { input: '0', expectedOutput: '0' },
      { input: '1', expectedOutput: '1' },
      { input: '7', expectedOutput: '13' },
      { input: '10', expectedOutput: '55' },
      { input: '20', expectedOutput: '6765' }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // CATEGORY 2: LEETCODE CLASSICS (theo kamyu104/LeetCode-Solutions)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'lc-001-two-sum',
    title: 'LC #1 · Two Sum [Easy]',
    difficulty: 'Easy',
    topic: 'Hash Map',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    hint: 'Voi moi nums[i], kiem tra xem (target - nums[i]) da ton tai trong HashMap chua.',
    descriptionHtml: `
      <p><strong>LeetCode #1 - Most Classic Problem</strong></p>
      <p>Cho mang so nguyen <code>nums</code> va <code>target</code>.
      Tra ve chi so (index) cua 2 phan tu co tong bang target.</p>
      <p>Giai thuat O(N) bang <strong>Hash Map</strong> - Khong duoc dung vong lap long O(N^2)!</p>
      <pre><code>Input : 4 9
2 7 11 15
Output: 0 1</code></pre>
      <p><strong>Giai thich Hash Map O(N):</strong></p>
      <p>Voi moi phan tu nums[i], kiem tra xem <code>(target - nums[i])</code>
      da ton tai trong map chua. Neu co thi in ra 2 chi so. Neu chua, them nums[i]->i vao map.</p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    unordered_map<int, int> seen; // value -> index
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            cout << seen[complement] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf-8').trim().split(/\s+/);
const n = parseInt(input[0]), target = parseInt(input[1]);
const nums = input.slice(2, 2+n).map(Number);
const seen = new Map();
for (let i = 0; i < n; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
        console.log(seen.get(complement), i);
        process.exit(0);
    }
    seen.set(nums[i], i);
}`,
      python: `data = input().split()
n, target = int(data[0]), int(data[1])
nums = list(map(int, input().split()))
seen = {}
for i, v in enumerate(nums):
    c = target - v
    if c in seen:
        print(seen[c], i)
        break
    seen[v] = i`
    },
    testCases: [
      { input: '4 9\n2 7 11 15', expectedOutput: '0 1' },
      { input: '3 6\n3 2 4', expectedOutput: '1 2' },
      { input: '2 6\n3 3', expectedOutput: '0 1' }
    ]
  },

  {
    id: 'lc-020-valid-parentheses',
    title: 'LC #20 · Valid Parentheses [Easy]',
    difficulty: 'Easy',
    topic: 'Stack',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    hint: 'Dung Stack. Khi gap dong mo ([{ thi push. Khi gap dong dong )]} thi pop va kiem tra xem co khop khong.',
    descriptionHtml: `
      <p><strong>LeetCode #20 - Stack Classic</strong></p>
      <p>Cho mot chuoi chi gom cac ky tu: <code>( ) [ ] { }</code></p>
      <p>Tra loi <code>YES</code> neu chuoi la <strong>hop le (valid)</strong>, nguoc lai <code>NO</code>.</p>
      <p>Chuoi hop le khi: moi dong mo co dong dong tuong ung, theo dung thu tu.</p>
      <pre><code>Input : ()[]{}
Output: YES

Input : ([)]
Output: NO

Input : {[]}
Output: YES</code></pre>
      <p><strong>Giai thuat Stack O(N):</strong></p>
      <ol>
        <li>Gap dong mo ( [ { -> push vao stack.</li>
        <li>Gap dong dong ) ] } -> pop tu stack, kiem tra xem co khop khong.</li>
        <li>Cuoi cung: stack phai rong thi moi hop le.</li>
      </ol>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <stack>
#include <unordered_map>
using namespace std;

int main() {
    string s;
    cin >> s;

    stack<char> st;
    unordered_map<char, char> pairs = {
        {')', '('}, {']', '['}, {'}', '{'}
    };

    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty() || st.top() != pairs[c]) {
                cout << "NO" << endl;
                return 0;
            }
            st.pop();
        }
    }

    cout << (st.empty() ? "YES" : "NO") << endl;
    return 0;
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf-8').trim();
const st = [];
const pairs = {')':'(', ']':'[', '}':'{'};
for (const c of s) {
    if ('([{'.includes(c)) { st.push(c); }
    else {
        if (!st.length || st[st.length-1] !== pairs[c]) { console.log('NO'); process.exit(0); }
        st.pop();
    }
}
console.log(st.length === 0 ? 'YES' : 'NO');`,
      python: `s = input().strip()
st = []
pairs = {')':'(', ']':'[', '}':'{'}
for c in s:
    if c in '([{':
        st.append(c)
    else:
        if not st or st[-1] != pairs[c]:
            print('NO'); exit()
        st.pop()
print('YES' if not st else 'NO')`
    },
    testCases: [
      { input: '()[]{}\n', expectedOutput: 'YES' },
      { input: '([)]\n', expectedOutput: 'NO' },
      { input: '{[]}\n', expectedOutput: 'YES' },
      { input: '(\n', expectedOutput: 'NO' }
    ]
  },

  {
    id: 'lc-121-buy-sell-stock',
    title: 'LC #121 · Best Time Buy & Sell Stock [Easy]',
    difficulty: 'Easy',
    topic: 'Greedy / Sliding Min',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    hint: 'Theo doi gia thap nhat da thay (minPrice). Voi moi ngay, tinh loi nhuan hien tai = price - minPrice. Cap nhat maxProfit.',
    descriptionHtml: `
      <p><strong>LeetCode #121 - Greedy Classic</strong></p>
      <p>Cho mang gia co phieu theo tung ngay. Ban chi duoc mua mot lan va ban mot lan.
      Tinh <strong>loi nhuan toi da</strong> co the dat duoc.</p>
      <p>Neu khong the co loi nhuan, in ra <code>0</code>.</p>
      <pre><code>Input : 6
7 1 5 3 6 4
Output: 5</code></pre>
      <p>Giai thich: Mua ngay 2 (gia=1), ban ngay 5 (gia=6) -> loi nhuan = 6-1 = 5.</p>
      <pre><code>Input : 5
7 6 4 3 1
Output: 0</code></pre>
      <p>Giai thich: Gia lien tuc giam, khong the co loi, ket qua = 0.</p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) cin >> prices[i];

    int minPrice = INT_MAX, maxProfit = 0;
    for (int price : prices) {
        minPrice = min(minPrice, price);
        maxProfit = max(maxProfit, price - minPrice);
    }

    cout << maxProfit << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const prices = lines[1].split(' ').map(Number);
let minP = Infinity, maxP = 0;
for (const p of prices) {
    minP = Math.min(minP, p);
    maxP = Math.max(maxP, p - minP);
}
console.log(maxP);`,
      python: `n = int(input())
prices = list(map(int, input().split()))
min_price = float('inf'); max_profit = 0
for p in prices:
    min_price = min(min_price, p)
    max_profit = max(max_profit, p - min_price)
print(max_profit)`
    },
    testCases: [
      { input: '6\n7 1 5 3 6 4', expectedOutput: '5' },
      { input: '5\n7 6 4 3 1', expectedOutput: '0' },
      { input: '3\n1 2 3', expectedOutput: '2' },
      { input: '1\n5', expectedOutput: '0' }
    ]
  },

  {
    id: 'lc-283-move-zeroes',
    title: 'LC #283 · Move Zeroes [Easy]',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/',
    hint: 'Dung 2 con tro: insertPos chi vi tri nen dat so khac 0. Khi gap so khac 0, dat vao insertPos va tang len.',
    descriptionHtml: `
      <p><strong>LeetCode #283 - Two Pointer</strong></p>
      <p>Cho mang so nguyen. Dich chuyen tat ca so <code>0</code> ve cuoi mang,
      trong khi <strong>giu nguyen thu tu tuong doi</strong> cua cac so khac 0.</p>
      <p><strong>Thuc hien In-Place (khong dung mang phu)!</strong></p>
      <pre><code>Input : 5
0 1 0 3 12
Output: 1 3 12 0 0

Input : 3
0 0 1
Output: 1 0 0</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int insertPos = 0;
    // Buoc 1: Day tat ca so khac 0 ve phia truoc
    for (int i = 0; i < n; i++) {
        if (nums[i] != 0) {
            nums[insertPos++] = nums[i];
        }
    }
    // Buoc 2: Dien 0 vao cac o con lai
    while (insertPos < n) {
        nums[insertPos++] = 0;
    }

    for (int i = 0; i < n; i++) {
        cout << nums[i];
        if (i < n-1) cout << " ";
    }
    cout << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const nums = lines[1].split(' ').map(Number);
let pos = 0;
for (const v of nums) if (v !== 0) nums[pos++] = v;
while (pos < nums.length) nums[pos++] = 0;
console.log(nums.join(' '));`,
      python: `n = int(input())
nums = list(map(int, input().split()))
pos = 0
for v in nums:
    if v != 0:
        nums[pos] = v; pos += 1
while pos < n:
    nums[pos] = 0; pos += 1
print(*nums)`
    },
    testCases: [
      { input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0' },
      { input: '3\n0 0 1', expectedOutput: '1 0 0' },
      { input: '3\n1 2 3', expectedOutput: '1 2 3' }
    ]
  },

  {
    id: 'lc-206-reverse-linked-list',
    title: 'LC #206 · Reverse Linked List [Easy]',
    difficulty: 'Easy',
    topic: 'Linked List',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    hint: 'Dung 3 con tro: prev=NULL, curr=head, next. Lap: next=curr->next; curr->next=prev; prev=curr; curr=next.',
    descriptionHtml: `
      <p><strong>LeetCode #206 - Linked List Fundamental</strong></p>
      <p>Dao nguoc mot danh sach lien ket don. In ra cac phan tu cua danh sach sau khi dao nguoc.</p>
      <p><em>Trong bai nay, ban phai tu mo phong Linked List bang mang vi moi truong la stdin.</em></p>
      <pre><code>Input : 5
1 2 3 4 5
Output: 5 4 3 2 1

Input : 2
1 2
Output: 2 1</code></pre>
      <p><strong>Giai thuat 3 con tro O(N):</strong></p>
      <ol>
        <li>prev = NULL, curr = head</li>
        <li>Lap: next = curr.next; curr.next = prev; prev = curr; curr = next</li>
        <li>Ket qua: prev la head moi</li>
      </ol>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

int main() {
    int n; cin >> n;
    ListNode* dummy = new ListNode(0);
    ListNode* tail = dummy;
    for (int i = 0; i < n; i++) {
        int val; cin >> val;
        tail->next = new ListNode(val);
        tail = tail->next;
    }

    ListNode* head = reverseList(dummy->next);
    while (head) {
        cout << head->val;
        if (head->next) cout << " ";
        head = head->next;
    }
    cout << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const arr = lines[1].split(' ');
console.log(arr.reverse().join(' '));`,
      python: `n = int(input())
arr = input().split()
print(*arr[::-1])`
    },
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
      { input: '2\n1 2', expectedOutput: '2 1' },
      { input: '1\n5', expectedOutput: '5' }
    ]
  },

  {
    id: 'lc-217-contains-duplicate',
    title: 'LC #217 · Contains Duplicate [Easy]',
    difficulty: 'Easy',
    topic: 'Hash Set',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
    hint: 'Dung unordered_set. Insert tung phan tu. Neu insert that bai (da ton tai) -> in YES.',
    descriptionHtml: `
      <p><strong>LeetCode #217</strong></p>
      <p>Kiem tra xem mang co chua bat ky gia tri nao xuat hien <strong>it nhat 2 lan</strong> khong.</p>
      <p>In <code>YES</code> neu co phan tu trung lap, in <code>NO</code> neu tat ca phan tu la duy nhat.</p>
      <pre><code>Input : 4
1 2 3 1
Output: YES

Input : 3
1 2 3
Output: NO</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <unordered_set>
using namespace std;

int main() {
    int n; cin >> n;
    unordered_set<int> seen;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (seen.count(x)) {
            cout << "YES" << endl;
            return 0;
        }
        seen.insert(x);
    }
    cout << "NO" << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const arr = lines[1].split(' ');
console.log(new Set(arr).size < arr.length ? 'YES' : 'NO');`,
      python: `n = int(input())
arr = input().split()
print('YES' if len(set(arr)) < n else 'NO')`
    },
    testCases: [
      { input: '4\n1 2 3 1', expectedOutput: 'YES' },
      { input: '3\n1 2 3', expectedOutput: 'NO' },
      { input: '5\n1 1 1 3 3', expectedOutput: 'YES' }
    ]
  },

  {
    id: 'lc-344-reverse-string',
    title: 'LC #344 · Reverse String [Easy]',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-string/',
    hint: 'Dung 2 con tro left=0 va right=n-1. Swap s[left] va s[right], tien left++ va right-- cho den khi gap nhau.',
    descriptionHtml: `
      <p><strong>LeetCode #344 - In-Place Reverse</strong></p>
      <p>Dao nguoc chuoi <strong>tai cho (in-place)</strong> bang <strong>Two Pointer</strong>. Khong dung ham reverse() co san!</p>
      <pre><code>Input : hello
Output: olleh

Input : Hannah
Output: hannaH</code></pre>
      <p><strong>Two Pointer O(N):</strong></p>
      <p>left = 0, right = n-1. Swap s[left] &lt;-&gt; s[right]. left++, right--. Lap den khi left >= right.</p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    int left = 0, right = s.size() - 1;
    while (left < right) {
        swap(s[left++], s[right--]);
    }
    cout << s << endl;
    return 0;
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('');
let l = 0, r = s.length - 1;
while (l < r) { [s[l], s[r]] = [s[r], s[l]]; l++; r--; }
console.log(s.join(''));`,
      python: `s = list(input())
l, r = 0, len(s)-1
while l < r:
    s[l], s[r] = s[r], s[l]
    l += 1; r -= 1
print(''.join(s))`
    },
    testCases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'Hannah', expectedOutput: 'hannaH' },
      { input: 'a', expectedOutput: 'a' }
    ]
  },

  {
    id: 'lc-070-climbing-stairs',
    title: 'LC #70 · Climbing Stairs [Easy - DP]',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
    hint: 'day(n) = day(n-1) + day(n-2). Giong Fibonacci! Co the leo 1 hoac 2 bac moi lan.',
    descriptionHtml: `
      <p><strong>LeetCode #70 - DP Introduction</strong></p>
      <p>Ban dang leo mot cau thang N bac. Moi lan ban co the leo <strong>1 hoac 2 bac</strong>.
      Dem xem co bao nhieu <strong>cach khac nhau</strong> de len den dinh?</p>
      <pre><code>Input : 2
Output: 2
(cach 1: 1+1, cach 2: 2)</code></pre>
      <pre><code>Input : 3
Output: 3
(cach: 1+1+1, 1+2, 2+1)</code></pre>
      <p><strong>Loi giai DP O(N):</strong></p>
      <p>dp[i] = so cach len bac thu i = dp[i-1] + dp[i-2]</p>
      <p>Nhan xet: Bai nay tuong duong tinh Fibonacci(N+1)!</p>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    if (n <= 2) {
        cout << n << endl;
        return 0;
    }

    long long prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        long long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }

    cout << prev1 << endl;
    return 0;
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
if (n <= 2) { console.log(n); process.exit(); }
let a = 1, b = 2;
for (let i = 3; i <= n; i++) { [a, b] = [b, a+b]; }
console.log(b);`,
      python: `n = int(input())
if n <= 2:
    print(n)
else:
    a, b = 1, 2
    for _ in range(3, n+1): a, b = b, a+b
    print(b)`
    },
    testCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '5', expectedOutput: '8' },
      { input: '10', expectedOutput: '89' }
    ]
  },

  {
    id: 'lc-053-max-subarray',
    title: 'LC #53 · Maximum Subarray (Kadane) [Medium]',
    difficulty: 'Medium',
    topic: "Kadane's Algorithm",
    category: 'LeetCode',
    leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
    hint: 'Kadane: currMax = max(nums[i], currMax + nums[i]). globalMax = max(globalMax, currMax).',
    descriptionHtml: `
      <p><strong>LeetCode #53 - Kadane's Algorithm</strong></p>
      <p>Tim <strong>tong lon nhat</strong> cua mot day con lien tiep (subarray) trong mang so nguyen.
      Day con phai co it nhat 1 phan tu.</p>
      <pre><code>Input : 9
-2 1 -3 4 -1 2 1 -5 4
Output: 6
([4,-1,2,1] co tong = 6)</code></pre>
      <p><strong>Giai thuat Kadane O(N):</strong></p>
      <ol>
        <li>currMax = nums[0], globalMax = nums[0]</li>
        <li>Duyet tu i=1: currMax = max(nums[i], currMax + nums[i])</li>
        <li>globalMax = max(globalMax, currMax)</li>
      </ol>
      <p><em>Truc giac: Neu tong hien tai am, bat dau lai tu phan tu hien tai.</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <climits>
using namespace std;

int main() {
    int n; cin >> n;

    int currMax, globalMax;
    cin >> currMax;
    globalMax = currMax;

    for (int i = 1; i < n; i++) {
        int x; cin >> x;
        currMax = max(x, currMax + x);
        globalMax = max(globalMax, currMax);
    }

    cout << globalMax << endl;
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const nums = lines[1].split(' ').map(Number);
let currMax = nums[0], globalMax = nums[0];
for (let i = 1; i < nums.length; i++) {
    currMax = Math.max(nums[i], currMax + nums[i]);
    globalMax = Math.max(globalMax, currMax);
}
console.log(globalMax);`,
      python: `n = int(input())
nums = list(map(int, input().split()))
curr = best = nums[0]
for x in nums[1:]:
    curr = max(x, curr + x)
    best = max(best, curr)
print(best)`
    },
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { input: '1\n1', expectedOutput: '1' },
      { input: '3\n-1 -2 -3', expectedOutput: '-1' },
      { input: '4\n5 4 -1 7', expectedOutput: '15' }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // CATEGORY 3: PHONG VAN KY THUAT (Interview Questions)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'iv-fizzbuzz',
    title: 'INTERVIEW · FizzBuzz Classic',
    difficulty: 'Easy',
    topic: 'Modulo / Interview',
    category: 'Interview',
    hint: 'Kiem tra chia het cho 15 truoc (FizzBuzz), roi moi kiem tra 3 (Fizz) va 5 (Buzz).',
    descriptionHtml: `
      <p><strong>Cau hoi phong van pho bien nhat the gioi!</strong></p>
      <p>In ra cac so tu 1 den N. Nhung:</p>
      <ul>
        <li>So chia het cho 3: In "Fizz"</li>
        <li>So chia het cho 5: In "Buzz"</li>
        <li>So chia het cho ca 3 va 5: In "FizzBuzz"</li>
        <li>Con lai: In so do binh thuong</li>
      </ul>
      <pre><code>Input : 15
Output:
1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz</code></pre>
      <p><em>Dau bep: In tren 1 dong, cach nhau dau cach.</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) cout << "FizzBuzz";
        else if (i % 3 == 0) cout << "Fizz";
        else if (i % 5 == 0) cout << "Buzz";
        else cout << i;
        if (i < n) cout << " ";
    }
    cout << endl;
    return 0;
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
const res = [];
for (let i=1; i<=n; i++) {
    if (i%15===0) res.push('FizzBuzz');
    else if (i%3===0) res.push('Fizz');
    else if (i%5===0) res.push('Buzz');
    else res.push(i);
}
console.log(res.join(' '));`,
      python: `n = int(input())
res = []
for i in range(1, n+1):
    if i%15==0: res.append('FizzBuzz')
    elif i%3==0: res.append('Fizz')
    elif i%5==0: res.append('Buzz')
    else: res.append(str(i))
print(' '.join(res))`
    },
    testCases: [
      { input: '15', expectedOutput: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz' },
      { input: '5', expectedOutput: '1 2 Fizz 4 Buzz' },
      { input: '1', expectedOutput: '1' }
    ]
  },

  {
    id: 'iv-palindrome-check',
    title: 'INTERVIEW · Kiem tra Palindrome',
    difficulty: 'Easy',
    topic: 'String / Two Pointer',
    category: 'Interview',
    hint: 'Two Pointer: left=0, right=n-1. So sanh s[left] va s[right]. Neu bat ky cap nao khac nhau -> KHONG phai palindrome.',
    descriptionHtml: `
      <p><strong>Cau hoi phong van thuong gap - String Manipulation</strong></p>
      <p>Kiem tra xem mot chuoi co phai <strong>Palindrome</strong> khong (doc xuoi hay nguoc deu giong nhau).</p>
      <p>In ra <code>YES</code> hoac <code>NO</code>.</p>
      <pre><code>Input : racecar
Output: YES

Input : hello
Output: NO

Input : abba
Output: YES</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    int l = 0, r = s.size() - 1;
    while (l < r) {
        if (s[l++] != s[r--]) {
            cout << "NO" << endl;
            return 0;
        }
    }
    cout << "YES" << endl;
    return 0;
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf-8').trim();
console.log(s === s.split('').reverse().join('') ? 'YES' : 'NO');`,
      python: `s = input().strip()
print('YES' if s == s[::-1] else 'NO')`
    },
    testCases: [
      { input: 'racecar', expectedOutput: 'YES' },
      { input: 'hello', expectedOutput: 'NO' },
      { input: 'abba', expectedOutput: 'YES' },
      { input: 'a', expectedOutput: 'YES' }
    ]
  },

  {
    id: 'iv-prime-check',
    title: 'INTERVIEW · Kiem tra So Nguyen To',
    difficulty: 'Easy',
    topic: 'Math / Number Theory',
    category: 'Interview',
    hint: 'Chi can kiem tra den sqrt(N). Neu N chia het cho bat ky so nao tu 2 den sqrt(N) thi khong phai so nguyen to.',
    descriptionHtml: `
      <p><strong>Cau hoi co ban trong phong van Backend/Algorithm</strong></p>
      <p>Kiem tra xem so N co phai <strong>so nguyen to</strong> khong.
      So nguyen to chi chia het cho 1 va chinh no, va phai lon hon 1.</p>
      <p>In <code>YES</code> neu la so nguyen to, <code>NO</code> neu khong.</p>
      <pre><code>Input : 7
Output: YES

Input : 12
Output: NO

Input : 1
Output: NO</code></pre>
      <p><strong>Toi uu O(sqrt N):</strong> Chi kiem tra uoc den sqrt(N).</p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <cmath>
using namespace std;

bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    long long n;
    cin >> n;
    cout << (isPrime(n) ? "YES" : "NO") << endl;
    return 0;
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n%i===0) return false;
    return true;
}
console.log(isPrime(n) ? 'YES' : 'NO');`,
      python: `import math
n = int(input())
def is_prime(n):
    if n < 2: return False
    for i in range(2, int(math.sqrt(n))+1):
        if n%i==0: return False
    return True
print('YES' if is_prime(n) else 'NO')`
    },
    testCases: [
      { input: '7', expectedOutput: 'YES' },
      { input: '12', expectedOutput: 'NO' },
      { input: '1', expectedOutput: 'NO' },
      { input: '2', expectedOutput: 'YES' },
      { input: '97', expectedOutput: 'YES' }
    ]
  },

  {
    id: 'iv-binary-search',
    title: 'INTERVIEW · Tim Kiem Nhi Phan (Binary Search)',
    difficulty: 'Medium',
    topic: 'Binary Search',
    category: 'Interview',
    hint: 'mid = left + (right-left)/2. Neu nums[mid] == target -> tra ve mid. Neu < target -> left = mid+1. Neu > target -> right = mid-1.',
    descriptionHtml: `
      <p><strong>Giai thuat tim kiem co ban nhat trong phong van</strong></p>
      <p>Cho mang da <strong>sap xep tang dan</strong> gom N phan tu va mot gia tri target.
      Tim chi so (index) cua target trong mang. Neu khong tim thay, in ra <code>-1</code>.</p>
      <p><strong>Bat buoc dung Binary Search O(log N), khong duoc dung vong lap O(N)!</strong></p>
      <pre><code>Input : 7 9
1 3 5 7 9 11 13
Output: 4</code></pre>
      <pre><code>Input : 5 6
1 3 5 7 9
Output: -1</code></pre>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            cout << mid << endl;
            return 0;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    cout << -1 << endl;
    return 0;
}`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const [n, target] = input[0].split(' ').map(Number);
const nums = input[1].split(' ').map(Number);
let l = 0, r = n-1;
while (l <= r) {
    const mid = Math.floor((l+r)/2);
    if (nums[mid]===target) { console.log(mid); process.exit(); }
    else if (nums[mid] < target) l = mid+1;
    else r = mid-1;
}
console.log(-1);`,
      python: `line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))
l, r = 0, n-1
while l <= r:
    mid = (l+r)//2
    if nums[mid] == target: print(mid); exit()
    elif nums[mid] < target: l = mid+1
    else: r = mid-1
print(-1)`
    },
    testCases: [
      { input: '7 9\n1 3 5 7 9 11 13', expectedOutput: '4' },
      { input: '5 6\n1 3 5 7 9', expectedOutput: '-1' },
      { input: '1 5\n5', expectedOutput: '0' },
      { input: '4 1\n1 3 5 7', expectedOutput: '0' }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // CATEGORY 4: TOAN HOC (MA006 - Giai Tich, MA004 - Cau Truc Roi Rac)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'math-gcd-lcm',
    title: 'MATH · UCLN va BCNN (GCD & LCM)',
    difficulty: 'Easy',
    topic: 'Number Theory',
    category: 'Mathematics',
    hint: 'Thuat toan Euclid: gcd(a,b) = gcd(b, a%b). Dung khi b=0 thi a la UCLN. LCM = a/gcd(a,b) * b.',
    descriptionHtml: `
      <p><strong>Toan so hoc co ban - Quan trong trong thuat toan</strong></p>
      <p>Tinh <strong>UCLN (GCD)</strong> va <strong>BCNN (LCM)</strong> cua 2 so nguyen duong A va B.</p>
      <pre><code>Input : 12 8
Output: 4 24</code></pre>
      <p><strong>Thuat toan Euclid O(log min(a,b)):</strong></p>
      <pre><code>gcd(a, b):
    if b == 0: return a
    return gcd(b, a % b)

lcm(a, b) = a / gcd(a, b) * b</code></pre>
      <p><em>Luu y: Tinh a/gcd truoc roi nhan b de tranh tran so!</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long g = gcd(a, b);
    long long l = a / g * b; // Tinh a/g truoc tranh overflow
    cout << g << " " << l << endl;
    return 0;
}`,
      javascript: `const [a, b] = require('fs').readFileSync('/dev/stdin','utf-8').trim().split(' ').map(Number);
function gcd(a, b) { return b===0 ? a : gcd(b, a%b); }
const g = gcd(a, b);
console.log(g, a/g*b);`,
      python: `from math import gcd
a, b = map(int, input().split())
g = gcd(a, b)
print(g, a//g*b)`
    },
    testCases: [
      { input: '12 8', expectedOutput: '4 24' },
      { input: '7 3', expectedOutput: '1 21' },
      { input: '36 48', expectedOutput: '12 144' },
      { input: '100 75', expectedOutput: '25 300' }
    ]
  },

  {
    id: 'math-sieve-primes',
    title: 'MATH · Sang Eratosthenes - Liet ke So Nguyen To',
    difficulty: 'Medium',
    topic: 'Sieve of Eratosthenes',
    category: 'Mathematics',
    hint: 'Khoi tao mang is_prime[] = true. Voi moi so p tu 2: neu is_prime[p]=true, danh dau tat ca boi so cua p (tu p*p) la false.',
    descriptionHtml: `
      <p><strong>Thuat toan Sang Eratosthenes O(N log log N)</strong></p>
      <p>Tim tat ca so nguyen to tu 2 den N. In ra cac so nguyen to, cach nhau dau cach.</p>
      <pre><code>Input : 30
Output: 2 3 5 7 11 13 17 19 23 29</code></pre>
      <p><strong>Giai thuat Sang O(N log log N):</strong></p>
      <ol>
        <li>Tao mang is_prime[0..N] khoi tao true.</li>
        <li>is_prime[0] = is_prime[1] = false.</li>
        <li>Voi p tu 2 den sqrt(N): neu is_prime[p]=true, danh dau tat ca boi so cua p (bat dau tu p*p) la false.</li>
        <li>In tat ca i thoa is_prime[i]=true.</li>
      </ol>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<bool> is_prime(n + 1, true);
    is_prime[0] = is_prime[1] = false;

    for (int p = 2; (long long)p * p <= n; p++) {
        if (is_prime[p]) {
            for (int i = p * p; i <= n; i += p) {
                is_prime[i] = false;
            }
        }
    }

    bool first = true;
    for (int i = 2; i <= n; i++) {
        if (is_prime[i]) {
            if (!first) cout << " ";
            cout << i;
            first = false;
        }
    }
    cout << endl;
    return 0;
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf-8').trim());
const sieve = new Array(n+1).fill(true);
sieve[0] = sieve[1] = false;
for (let p=2; p*p<=n; p++) if (sieve[p]) for (let i=p*p; i<=n; i+=p) sieve[i]=false;
console.log(sieve.map((v,i)=>v?i:null).filter(v=>v!==null).join(' '));`,
      python: `n = int(input())
sieve = [True]*(n+1)
sieve[0] = sieve[1] = False
for p in range(2, int(n**0.5)+1):
    if sieve[p]:
        for i in range(p*p, n+1, p): sieve[i] = False
print(' '.join(str(i) for i in range(2, n+1) if sieve[i]))`
    },
    testCases: [
      { input: '30', expectedOutput: '2 3 5 7 11 13 17 19 23 29' },
      { input: '10', expectedOutput: '2 3 5 7' },
      { input: '2', expectedOutput: '2' },
      { input: '50', expectedOutput: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47' }
    ]
  },

  {
    id: 'math-matrix-multiply',
    title: 'MATH · Nhan Ma Tran (Matrix Multiplication)',
    difficulty: 'Medium',
    topic: 'Linear Algebra',
    category: 'Mathematics',
    hint: 'C[i][j] = sum(A[i][k] * B[k][j]) voi k tu 0 den M-1. Ba vong lap long: i, j, k.',
    descriptionHtml: `
      <p><strong>Dai so tuyen tinh - Nhan ma tran AxB = C</strong></p>
      <p>Cho ma tran A kich thuoc NxM va ma tran B kich thuoc MxP.
      Tinh va in ra tich <strong>C = A * B</strong> kich thuoc NxP.</p>
      <pre><code>Input :
2 3 3 2
1 2 3
4 5 6
7 8 9
1 2
3 4
5 6

Output:
22 28
49 64</code></pre>
      <p><em>Dong dau: N M P (M la chieu chung). Tiep theo la ma tran A (NxM) roi B (MxP).</em></p>
    `,
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int N, M, P;
    cin >> N >> M >> P;  // A la NxM, B la MxP, C la NxP

    vector<vector<int>> A(N, vector<int>(M));
    vector<vector<int>> B(M, vector<int>(P));

    for (int i = 0; i < N; i++)
        for (int j = 0; j < M; j++)
            cin >> A[i][j];

    for (int i = 0; i < M; i++)
        for (int j = 0; j < P; j++)
            cin >> B[i][j];

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < P; j++) {
            long long sum = 0;
            for (int k = 0; k < M; k++) {
                sum += (long long)A[i][k] * B[k][j];
            }
            cout << sum;
            if (j < P - 1) cout << " ";
        }
        cout << "\n";
    }
    return 0;
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf-8').trim().split('\n');
const [N,M,P] = lines[0].split(' ').map(Number);
const A = [], B = [];
for (let i=0; i<N; i++) A.push(lines[1+i].split(' ').map(Number));
for (let i=0; i<M; i++) B.push(lines[1+N+i].split(' ').map(Number));
for (let i=0; i<N; i++) {
    const row = [];
    for (let j=0; j<P; j++) {
        let s=0; for (let k=0; k<M; k++) s+=A[i][k]*B[k][j]; row.push(s);
    }
    console.log(row.join(' '));
}`,
      python: `line = input().split(); N,M,P = int(line[0]),int(line[1]),int(line[2])
A = [[int(x) for x in input().split()] for _ in range(N)]
B = [[int(x) for x in input().split()] for _ in range(M)]
for i in range(N):
    print(' '.join(str(sum(A[i][k]*B[k][j] for k in range(M))) for j in range(P)))`
    },
    testCases: [
      { input: '2 3 2\n1 2 3\n4 5 6\n7 8 9\n1 2\n3 4\n5 6', expectedOutput: '22 28\n49 64' },
      { input: '1 1 1\n5\n3', expectedOutput: '15' }
    ]
  }
];
