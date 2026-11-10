import { expect, test, vi } from 'vitest'
import type { BotContext } from '../../bot/bot.context.js'
import type { TransactionService } from '../transaction.service.js'
import { handleLastTransactions } from './last-transactions.handler.js'

test('shows the date of each transaction in the time zone of the user', async () => {
  const reply = vi.fn()
  const ctx = { userId: 'user', reply } as unknown as BotContext
  const transactionService = {
    findManyWithCategory: async () => ({
      data: [
        {
          occurredAt: '2026-11-01T01:00:00.000Z',
          transactionType: 'expense',
          amountCents: 1111,
          category: { name: 'Transport' },
        },
      ],
    }),
  } as unknown as TransactionService
  const userService = {
    getUserPreferences: async () => ({
      timeZone: 'America/Sao_Paulo',
      locale: 'pt-BR',
      currency: 'BRL',
    }),
  }

  await handleLastTransactions(ctx, transactionService, userService)

  expect(reply.mock.calls[0]?.[0]).toContain('Oct 31, 2026')
})
