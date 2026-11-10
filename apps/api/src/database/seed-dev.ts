import {
  type CategoryType,
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
  SPLIT_TYPE,
  type SplitType,
} from '@expense-tracker/contracts'
import { and, count, eq } from 'drizzle-orm'
import { createContainer } from '../container.js'
import { logger } from '../shared/logger/logger.js'
import { PasswordHasher } from '../shared/password-hasher.js'
import { db, pool } from './db.js'
import { sharedCategoriesMappingTable } from './schemas/index.js'
import { transactionsTable } from './schemas/transactions.schema.js'
import { usersTable } from './schemas/users.schema.js'

const DEV_PASSWORD = '12345678'

// Fixed ids so API clients (e.g. Bruno) can reference these users across database resets.
const DEV_USERS = [
  { id: '00000000-0000-4000-8000-000000000001', email: 'dev@email.com' },
  { id: '00000000-0000-4000-8000-000000000002', email: 'dev2@email.com' },
] as const

type SeedSharedExpense = {
  categoryName: string
  totalAmountCents: number
  split: SplitType
  description: string
}

type SeedTransaction = {
  categoryName: string
  categoryType: CategoryType
  amountCents: number
  description: string
}

const { HALF, FULL } = SPLIT_TYPE

function sharedExpense(
  categoryName: string,
  totalAmountCents: number,
  split: SplitType,
  description: string,
): SeedSharedExpense {
  return { categoryName, totalAmountCents, split, description }
}

// Personal categories that receive the transactions created by a shared expense.
const SHARED_CATEGORY_MAPPING: Record<string, string> = {
  Grocery: 'Groceries',
  'Eating Out': 'Eating Out',
  House: 'Housing',
  Other: 'Other',
}

// New expenses go at the end: the seed only creates what comes after the existing count.
const USER_A_SHARED_EXPENSES: SeedSharedExpense[] = [
  {
    categoryName: 'Grocery',
    totalAmountCents: 8_990,
    split: SPLIT_TYPE.HALF,
    description: 'Feira',
  },
  {
    categoryName: 'Eating Out',
    totalAmountCents: 6_000,
    split: SPLIT_TYPE.HALF,
    description: 'Jantar de sexta',
  },
  {
    categoryName: 'House',
    totalAmountCents: 9_000,
    split: SPLIT_TYPE.HALF,
    description: 'Conta de luz',
  },
  {
    categoryName: 'Other',
    totalAmountCents: 2_500,
    split: SPLIT_TYPE.FULL,
    description: 'Presente da sua mae',
  },
  sharedExpense('Grocery', 4_250, HALF, 'Padaria'),
  sharedExpense('Grocery', 12_380, HALF, 'Mercado da semana'),
  sharedExpense('Grocery', 3_190, HALF, 'Hortifruti'),
  sharedExpense('Grocery', 7_640, HALF, 'Acougue'),
  sharedExpense('Eating Out', 5_400, HALF, 'Pizza de domingo'),
  sharedExpense('Eating Out', 3_800, HALF, 'Cafe da manha fora'),
  sharedExpense('Eating Out', 9_200, HALF, 'Aniversario do amigo'),
  sharedExpense('House', 11_500, HALF, 'Conta de agua'),
  sharedExpense('House', 6_300, HALF, 'Produtos de limpeza'),
  sharedExpense('House', 4_900, HALF, 'Gas'),
  sharedExpense('House', 15_800, HALF, 'Conserto da torneira'),
  sharedExpense('Other', 2_990, HALF, 'Streaming'),
  sharedExpense('Other', 8_000, HALF, 'Farmacia'),
  sharedExpense('Other', 3_500, FULL, 'Uber que paguei pra voce'),
  sharedExpense('Other', 12_000, HALF, 'Presente de casamento'),
  sharedExpense('Other', 1_990, FULL, 'Cafe que paguei pra voce'),
]

