import { linkingCodeField } from '../telegram.schemas.js'

export function linkingCodeParser(message: string) {
  const numeric = Number(message)
  const result = linkingCodeField.safeParse(numeric)

  return result.success ? result.data : null
}
