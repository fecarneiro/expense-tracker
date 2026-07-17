import * as z from 'zod'
import { isValidIanaTimeZone } from '../../utils/date.utils.js'

const ianaTimeZoneSchema = z
  .string()
  .trim()
  .max(100)
  .refine(isValidIanaTimeZone, { message: 'Invalid IANA time zone' })

const localeSchema = z.string().trim().max(10)
const currencySchema = z.string().length(3)

export const userIdField = z.uuid()

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email())

export const passwordField = z.string().min(8).max(72)

export const localeField = localeSchema.optional()

export const currencyField = currencySchema.toUpperCase().optional()

export const lastSeenAtField = z.iso.datetime({ offset: true }).nullable()

export const timezoneField = ianaTimeZoneSchema.optional()

// -- Body schemas --
export const userCredentialsBodySchema = z.strictObject({
  email: emailField,
  password: passwordField,
  timezone: timezoneField,
  currency: currencyField,
  locale: localeField,
})

export const createUserBodySchema = userCredentialsBodySchema

export const changePasswordBodySchema = z.strictObject({
  currentPassword: z.string().min(1),
  newPassword: passwordField,
})

export const deleteUserBodySchema = z.strictObject({
  password: z.string().min(1),
})

// -- Response schemas --
export const userResponseSchema = z.object({
  id: userIdField,
  email: emailField,
  timezone: timezoneField,
  currency: currencyField,
  locale: localeField,
  lastSeenAt: lastSeenAtField,
})

export const userPreferencesSchema = z.object({
  timeZone: ianaTimeZoneSchema,
  locale: localeSchema,
  currency: currencySchema,
})

export type CreateUserBodyInput = z.input<typeof createUserBodySchema>
export type ChangePasswordBodyInput = z.input<typeof changePasswordBodySchema>
export type DeleteUserBodyInput = z.input<typeof deleteUserBodySchema>
