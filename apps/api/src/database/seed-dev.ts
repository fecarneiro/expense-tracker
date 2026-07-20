import { createContainer } from '../container.js'
import { logger } from '../shared/logger/logger.js'
import { db, pool } from './db.js'

const DEV_PASSWORD = '12345678'

const DEV_USERS = ['dev@email.com', 'dev2@email.com'] as const

async function ensureUser(
  container: ReturnType<typeof createContainer>,
  email: string,
): Promise<{ id: string; email: string; created: boolean }> {
  const existing = await container.userService.findByEmail({ email })
  if (existing) {
    return { id: existing.id, email: existing.email, created: false }
  }

  const user = await container.authService.register({
    email,
    password: DEV_PASSWORD,
  })

  return { id: user.id, email: user.email, created: true }
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

async function seedDev() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed-dev must not run in production')
  }

  const container = createContainer(db)

  try {
    logger.info('database.seed.started')

    const users = []
    for (const email of DEV_USERS) {
      const user = await ensureUser(container, email)
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

    logger.info('database.seed.completed')
  } catch (err) {
    logger.error({ err }, 'database.seed.failed')
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

await seedDev()
