import { z } from 'zod'
export const accessTokenPayloadSchema = z.object({ userId: z.uuid() })
