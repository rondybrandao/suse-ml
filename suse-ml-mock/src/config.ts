import "node:process";

export const CONFIG = {
  belezaId: process.env.BELEZA_ID || "mock-ml-suse",
  seed: Number(process.env.MOCK_SEED || 20260902),
  endDate: process.env.MOCK_END_DATE || "2026-09-01",
  batchSize: 400,
};

export function parseArg(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}
