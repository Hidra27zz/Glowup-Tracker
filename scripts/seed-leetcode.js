const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LEETCODE_EXERCISES = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `
      <h3>Problem Description</h3>
      <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
      <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
      <p>You can return the answer in any order.</p>
      <br/>
      <strong>Example:</strong>
      <pre>
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
      </pre>
    `,
    hint: 'Use a hash map to store the elements and their indices as you iterate through the array.',
    starterCode: JSON.stringify({
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};`,
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Your code here\n};`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Your code here\n        pass`
    }),
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
      { input: "[3,3]\n6", expectedOutput: "[0,1]" }
    ]
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: `
      <h3>Problem Description</h3>
      <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
      <p>An input string is valid if:</p>
      <ul>
        <li>Open brackets must be closed by the same type of brackets.</li>
        <li>Open brackets must be closed in the correct order.</li>
        <li>Every close bracket has a corresponding open bracket of the same type.</li>
      </ul>
      <br/>
      <strong>Example:</strong>
      <pre>
Input: s = "()[]{}"
Output: true
      </pre>
    `,
    hint: 'Use a stack data structure to keep track of the open brackets.',
    starterCode: JSON.stringify({
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        \n    }\n};`,
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    // Your code here\n};`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Your code here\n        pass`
    }),
    testCases: [
      { input: '"()"', expectedOutput: "true" },
      { input: '"()[]{}"', expectedOutput: "true" },
      { input: '"(]"', expectedOutput: "false" }
    ]
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    description: `
      <h3>Problem Description</h3>
      <p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.</p>
      <br/>
      <strong>Example:</strong>
      <pre>
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.
      </pre>
    `,
    hint: 'Use two pointers (left and right) or precompute the max height to the left and right of each bar.',
    starterCode: JSON.stringify({
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        \n    }\n};`,
      javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nvar trap = function(height) {\n    // Your code here\n};`,
      python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Your code here\n        pass`
    }),
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9" }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: `
      <h3>Problem Description</h3>
      <p>Given a string <code>s</code>, find the length of the longest substring without repeating characters.</p>
      <br/>
      <strong>Example:</strong>
      <pre>
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
      </pre>
    `,
    hint: 'Use the sliding window technique with two pointers and a hash set.',
    starterCode: JSON.stringify({
      cpp: `#include <string>\n#include <unordered_set>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        \n    }\n};`,
      javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    // Your code here\n};`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Your code here\n        pass`
    }),
    testCases: [
      { input: '"abcabcbb"', expectedOutput: "3" },
      { input: '"bbbbb"', expectedOutput: "1" },
      { input: '"pwwkew"', expectedOutput: "3" }
    ]
  },
  {
    title: 'Merge Intervals',
    difficulty: 'Medium',
    description: `
      <h3>Problem Description</h3>
      <p>Given an array of <code>intervals</code> where <code>intervals[i] = [start_i, end_i]</code>, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.</p>
      <br/>
      <strong>Example:</strong>
      <pre>
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
      </pre>
    `,
    hint: 'Sort the intervals by their start time first, then iterate and merge overlapping ones.',
    starterCode: JSON.stringify({
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Your code here\n        \n    }\n};`,
      javascript: `/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nvar merge = function(intervals) {\n    // Your code here\n};`,
      python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # Your code here\n        pass`
    }),
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" }
    ]
  }
];

async function main() {
  console.log('Đang thêm bài tập chuẩn LeetCode / Hackathon...');
  
  // Tìm môn DSA (IT003)
  const dsaSubject = await prisma.subject.findFirst({
    where: { code: 'IT003' }
  });
  
  // Tìm môn Lập trình cơ bản (IT001)
  const introSubject = await prisma.subject.findFirst({
    where: { code: 'IT001' }
  });

  if (!dsaSubject && !introSubject) {
    console.log('Không tìm thấy môn IT003 hoặc IT001.');
    return;
  }

  const targetSubjectId = dsaSubject ? dsaSubject.id : introSubject.id;

  for (let i = 0; i < LEETCODE_EXERCISES.length; i++) {
    const exercise = LEETCODE_EXERCISES[i];
    
    // Kiểm tra xem bài đã tồn tại chưa
    const existing = await prisma.exercise.findFirst({
      where: { title: exercise.title }
    });

    if (!existing) {
      await prisma.exercise.create({
        data: {
          title: exercise.title,
          difficulty: exercise.difficulty,
          description: exercise.description,
          hint: exercise.hint,
          starterCode: exercise.starterCode,
          testCases: {
            create: exercise.testCases
          },
          subjectId: targetSubjectId
        }
      });
      console.log(`Đã thêm: ${exercise.title}`);
    } else {
      console.log(`️ Đã tồn tại: ${exercise.title}`);
    }
  }

  console.log('Hoàn tất nạp dữ liệu LeetCode!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
