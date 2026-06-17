import { TelegramLinkingRateLimitError } from './telegram.error.js'

export const LINKING_CODE_MAX_ATTEMPTS = 3
export const LINKING_CODE_WINDOW_SIZE = 10 * 60 * 1000

export class LinkingCodeRateLimiter {
  private readonly attemptStore = new Map<number, number[]>()

  private getRecentAttempts(telegramId: number): number[] {
    const attempts = this.attemptStore.get(telegramId) ?? []
    const windowStartTime = Date.now() - LINKING_CODE_WINDOW_SIZE
    const recentAttempts = attempts.filter((attemptTime) => attemptTime > windowStartTime)
    this.attemptStore.set(telegramId, recentAttempts)
    return recentAttempts
  }

  assertAllowed(telegramId: number): void {
    if (this.getRecentAttempts(telegramId).length >= LINKING_CODE_MAX_ATTEMPTS) {
      throw new TelegramLinkingRateLimitError()
    }
  }

  recordFailure(telegramId: number): void {
    const attempts = this.getRecentAttempts(telegramId)
    attempts.push(Date.now())
  }

  clear(telegramId: number) {
    this.attemptStore.delete(telegramId)
  }
}
