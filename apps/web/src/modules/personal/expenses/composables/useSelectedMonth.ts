import { DEFAULT_USER_TIME_ZONE } from '@expense-tracker/contracts'
import { computed, ref } from 'vue'
import { addMonths, currentMonth, monthRange } from '@/modules/personal/expenses/rules/month.rules'
import { getAuthUser } from '@/shared/auth/auth.session'

export function useSelectedMonth() {
  const timeZone = getAuthUser()?.timezone ?? DEFAULT_USER_TIME_ZONE
  const latestMonth = currentMonth(new Date(), timeZone)

  const month = ref(latestMonth)
  const range = computed(() => monthRange(month.value, timeZone))
  const canGoNext = computed(() => month.value < latestMonth)

  function previous() {
    month.value = addMonths(month.value, -1)
  }

  function next() {
    month.value = addMonths(month.value, 1)
  }

  return { month, range, canGoNext, previous, next }
}
