import bcrypt from 'bcrypt'

export class PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
