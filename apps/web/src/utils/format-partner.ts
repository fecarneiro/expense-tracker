export function formatParticipant(userId: string, currentUserId: string): string {
  return userId === currentUserId ? 'You' : 'Partner'
}
