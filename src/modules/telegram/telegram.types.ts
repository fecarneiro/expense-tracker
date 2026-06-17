export type SaveTelegramLinkingCode = {
  userId: string
  code: number
}

export type GeneratedLinkingCode = {
  code: number
  createdAt: Date
}

export type SaveLinkingCodeResult =
  | { saved: true; generatedLinkingCode: GeneratedLinkingCode }
  | { saved: false }
