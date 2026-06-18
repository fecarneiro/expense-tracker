import { linkingCodeField } from '../http/telegram.http.dto.js'

export function linkingCodeParser(message: string) {
  const numeric = Number(message)
  const result = linkingCodeField.safeParse(numeric)

  return result.success ? result.data : null
}
