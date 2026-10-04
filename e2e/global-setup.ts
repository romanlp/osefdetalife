import { clearAuth, clearFirestore } from './utils/test-helpers';

const EMULATOR_PORTS = [
  { name: 'firestore', port: 8081 },
  { name: 'auth', port: 9099 },
];

const READY_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

async function isPortOpen(port: number): Promise<boolean> {
  try {
    const { connect } = await import('node:net');
    return await new Promise<boolean>((resolve) => {
      const socket = connect({ port, host: '127.0.0.1' });
      const settle = (result: boolean) => {
        socket.destroy();
        resolve(result);
      };
      socket.once('connect', () => settle(true));
      socket.once('error', () => settle(false));
      socket.setTimeout(1_000, () => settle(false));
    });
  } catch {
    return false;
  }
}

async function waitForEmulators(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  const pending = new Set(EMULATOR_PORTS.map((e) => e.name));

  while (pending.size > 0) {
    for (const { name, port } of EMULATOR_PORTS) {
      if (!pending.has(name)) continue;
      if (await isPortOpen(port)) pending.delete(name);
    }
    if (pending.size === 0) break;
    if (Date.now() > deadline) {
      throw new Error(
        `Emulator ports not reachable within ${READY_TIMEOUT_MS}ms: ${[...pending].join(', ')}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

export default async function globalSetup(): Promise<void> {
  await waitForEmulators();
  await clearFirestore();
  await clearAuth();
}
