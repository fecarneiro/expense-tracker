import { useQuery } from '@tanstack/vue-query'
import { fetchSharedCategories } from '@/modules/partners/shared-expenses/api/shared-categories.api'
import { sharedCategoriesKey } from './keys'

export function useSharedCategoriesQuery() {
  return useQuery({
    queryKey: sharedCategoriesKey,
    queryFn: fetchSharedCategories,
  })
}
