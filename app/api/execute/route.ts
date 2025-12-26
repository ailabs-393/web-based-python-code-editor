import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code, files } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    // Create temporary directory for execution
    const tempDir = join(tmpdir(), `python-exec-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    try {
      // Write main file
      const mainFilePath = join(tempDir, 'main.py');
      await writeFile(mainFilePath, code);

      // Write additional files if provided
      if (files && Array.isArray(files)) {
        for (const file of files) {
          const filePath = join(tempDir, file.name);
          await writeFile(filePath, file.content);
        }
      }

      // Execute Python code with timeout
      const { stdout, stderr } = await execAsync(`python3 "${mainFilePath}"`, {
        cwd: tempDir,
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      // Clean up temp directory
      await execAsync(`rm -rf "${tempDir}"`);

      return NextResponse.json({
        output: stdout,
        error: stderr,
        success: !stderr,
      });
    } catch (execError: unknown) {
      // Clean up temp directory on error
      try {
        await execAsync(`rm -rf "${tempDir}"`);
      } catch {
        // Ignore cleanup errors
      }

      if (execError && typeof execError === 'object' && 'killed' in execError && execError.killed) {
        return NextResponse.json({
          output: '',
          error: 'Execution timeout: Code took too long to execute (>30s)',
          success: false,
        });
      }

      const error = execError as { stdout?: string; stderr?: string; message?: string };
      return NextResponse.json({
        output: error.stdout || '',
        error: error.stderr || error.message || 'Execution error',
        success: false,
      });
    }
  } catch (error) {
    console.error('API execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
