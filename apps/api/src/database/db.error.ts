import { DrizzleQueryError } from 'drizzle-orm'

const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

type PgError = { code?: string; constraint?: string }

function asPgError(err: unknown): PgError | null {
  const cause = err instanceof DrizzleQueryError ? err.cause : err

  return cause !== null && typeof cause === 'object' && 'code' in cause ? (cause as PgError) : null
}

export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  const cause = asPgError(err)

  return cause?.code === UNIQUE_VIOLATION && (!constraint || cause.constraint === constraint)
}

export function isForeignKeyViolation(err: unknown, constraint?: string): boolean {
  const cause = asPgError(err)

  return cause?.code === FOREIGN_KEY_VIOLATION && (!constraint || cause.constraint === constraint)
}
