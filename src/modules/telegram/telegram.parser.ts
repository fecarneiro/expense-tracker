type NewTransactionMessage = {
  amountInCents: number
  categoryName: string
}

export function parseNewTransactionMessage(
  message: string,
): NewTransactionMessage {
  const [amount, ...rest] = message.split(' ')

  const amountInCents = Number(amount)

  const categoryName = rest.join(' ').trim()

  return { amountInCents, categoryName }
}
