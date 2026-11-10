import { useQuery } from '@tanstack/vue-query'
import { fetchPartnership } from '@/modules/partners/shared-expenses/api/partnerships.api'
import { partnershipKey } from './keys'

export function usePartnershipQuery() {
  return useQuery({
    queryKey: partnershipKey,
    queryFn: fetchPartnership,
  })
}
