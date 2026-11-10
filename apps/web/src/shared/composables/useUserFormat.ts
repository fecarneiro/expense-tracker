import { getAuthUser } from '@/shared/auth/auth.session'
import { formatDate, formatMonthYear } from '@/shared/format/format-date'
import { decimalSeparator, formatMoney } from '@/shared/format/format-money'

export function useUserFormat() {
  const user = getAuthUser()

  return {
    money: (cents: number) => formatMoney(cents, user?.currency, user?.locale),
    date: (value: string) => formatDate(value, user?.locale, user?.timezone),
    monthYear: (month: string) => formatMonthYear(month, user?.locale),
    decimalSeparator: decimalSeparator(user?.locale),
  }
}
