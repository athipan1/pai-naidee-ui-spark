export function retryAfterTime(value: string | null, now = Date.now()): number {
  if (value && /^\d+$/.test(value)) {
    const milliseconds = Number(value) * 1000;
    if (Number.isSafeInteger(now + milliseconds)) return now + milliseconds;
  } else if (value) {
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(now, date);
  }
  return now + 60_000;
}

export class RateLimitError extends Error {
  constructor(readonly retryAt: number) {
    super('คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่ (HTTP 429)');
  }
}
