import type { ConnectionRow, NewConnectionRow } from '../../database/schemas/connections.schema.js'
import { ConnectionCreationError } from './connection.error.js'
import type { ConnectionsRepository } from './connections.repository.js'

export type Connection = ConnectionRow

export class ConnectionsService {
  constructor(private readonly connectionsRepository: ConnectionsRepository) {}

  async create(data: NewConnectionRow): Promise<Connection | null> {
    const connection = await this.connectionsRepository.create(data)

    if (!connection) {
      throw new ConnectionCreationError()
    }

    return connection
  }
}
