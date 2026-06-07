type NewTransactionMessage = {
  amountInCents: number
  categoryName: string
}

export function newTransactionParser(message: string): NewTransactionMessage {
  const [amount, ...rest] = message.split(' ')

  const amountInCents = Number(amount) * 100

  const categoryName = rest.join(' ').trim()

  return { amountInCents, categoryName }
}
