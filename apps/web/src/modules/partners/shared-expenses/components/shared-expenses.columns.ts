import type { SharedExpenseReportItem } from '@expense-tracker/contracts'
import { createColumnHelper } from '@tanstack/vue-table'
import { h } from 'vue'
import { formatText } from '@/shared/format/format-text'
import { Badge } from '@/shared/ui/badge'
import { WIDE_ONLY } from '@/shared/ui/data-table'

const STATUS_CLASS = {
  pending: 'bg-warning-surface text-warning-text',
  settled: 'bg-success-surface text-success-text',
}

const columnHelper = createColumnHelper<SharedExpenseReportItem>()

type ColumnOptions = {
  userId: string | undefined
  money: (cents: number) => string
  date: (value: string) => string
  showStatus: boolean
}

export function createSharedExpensesColumns({ userId, money, date, showStatus }: ColumnOptions) {
  const participant = (id: string) => (id === userId ? 'You' : 'Partner')

  const yourBalance = ({ owedUserId, owedAmountCents, status }: SharedExpenseReportItem) => {
    const amount = money(owedAmountCents)

    if (status === 'settled') return h('span', { class: 'text-muted-foreground' }, amount)

    return owedUserId === userId
      ? h('span', { class: 'text-you', 'aria-label': `You owe ${amount}` }, `−${amount}`)
      : h('span', { class: 'text-partner', 'aria-label': `Partner owes ${amount}` }, `+${amount}`)
  }

  return [
    columnHelper.accessor('occurredAt', {
      header: 'Date',
      cell: (info) => date(info.getValue()),
      meta: { class: `text-muted-foreground w-24 tabular-nums ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => {
        const expense = row.original
        const description = formatText(expense.description)
        const details = [
          date(expense.occurredAt),
          formatText(expense.categoryName),
          `paid by ${participant(expense.payerUserId)}`,
          ...(expense.status === 'settled' ? ['settled'] : []),
        ].join(', ')

        return h('div', [
          description
            ? h('div', { class: '@3xl:truncate' }, description)
            : h('span', { class: 'text-muted-foreground' }, '—'),
          h('div', { class: 'text-muted-foreground mt-0.5 text-xs @3xl:hidden' }, details),
        ])
      },
      meta: { class: 'whitespace-normal' },
    }),
    columnHelper.accessor('categoryName', {
      header: 'Category',
      cell: (info) => formatText(info.getValue()),
      meta: { class: `w-40 truncate ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('payerUserId', {
      header: 'Paid by',
      cell: (info) => participant(info.getValue()),
      meta: { class: `w-28 ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('totalAmountCents', {
      header: 'Total',
      cell: (info) => money(info.getValue()),
      meta: { class: `w-32 text-right tabular-nums ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('owedAmountCents', {
      header: 'Your balance',
      cell: ({ row }) => yourBalance(row.original),
      meta: { class: 'w-36 text-right font-semibold tabular-nums' },
    }),
    ...(showStatus
      ? [
          columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) =>
              h(Badge, { class: ['border-transparent', STATUS_CLASS[info.getValue()]] }, () =>
                formatText(info.getValue()),
              ),
            meta: { class: `w-28 ${WIDE_ONLY}` },
          }),
        ]
      : []),
  ]
}
