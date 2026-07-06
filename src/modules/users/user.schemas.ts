import * as z from 'zod'
import { isValidIanaTimeZone } from '../../utils/date.utils.js'

const ianaTimeZoneSchema = z
  .string()
  .trim()
  .max(100)
  .refine(isValidIanaTimeZone, { message: 'Invalid IANA time zone' })

const localeSchema = z.string().trim().max(10)
const currencySchema = z.string().length(3)

export const userIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email()).meta({
  example: '{{$randomEmail}}',
})

export const passwordField = z.string().min(8).max(72).meta({
  description: 'Must be between 8 and 72 characters.',
  example: 'password123',
})

export const localeField = localeSchema.optional().meta({ example: 'en-US' })

export const currencyField = currencySchema.toUpperCase().optional().meta({ example: 'USD' })

export const lastSeenAtField = z.iso.datetime({ offset: true }).nullable().meta({
  example: null,
})

export const timeZoneField = ianaTimeZoneSchema.optional().meta({
  example: 'America/New_York',
})

// -- Body schemas --
export const userCredentialsBodySchema = z.strictObject({
  email: emailField,
  password: passwordField,
  timeZone: timeZoneField,
  currency: currencyField,
  locale: localeField,
})

export const createUserBodySchema = userCredentialsBodySchema.meta({
  id: 'CreateUserBody',
})

export const changePasswordBodySchema = z
  .strictObject({
    currentPassword: z.string().min(1).meta({
      example: 'OldPassword123!',
    }),
    newPassword: passwordField,
  })
  .meta({
    id: 'ChangePasswordBody',
  })

export const deleteUserBodySchema = z
  .strictObject({
    password: z.string().min(1).meta({
      example: 'OldPassword123!',
    }),
  })
  .meta({
    id: 'DeleteUserBody',
  })

// -- Response schemas --
export const userResponseSchema = z
  .object({
    id: userIdField,
    email: emailField,
    timeZone: timeZoneField,
    currency: currencyField,
    locale: localeField,
    lastSeenAt: lastSeenAtField,
  })
  .meta({
    id: 'User',
  })

export const userPreferencesSchema = z.object({
  timeZone: ianaTimeZoneSchema,
  locale: localeSchema,
  currency: currencySchema,
})
