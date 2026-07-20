import { z } from 'zod'
import { linkingCodeField } from '../../linking-codes/linking-code.schemas.js'

export const createPartnershipBodySchema = z.object({
  code: linkingCodeField,
})
