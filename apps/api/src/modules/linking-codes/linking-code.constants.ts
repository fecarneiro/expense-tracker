export const LINKING_CODE_PURPOSE = {
  BOT_LINK: 'bot_link',
  PARTNERSHIP_LINK: 'partnership_link',
} as const

export type LinkingCodePurpose = (typeof LINKING_CODE_PURPOSE)[keyof typeof LINKING_CODE_PURPOSE]

export const LINKING_CODE = {
  GENERATION_MAX_ATTEMPTS: 5,
  MIN_NUMBER: 100_000,
  MAX_NUMBER: 1_000_000,
  TTL_MS: 15 * 60 * 1000,
} as const
