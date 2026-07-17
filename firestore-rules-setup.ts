import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let emulatorProcess: ChildProcess | null = null;

export async function setup() {
  console.log('Starting Firebase emulators for Firestore rules tests...');

  const javaHome = '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home';

  emulatorProcess = spawn(
    'firebase',
    ['emulators:start', '--only', 'firestore', '--project', 'test-osefdetalife'],
    {
      env: {
        ...process.env,
        JAVA_HOME: javaHome,
      },
      stdio: 'pipe',
    }
  );

  // Wait for emulators to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Firebase emulators failed to start within 60 seconds'));
    }, 60000);

    emulatorProcess!.stdout?.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      if (output.includes('All emulators ready')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    emulatorProcess!.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    emulatorProcess!.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    emulatorProcess!.on('exit', (code) => {
      if (code !== null && code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Firebase emulator exited with code ${code}`));
      }
    });
  });

  console.log('Firebase emulators started successfully');
}

export async function teardown() {
  if (emulatorProcess) {
    console.log('Stopping Firebase emulators...');
    const proc = emulatorProcess;
    emulatorProcess = null;
    proc.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      proc.on('exit', () => resolve());
      setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch { /* already dead */ }
        resolve();
      }, 5000);
    });
  }
}