const USER_B_SHARED_EXPENSES: SeedSharedExpense[] = [
  {
    categoryName: 'Grocery',
    totalAmountCents: 28_990,
    split: SPLIT_TYPE.HALF,
    description: 'Compras do mes',
  },
  {
    categoryName: 'Eating Out',
    totalAmountCents: 6_400,
    split: SPLIT_TYPE.FULL,
    description: 'Almoco que paguei pra voce',
  },
  {
    categoryName: 'House',
    totalAmountCents: 9_990,
    split: SPLIT_TYPE.HALF,
    description: 'Internet',
  },
  sharedExpense('House', 180_000, HALF, 'Aluguel'),
  sharedExpense('House', 42_000, HALF, 'Condominio'),
  sharedExpense('House', 23_900, HALF, 'Faxina'),
  sharedExpense('House', 8_900, FULL, 'Conta que paguei pra voce'),
  sharedExpense('House', 31_500, HALF, 'Manutencao do ar'),
  sharedExpense('House', 12_700, HALF, 'Enxoval'),
  sharedExpense('Grocery', 34_120, HALF, 'Compras do atacado'),
  sharedExpense('Grocery', 18_760, HALF, 'Mercado de sabado'),
  sharedExpense('Grocery', 6_450, FULL, 'Mercado que paguei pra voce'),
  sharedExpense('Grocery', 9_880, HALF, 'Feira de domingo'),
  sharedExpense('Grocery', 15_300, HALF, 'Bebidas'),
  sharedExpense('Grocery', 21_040, HALF, 'Compras online'),
  sharedExpense('Grocery', 5_670, HALF, 'Padaria da esquina'),
  sharedExpense('Eating Out', 16_800, HALF, 'Restaurante japones'),
  sharedExpense('Eating Out', 7_200, FULL, 'Jantar que paguei pra voce'),
  sharedExpense('Eating Out', 11_400, HALF, 'Churrascaria'),
  sharedExpense('Eating Out', 4_800, HALF, 'Hamburguer'),
  sharedExpense('Eating Out', 13_600, HALF, 'Almoco de sabado'),
  sharedExpense('Eating Out', 6_100, HALF, 'Delivery'),
  sharedExpense('Other', 25_000, HALF, 'Veterinario'),
  sharedExpense('Other', 9_900, HALF, 'Cinema'),
  sharedExpense('Other', 14_500, FULL, 'Remedio que paguei pra voce'),
  sharedExpense('Other', 38_000, HALF, 'Passagem de onibus'),
  sharedExpense('Other', 19_990, HALF, 'Assinatura anual'),
  sharedExpense('Other', 7_500, HALF, 'Presente da sobrinha'),
]

const PERSONAL_SEED_MARKER = 'Salario'

const USER_A_PERSONAL_TRANSACTIONS: SeedTransaction[] = [
  {
    categoryName: 'Salary',
    categoryType: 'income',
    amountCents: 850_000,
    description: PERSONAL_SEED_MARKER,
  },
  {
    categoryName: 'Freelance',
    categoryType: 'income',
    amountCents: 120_000,
    description: 'Projeto freelance',
  },
  {
    categoryName: 'Investments',
    categoryType: 'income',
    amountCents: 18_500,
    description: 'Dividendos',
  },
  {
    categoryName: 'Groceries',
    categoryType: 'expense',
    amountCents: 21_300,
    description: 'Mercado pessoal',
  },
  {
    categoryName: 'Groceries',
    categoryType: 'expense',
    amountCents: 8_750,
    description: 'Lanches da semana',
  },
  {
    categoryName: 'Eating Out',
    categoryType: 'expense',
    amountCents: 6_200,
    description: 'Almoco no trabalho',
  },
  { categoryName: 'Eating Out', categoryType: 'expense', amountCents: 4_500, description: 'Cafe' },
  {
    categoryName: 'Transport',
    categoryType: 'expense',
    amountCents: 25_000,
    description: 'Combustivel',
  },
  { categoryName: 'Transport', categoryType: 'expense', amountCents: 3_800, description: 'Uber' },
  {
    categoryName: 'Housing',
    categoryType: 'expense',
    amountCents: 15_900,
    description: 'Moveis do escritorio',
  },
  {
    categoryName: 'Healthcare',
    categoryType: 'expense',
    amountCents: 54_000,
    description: 'Plano de saude',
  },
  {
    categoryName: 'Healthcare',
    categoryType: 'expense',
    amountCents: 9_700,
    description: 'Remedios',
  },
  {
    categoryName: 'Entertainment',
    categoryType: 'expense',
    amountCents: 12_000,
    description: 'Show',
  },
  {
    categoryName: 'Entertainment',
    categoryType: 'expense',
    amountCents: 7_990,
    description: 'Jogo',
  },
  { categoryName: 'Shopping', categoryType: 'expense', amountCents: 32_990, description: 'Tenis' },
  {
    categoryName: 'Shopping',
    categoryType: 'expense',
    amountCents: 8_900,
    description: 'Camiseta',
  },
  {
    categoryName: 'Subscriptions',
    categoryType: 'expense',
    amountCents: 5_590,
    description: 'Musica',
  },
  {
    categoryName: 'Subscriptions',
    categoryType: 'expense',
    amountCents: 2_990,
    description: 'Armazenamento',
  },
  {
    categoryName: 'Travel',
    categoryType: 'expense',
    amountCents: 78_000,
    description: 'Passagem aerea',
  },
  { categoryName: 'Bills', categoryType: 'expense', amountCents: 11_900, description: 'Celular' },
  {
    categoryName: 'Savings',
    categoryType: 'expense',
    amountCents: 100_000,
    description: 'Reserva',
  },
  { categoryName: 'Other', categoryType: 'expense', amountCents: 4_000, description: 'Doacao' },
]

