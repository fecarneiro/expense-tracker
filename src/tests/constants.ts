export const UNKNOWN_UUID = '00000000-0000-0000-0000-000000000000'

export const TEST_PASSWORD = '12345678'
export const TEST_EMAIL = 'user@test.com'
export const OTHER_TEST_EMAIL = 'other@test.com'

/** ISO datetime for HTTP request bodies (Zod accepts offset form) */
export const TEST_OCCURRED_AT = '2026-01-01T00:00:00+00:00'
export const TEST_OCCURRED_AT_LATER = '2026-02-10T00:00:00+00:00'
export const TEST_OCCURRED_AT_FAR_LATER = '2026-03-20T00:00:00+00:00'

export const TEST_OCCURRED_AT_DATE = new Date(TEST_OCCURRED_AT)
export const TEST_OCCURRED_AT_LATER_DATE = new Date(TEST_OCCURRED_AT_LATER)
export const TEST_OCCURRED_AT_FAR_LATER_DATE = new Date(TEST_OCCURRED_AT_FAR_LATER)

/** What toTransactionResponse emits via Date.toISOString() */
export const TEST_OCCURRED_AT_RESPONSE = TEST_OCCURRED_AT_DATE.toISOString()
export const TEST_OCCURRED_AT_LATER_RESPONSE = TEST_OCCURRED_AT_LATER_DATE.toISOString()
export const TEST_OCCURRED_AT_FAR_LATER_RESPONSE = TEST_OCCURRED_AT_FAR_LATER_DATE.toISOString()
