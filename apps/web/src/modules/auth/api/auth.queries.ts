import { useMutation } from '@tanstack/vue-query'
import { login } from './auth.api'

export function useLoginMutation() {
  return useMutation({ mutationFn: login })
}
