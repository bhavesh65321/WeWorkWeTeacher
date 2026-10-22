import { HttpException, HttpStatus } from "@nestjs/common";

const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

export class LoginThrottle {
  private readonly failures = new Map<string, { count: number; resetAt: number }>();

  assertAllowed(key: string) {
    const entry = this.failures.get(key);
    if (!entry) return;
    if (entry.resetAt <= Date.now()) {
      this.failures.delete(key);
      return;
    }
    if (entry.count >= MAX_FAILURES) {
      throw new HttpException("Too many failed attempts. Try again in a few minutes.", HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  recordFailure(key: string) {
    const now = Date.now();
    const entry = this.failures.get(key);
    if (!entry || entry.resetAt <= now) {
      this.failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return;
    }
    entry.count += 1;
  }

  clear(key: string) {
    this.failures.delete(key);
  }
}
