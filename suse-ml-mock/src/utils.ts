export class RNG {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    // Mulberry32
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  weighted<T>(items: Array<[T, number]>): T {
    const total = items.reduce((sum, [, weight]) => sum + weight, 0);
    let cursor = this.next() * total;
    for (const [item, weight] of items) {
      cursor -= weight;
      if (cursor <= 0) return item;
    }
    return items[items.length - 1][0];
  }
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, "0");
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isoDateTime(date: Date): string {
  return date.toISOString();
}

export function dateFromIso(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

export function randomDate(rng: RNG, start: Date, end: Date): Date {
  const t = start.getTime() + rng.next() * (end.getTime() - start.getTime());
  return new Date(t);
}

export function slugId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(5, "0")}`;
}
