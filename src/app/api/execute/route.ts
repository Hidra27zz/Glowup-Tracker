import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { language, code, testCases } = body;

    if (!code || !language || !testCases) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = Math.random().toString(36).substring(7);
    const tmpDir = os.tmpdir();
    
    let filePath = '';
    let execCmd = '';
    let compileCmd = '';

    if (language === 'cpp') {
      filePath = path.join(tmpDir, `solution_${id}.cpp`);
      const execPath = path.join(tmpDir, `solution_${id}`);
      fs.writeFileSync(filePath, code);
      compileCmd = `g++ ${filePath} -o ${execPath}`;
      execCmd = execPath;
    } else if (language === 'javascript') {
      filePath = path.join(tmpDir, `solution_${id}.js`);
      fs.writeFileSync(filePath, code);
      execCmd = `node ${filePath}`;
    } else if (language === 'python') {
      filePath = path.join(tmpDir, `solution_${id}.py`);
      fs.writeFileSync(filePath, code);
      execCmd = `python3 ${filePath}`;
    } else {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Compile step for C++
    if (compileCmd) {
      try {
        await execAsync(compileCmd);
      } catch (compileError: any) {
        return NextResponse.json({
          status: 'Compile Error',
          error: compileError.stderr || compileError.message,
          results: []
        });
      }
    }

    const results = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const inputPath = path.join(tmpDir, `input_${id}_${i}.txt`);
      fs.writeFileSync(inputPath, tc.input);

      try {
        const { stdout, stderr } = await execAsync(`${execCmd} < ${inputPath}`, { timeout: 3000 });
        
        const actualOutput = stdout.trim();
        const expectedOutput = tc.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;
        
        if (!passed) allPassed = false;

        results.push({
          testCaseId: i + 1,
          input: tc.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed,
          error: stderr || null
        });

      } catch (runError: any) {
        allPassed = false;
        results.push({
          testCaseId: i + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: '',
          passed: false,
          error: runError.killed ? 'Time Limit Exceeded (TLE)' : (runError.stderr || runError.message)
        });
      }
      
      // Cleanup input
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }

    // Cleanup source files
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (language === 'cpp' && fs.existsSync(execCmd)) fs.unlinkSync(execCmd);

    return NextResponse.json({
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      results,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
