import type { LinkingCodeRow } from '../../database/schemas/linking-codes.schema.js'
export type LinkingCode = LinkingCodeRow

export type CreateLinkingCodeBodyInput = Pick<LinkingCode, 'userId' | 'purpose'>
export type VerifyLinkingCodeInput = Pick<LinkingCode, 'code' | 'purpose'>
export type FindLinkingCode = Pick<LinkingCode, 'code' | 'purpose'>
export type SaveLinkingCode = Pick<LinkingCode, 'userId' | 'code'>
export type GeneratedLinkingCode = Pick<LinkingCode, 'code' | 'createdAt'>
export type SaveLinkingCodeResult =
  | { saved: true; generatedLinkingCode: GeneratedLinkingCode }
  | { saved: false }
export type DeleteLinkingCode = Pick<LinkingCode, 'userId' | 'purpose'>
