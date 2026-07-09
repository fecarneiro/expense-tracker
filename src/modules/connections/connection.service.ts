import type { ConnectionRow } from '../../database/schemas/connections.schema.js'

import type { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import type { GeneratedLinkingCode } from '../linking-codes/linking-code.types.js'
import { ConnectionCreationError } from './connection.error.js'
import type { ConnectionRepository } from './connection.repository.js'

export type Connection = ConnectionRow

export type CreateConnectionInput = {
  userId: string
  code: number
}

export type GenerateConnectionCodeInput = {
  userId: string
}

export class ConnectionService {
  constructor(
    private readonly connectionsRepository: ConnectionRepository,
    private readonly linkingCodeService: LinkingCodeService,
  ) {}

  async generateConnectionCode(data: GenerateConnectionCodeInput): Promise<GeneratedLinkingCode> {
    const generatedLinkingCode = await this.linkingCodeService.create({
      userId: data.userId,
      purpose: 'user_link',
    })

    return {
      code: generatedLinkingCode.code,
      createdAt: generatedLinkingCode.createdAt,
    }
  }

  async create(data: CreateConnectionInput): Promise<Connection | null> {
    const { userId: userIdFromCode } = await this.linkingCodeService.verify({
      code: data.code,
      purpose: 'user_link',
    })

    const connection = await this.connectionsRepository.create({
      userAId: userIdFromCode,
      userBId: data.userId,
    })

    if (!connection) {
      throw new ConnectionCreationError()
    }

    return connection
  }
}
