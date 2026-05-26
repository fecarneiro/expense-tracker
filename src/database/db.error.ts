import { DrizzleQueryError } from 'drizzle-orm'
import { DatabaseError } from 'pg'

const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  const cause = err instanceof DrizzleQueryError ? err.cause : err

  return (
    cause instanceof DatabaseError &&
    cause.code === UNIQUE_VIOLATION &&
    (!constraint || cause.constraint === constraint)
  )
}

export function isForeignKeyViolation(
  err: unknown,
  constraint?: string,
): boolean {
  const cause = err instanceof DrizzleQueryError ? err.cause : err

  return (
    cause instanceof DatabaseError &&
    cause.code === FOREIGN_KEY_VIOLATION &&
    (!constraint || cause.constraint === constraint)
  )
}
