declare const process: {
  argv: string[];
  exitCode?: number;
  cwd: () => string;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

declare module "node:test" {
  const test: (name: string, fn: () => void | Promise<void>) => void;
  export default test;
}

declare module "node:assert/strict" {
  const assert: {
    equal: (actual: unknown, expected: unknown) => void;
    deepEqual: (actual: unknown, expected: unknown) => void;
  };
  export default assert;
}

declare module "node:http" {
  export function createServer(handler: (req: any, res: any) => void | Promise<void>): {
    listen: (port: number, cb?: () => void) => void;
  };
}

declare module "node:fs/promises" {
  export function readFile(path: string): Promise<Uint8Array>;
}

declare module "node:path" {
  export function extname(path: string): string;
  export function join(...parts: string[]): string;
}
