/**
 * API Route for executing Python code
 * 
 * SECURITY WARNING: This endpoint executes arbitrary user-provided code.
 * For production use, implement proper sandboxing (Docker containers, VMs, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join, basename, normalize } from 'path';
import { tmpdir } from 'os';

// Security configuration
const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024; // 100KB per file
const MAX_CODE_SIZE = 500 * 1024; // 500KB for main code
const ALLOWED_FILE_EXTENSIONS = ['.py', '.txt', '.json', '.csv'];
const EXECUTION_TIMEOUT = 30000; // 30 seconds
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

/**
 * Validates and sanitizes a filename to prevent path traversal attacks
 * @param filename - The filename to validate
 * @returns The sanitized filename or null if invalid
 */
function sanitizeFilename(filename: string): string | null {
  if (!filename || typeof filename !== 'string') {
    return null;
  }

  // Remove any directory separators and normalize
  const base = basename(filename);
  
  // Check for empty filename after sanitization
  if (!base || base === '.' || base === '..') {
    return null;
  }

  // Check for valid characters (alphanumeric, dots, underscores, hyphens)
  if (!/^[a-zA-Z0-9._-]+$/.test(base)) {
    return null;
  }

  // Check file extension
  const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some(ext => base.endsWith(ext));
  if (!hasValidExtension) {
    return null;
  }

  // Prevent hidden files
  if (base.startsWith('.')) {
    return null;
  }

  return base;
}

/**
 * Validates file content size
 * @param content - The file content to validate
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if valid, false otherwise
 */
function validateContentSize(content: string, maxSize: number): boolean {
  if (typeof content !== 'string') {
    return false;
  }
  return Buffer.byteLength(content, 'utf8') <= maxSize;
}

/**
 * Safely removes a directory and its contents
 */
async function safeRemoveDir(dirPath: string): Promise<void> {
  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to cleanup temp directory:', error);
  }
}

/**
 * Executes Python code in a subprocess without shell interpretation
 */
async function executePython(filePath: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('python3', [filePath], {
      cwd,
      timeout: EXECUTION_TIMEOUT,
      env: {
        PYTHONDONTWRITEBYTECODE: '1', // Prevent .pyc files
        PYTHONUNBUFFERED: '1', // Disable output buffering
      },
    });

    let stdout = '';
    let stderr = '';
    let isKilled = false;

    // Set timeout
    const timer = setTimeout(() => {
      isKilled = true;
      childProcess.kill('SIGKILL');
    }, EXECUTION_TIMEOUT);

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      // Prevent memory exhaustion from large outputs
      if (stdout.length > MAX_OUTPUT_SIZE) {
        isKilled = true;
        childProcess.kill('SIGKILL');
      }
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > MAX_OUTPUT_SIZE) {
        isKilled = true;
        childProcess.kill('SIGKILL');
      }
    });

    childProcess.on('close', (code) => {
      clearTimeout(timer);
      if (isKilled) {
        reject(new Error('TIMEOUT'));
      } else {
        resolve({ stdout, stderr });
      }
    });

    childProcess.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, files } = await request.json();

    // Validate code input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    if (!validateContentSize(code, MAX_CODE_SIZE)) {
      return NextResponse.json(
        { error: `Code size exceeds maximum allowed size of ${MAX_CODE_SIZE / 1024}KB` },
        { status: 400 }
      );
    }

    // Validate files array
    if (files) {
      if (!Array.isArray(files)) {
        return NextResponse.json(
          { error: 'Files must be an array' },
          { status: 400 }
        );
      }

      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Too many files. Maximum ${MAX_FILES} allowed` },
          { status: 400 }
        );
      }

      // Validate each file
      for (const file of files) {
        if (!file || typeof file !== 'object') {
          return NextResponse.json(
            { error: 'Invalid file object' },
            { status: 400 }
          );
        }

        if (!file.name || !file.content) {
          return NextResponse.json(
            { error: 'File must have name and content' },
            { status: 400 }
          );
        }

        // Sanitize filename to prevent path traversal
        const sanitizedName = sanitizeFilename(file.name);
        if (!sanitizedName) {
          return NextResponse.json(
            { error: `Invalid filename: ${file.name}. Only alphanumeric characters, dots, underscores, and hyphens are allowed with extensions: ${ALLOWED_FILE_EXTENSIONS.join(', ')}` },
            { status: 400 }
          );
        }

        if (!validateContentSize(file.content, MAX_FILE_SIZE)) {
          return NextResponse.json(
            { error: `File ${file.name} exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024}KB` },
            { status: 400 }
          );
        }
      }
    }

    // Create temporary directory for execution
    const tempDir = join(tmpdir(), `python-exec-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(tempDir, { recursive: true });

    try {
      // Write main file
      const mainFilePath = join(tempDir, 'main.py');
      await writeFile(mainFilePath, code);

      // Write additional files if provided
      if (files && Array.isArray(files)) {
        for (const file of files) {
          // Sanitize filename again for extra safety
          const sanitizedName = sanitizeFilename(file.name);
          if (!sanitizedName) {
            continue; // Skip invalid files (should have been caught earlier)
          }
          
          const filePath = join(tempDir, sanitizedName);
          
          // Extra safety check: ensure file path is within temp directory
          const normalizedPath = normalize(filePath);
          if (!normalizedPath.startsWith(normalize(tempDir))) {
            console.error('Path traversal attempt detected:', file.name);
            continue;
          }
          
          await writeFile(filePath, file.content);
        }
      }

      // Execute Python code without shell interpretation
      const { stdout, stderr } = await executePython(mainFilePath, tempDir);

      // Clean up temp directory
      await safeRemoveDir(tempDir);

      return NextResponse.json({
        output: stdout,
        error: stderr,
        success: !stderr,
      });
    } catch (execError: unknown) {
      // Clean up temp directory on error
      await safeRemoveDir(tempDir);

      if (execError instanceof Error && execError.message === 'TIMEOUT') {
        return NextResponse.json({
          output: '',
          error: 'Execution timeout: Code took too long to execute (>30s)',
          success: false,
        });
      }

      return NextResponse.json({
        output: '',
        error: execError instanceof Error ? execError.message : 'Execution error',
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
