import { execSync } from 'node:child_process';

const EMULATOR_PORTS = [8081, 9099];

function pidsOnPort(port: number): number[] {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (!out) return [];
    return out
      .split('\n')
      .map((line) => Number.parseInt(line, 10))
      .filter((pid) => !Number.isNaN(pid));
  } catch {
    return [];
  }
}

function isEmulatorProcess(pid: number): boolean {
  try {
    const command = execSync(`ps -p ${pid} -o command=`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    return command.includes('firebase/emulators') || command.includes('firebase-crackling-fire-4704');
  } catch {
    return false;
  }
}

export default async function globalTeardown(): Promise<void> {
  for (const port of EMULATOR_PORTS) {
    for (const pid of pidsOnPort(port)) {
      if (isEmulatorProcess(pid)) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch {
          // process already gone
        }
      }
    }
  }
}
