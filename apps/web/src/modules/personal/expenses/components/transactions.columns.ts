import type { TransactionResponse } from '@expense-tracker/contracts'
import { createColumnHelper } from '@tanstack/vue-table'
import { h } from 'vue'
import { formatText } from '@/shared/format/format-text'
import { WIDE_ONLY } from '@/shared/ui/data-table'

type ColumnOptions = {
  money: (cents: number) => string
  date: (value: string) => string
}

const columnHelper = createColumnHelper<TransactionResponse>()

export function createTransactionsColumns({ money, date }: ColumnOptions) {
  const amount = ({ transactionType, amountCents }: TransactionResponse) =>
    transactionType === 'income'
      ? h('span', { class: 'text-success-text' }, `+${money(amountCents)}`)
      : `−${money(amountCents)}`

  return [
    columnHelper.accessor('occurredAt', {
      header: 'Date',
      cell: (info) => date(info.getValue()),
      meta: { class: `text-muted-foreground w-24 tabular-nums ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => {
        const transaction = row.original
        const description = formatText(transaction.description)
        const details = `${date(transaction.occurredAt)}, ${formatText(transaction.category.name)}`

        return h('div', [
          description
            ? h('div', { class: '@3xl:truncate' }, description)
            : h('span', { class: 'text-muted-foreground' }, '—'),
          h('div', { class: 'text-muted-foreground mt-0.5 text-xs @3xl:hidden' }, details),
        ])
      },
      meta: { class: 'whitespace-normal' },
    }),
    columnHelper.accessor('category.name', {
      header: 'Category',
      cell: (info) => formatText(info.getValue()),
      meta: { class: `w-44 truncate ${WIDE_ONLY}` },
    }),
    columnHelper.accessor('amountCents', {
      header: 'Amount',
      cell: ({ row }) => amount(row.original),
      meta: { class: 'w-36 text-right font-semibold tabular-nums' },
    }),
  ]
}
