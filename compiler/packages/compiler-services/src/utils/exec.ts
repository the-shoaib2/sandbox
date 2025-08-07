import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function executeCommand(
  command: string,
  cwd: string,
  timeout = 10000
): Promise<ExecResult> {
  try {
    return await exec(command, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024 * 10, // 10MB
    });
  } catch (error: any) {
    // If the error is because the process was killed due to timeout
    if (error.killed && error.signal === 'SIGTERM') {
      throw new Error(`Command timed out after ${timeout}ms`);
    }
    // For other errors, include the stderr in the error message
    throw new Error(error.stderr || error.message);
  }
}