const PERSONAL_SEED_MONTHS = 3

async function ensureUser(
  container: ReturnType<typeof createContainer>,
  { id, email }: { id: string; email: string },
): Promise<{ id: string; email: string; created: boolean }> {
  const existing = await container.userService.findByEmail({ email })
  if (existing) {
    if (existing.id !== id) {
      throw new Error(
        `seed user ${email} already exists with id ${existing.id} instead of ${id}; reset the dev database`,
      )
    }
    return { id, email, created: false }
  }

  const passwordHash = await new PasswordHasher().hash(DEV_PASSWORD)
  await db.transaction(async (tx) => {
    await tx.insert(usersTable).values({
      id,
      email,
      passwordHash,
      currency: DEFAULT_USER_CURRENCY,
      locale: DEFAULT_USER_LOCALE,
      timeZone: DEFAULT_USER_TIME_ZONE,
    })
    await container.categoryService.createDefaultsForUser(id, tx)
  })

  return { id, email, created: true }
}

async function ensurePartnership(
  container: ReturnType<typeof createContainer>,
  inviter: { id: string; email: string },
  invitee: { id: string; email: string },
): Promise<'created' | 'exists'> {
  const inviterPartnership = await container.partnershipService.findPartnershipContext(inviter.id)
  if (inviterPartnership?.partnerId === invitee.id) {
    return 'exists'
  }
  if (inviterPartnership) {
    throw new Error(
      `seed user ${inviter.email} already has an active partnership with someone else`,
    )
  }

  const inviteePartnership = await container.partnershipService.findPartnershipContext(invitee.id)
  if (inviteePartnership) {
    throw new Error(
      `seed user ${invitee.email} already has an active partnership with someone else`,
    )
  }

  const { code } = await container.partnershipService.createLinkingCode(inviter.id)
  await container.partnershipService.createPartnership({
    inviteeId: invitee.id,
    code,
  })
  return 'created'
}

async function ensureSharedExpenses(
  container: ReturnType<typeof createContainer>,
  partnershipId: string,
  payerUserId: string,
  expenses: SeedSharedExpense[],
): Promise<'created' | 'exists'> {
  const { meta } = await container.sharedExpenseService.listReport({
    partnershipId,
    payerUserId,
    limit: 1,
  })
  const missingExpenses = expenses.slice(meta.total)
  if (missingExpenses.length === 0) {
    return 'exists'
  }

  const sharedCategories =
    await container.sharedCategoryService.findPartnershipSharedCategories(partnershipId)

  await container.sharedExpenseService.createMany({
    userId: payerUserId,
    expenses: missingExpenses.map(({ categoryName, ...expense }) => {
      const sharedCategory = sharedCategories.find(({ name }) => name === categoryName)
      if (!sharedCategory) {
        throw new Error(`seed shared category not found: ${categoryName}`)
      }
      return { ...expense, sharedCategoryId: sharedCategory.id }
    }),
  })
  return 'created'
}

