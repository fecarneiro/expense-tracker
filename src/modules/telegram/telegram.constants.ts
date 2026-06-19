export const TELEGRAM_BOT_PUBLIC_PATH = '/redirect-to-bot'

export const DEFAULT_TELEGRAM_BOT_USERNAME = 'expenses_fecarneiro_bot'

export function getTelegramBotMobileUrl(username: string) {
  return `https://t.me/${username}`
}

export function getTelegramBotWebUrl(username: string) {
  return `https://web.telegram.org/k/#@${username}`
}

// Linking code TTL
export const LINKING_CODE_TTL_MINUTES = 15
export const LINKING_CODE_TTL_MS = LINKING_CODE_TTL_MINUTES * 60 * 1000

// Linking code rate limiter
export const LINKING_CODE_VERIFICATION_MAX_ATTEMPTS = 3
export const LINKING_CODE_WINDOW_SIZE = 10 * 60 * 1000

// Linking Code 6 numbers
export const LINKING_CODE_MIN_NUMBER = 100_000
export const LINKING_CODE_MAX_NUMBER = 1_000_000
export const LINKING_CODE_GENERATION_RETRIES = 3
