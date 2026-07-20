export function formatSentenceCase(value: string | null): string {
  if (value == null) return ''

  const trimmed = value.trim()
  if (trimmed.length === 0) return ''

  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1)
}