async function ensureSharedCategoryMappings(
  container: ReturnType<typeof createContainer>,
  partnershipId: string,
  userId: string,
) {
  const sharedCategories =
    await container.sharedCategoryService.findPartnershipSharedCategories(partnershipId)
  const categories = await container.categoryService.findByType({
    userId,
    categoryType: 'expense',
  })

  for (const sharedCategory of sharedCategories) {
    const [mapped] = await db
      .select({ total: count() })
      .from(sharedCategoriesMappingTable)
      .where(
        and(
          eq(sharedCategoriesMappingTable.userId, userId),
          eq(sharedCategoriesMappingTable.sharedCategoryId, sharedCategory.id),
        ),
      )
    if (mapped?.total) continue

    const categoryName = SHARED_CATEGORY_MAPPING[sharedCategory.name]
    const category = categories.find(({ name }) => name === categoryName)
    if (!category) {
      throw new Error(`seed category not found: ${categoryName}`)
    }

    await container.sharedCategoryService.mapUserCategoryToShared({
      userId,
      partnershipId,
      userCategoryId: category.id,
      sharedCategoryId: sharedCategory.id,
    })
  }
}

// Noon UTC keeps the date in the same month for the dev time zone. The current month only gets
// days that already passed, so the transactions never land in the future.
function seedOccurredAt(now: Date, monthsAgo: number, index: number) {
  const month = now.getUTCMonth() - monthsAgo
  const lastDay = monthsAgo === 0 ? now.getUTCDate() : 28
  return new Date(Date.UTC(now.getUTCFullYear(), month, ((index * 3) % lastDay) + 1, 12))
}

async function ensurePersonalTransactions(
  container: ReturnType<typeof createContainer>,
  userId: string,
): Promise<'created' | 'exists'> {
  const [seeded] = await db
    .select({ total: count() })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.description, PERSONAL_SEED_MARKER),
      ),
    )
  if (seeded?.total) {
    return 'exists'
  }

  const categories = await container.categoryService.findAll({ userId })
  const now = new Date()

  for (let monthsAgo = 0; monthsAgo < PERSONAL_SEED_MONTHS; monthsAgo++) {
    for (const [index, seed] of USER_A_PERSONAL_TRANSACTIONS.entries()) {
      const category = categories.find(
        ({ name, categoryType }) =>
          name === seed.categoryName && categoryType === seed.categoryType,
      )
      if (!category) {
        throw new Error(`seed category not found: ${seed.categoryName}`)
      }

      await container.transactionService.create({
        userId,
        categoryId: category.id,
        amountCents: Math.round(seed.amountCents * (1 - monthsAgo * 0.08)),
        description: seed.description,
        occurredAt: seedOccurredAt(now, monthsAgo, index),
      })
    }
  }

  return 'created'
}

async function seedDev() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed-dev must not run in production')
  }

  const container = createContainer(db)

  try {
    logger.info('database.seed.started')

    const users = []
    for (const devUser of DEV_USERS) {
      const user = await ensureUser(container, devUser)
      users.push(user)
      logger.info(
        { email: user.email, created: user.created },
        user.created ? 'database.seed.user.created' : 'database.seed.user.exists',
      )
    }

    const [userA, userB] = users
    if (!userA || !userB) {
      throw new Error('expected two seed users')
    }

    const partnershipStatus = await ensurePartnership(container, userA, userB)
    logger.info(
      { inviter: userA.email, invitee: userB.email, status: partnershipStatus },
      partnershipStatus === 'created'
        ? 'database.seed.partnership.created'
        : 'database.seed.partnership.exists',
    )

    const partnership = await container.partnershipService.findPartnershipContext(userA.id)
    if (!partnership) {
      throw new Error('expected seed partnership to exist')
    }

    for (const user of users) {
      await ensureSharedCategoryMappings(container, partnership.id, user.id)
    }

    const seedExpenses = [
      { payer: userA, expenses: USER_A_SHARED_EXPENSES },
      { payer: userB, expenses: USER_B_SHARED_EXPENSES },
    ]
    for (const { payer, expenses } of seedExpenses) {
      const status = await ensureSharedExpenses(container, partnership.id, payer.id, expenses)
      logger.info(
        { payer: payer.email, count: expenses.length, status },
        status === 'created'
          ? 'database.seed.shared_expenses.created'
          : 'database.seed.shared_expenses.exists',
      )
    }

    const personalStatus = await ensurePersonalTransactions(container, userA.id)
    logger.info(
      { email: userA.email, status: personalStatus },
      personalStatus === 'created'
        ? 'database.seed.personal_transactions.created'
        : 'database.seed.personal_transactions.exists',
    )

    logger.info('database.seed.completed')
  } catch (err) {
    logger.error({ err }, 'database.seed.failed')
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

await seedDev()
