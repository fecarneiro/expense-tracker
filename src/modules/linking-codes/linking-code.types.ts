import type { LINKING_CODE } from './linking-code.constants.js'

export type LinkingCodePurpose = (typeof LINKING_CODE.PURPOSE)[number]

// export type CreateLinkingCodeBodyInput = {
//   userId: string
//   purpose: LinkingCodePurpose
// }

//---
export type CreateLinkingCodeBodyInput = {
  userId: string
}

export type VerifyLinkingCodeInput = {
  telegramId: number
  code: number
}

export type FindLinkingCodeByCode = {
  code: number
}

export type SaveBotLinkingCode = {
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

export type DeleteLinkingCodeByUserIdInput = {
  userId: string
}
